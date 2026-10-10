import * as THREE from "three";
import { GROUND_Y } from "./vehicleModels.js";
import { disposeObject } from "./sceneKit.js";

// Scripted, lightweight "rigid body" crash for the road scene.
//
//   wobble  -> the vehicle fishtails and smokes its tyres (build-up)
//   swerve  -> it veers into the guard rail
//   tumble  -> impact: sparks, wheels fly off, slow-motion flip across the road
//   wreck   -> it settles, emergency lights flash, smoke keeps rising
//
// `update()` returns how the host scene should react (scroll speed, camera shake,
// fov punch and a time scale for slow-motion).

const GRAVITY = 9.5;
const RAIL_Z = 1.62; // inner face of the guard rail
const NEUTRAL = Object.freeze({ scroll: 1, shake: 0, fov: 0, timeScale: 1 });

const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (t) => {
    const c = Math.min(1, Math.max(0, t));
    return c * c * (3 - 2 * c);
};

export const createCrashFx = ({ world, glowTex, palette: P, emit }) => {
    // ----- particle pools (sprites so each particle can fade on its own) -----
    const makePool = (count, material) =>
        Array.from({ length: count }, () => {
            const sprite = new THREE.Sprite(material());
            sprite.visible = false;
            world.add(sprite);
            return { sprite, life: 0, max: 1, vel: new THREE.Vector3(), size: 0.1, grow: 0, gravity: 0, opacity: 1 };
        });

    const sparks = makePool(56, () =>
        new THREE.SpriteMaterial({
            map: glowTex,
            color: 0xffb83d,
            transparent: true,
            blending: P.isNight ? THREE.AdditiveBlending : THREE.NormalBlending,
            depthWrite: false,
            toneMapped: false,
            fog: false,
        })
    );
    const smoke = makePool(40, () =>
        new THREE.SpriteMaterial({
            map: glowTex,
            color: P.isNight ? 0x6b7280 : 0x57534e,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
        })
    );

    const spawn = (pool, pos, vel, { life, size, grow = 0, gravity = 0, opacity = 1 }) => {
        const p = pool.find((q) => q.life <= 0);
        if (!p) return;
        p.life = p.max = life;
        p.vel.copy(vel);
        p.size = size;
        p.grow = grow;
        p.gravity = gravity;
        p.opacity = opacity;
        p.sprite.position.copy(pos);
        p.sprite.scale.setScalar(size);
        p.sprite.material.opacity = opacity;
        p.sprite.visible = true;
    };

    const stepPool = (pool, dt) => {
        pool.forEach((p) => {
            if (p.life <= 0) return;
            p.life -= dt;
            if (p.life <= 0) {
                p.sprite.visible = false;
                return;
            }
            p.vel.y -= p.gravity * dt;
            p.sprite.position.addScaledVector(p.vel, dt);
            p.size += p.grow * dt;
            p.sprite.scale.setScalar(p.size);
            p.sprite.material.opacity = p.opacity * (p.life / p.max);
        });
    };

    const burst = (pos, count, speed) => {
        for (let i = 0; i < count; i++) {
            spawn(
                sparks,
                pos,
                new THREE.Vector3(rand(-1, 1) * speed, rand(0.2, 1) * speed, rand(-1, 1) * speed),
                { life: rand(0.35, 0.9), size: rand(0.1, 0.22), gravity: 8 }
            );
        }
    };

    const puff = (pos, { size = 0.45, life = 2, up = 0.9, opacity = 0.55 } = {}) =>
        spawn(smoke, pos, new THREE.Vector3(rand(-0.25, 0.35), up * rand(0.7, 1.2), rand(-0.3, 0.3)), {
            life,
            size,
            grow: 0.6,
            opacity,
        });

    // ----- emergency lights (created up-front so the shader never recompiles mid-crash) -----
    const redLight = new THREE.PointLight(0xff2a3d, 0, 7);
    const blueLight = new THREE.PointLight(0x2f7bff, 0, 7);
    const beacon = (color) =>
        new THREE.Sprite(
            new THREE.SpriteMaterial({
                map: glowTex,
                color,
                transparent: true,
                opacity: 0,
                blending: P.isNight ? THREE.AdditiveBlending : THREE.NormalBlending,
                depthWrite: false,
                toneMapped: false,
                fog: false,
            })
        );
    const redBeacon = beacon(0xff2a3d);
    const blueBeacon = beacon(0x2f7bff);
    redBeacon.scale.setScalar(1.3);
    blueBeacon.scale.setScalar(1.3);
    world.add(redLight, blueLight, redBeacon, blueBeacon);

    // ----- crash state -----
    let state = "idle";
    let rig = null;
    let t = 0; // real seconds since start
    let impactAt = 0;
    let settledEmitted = false;
    let smokeTimer = 0;
    let dims = { hx: 1.6, hy: 0.6, hz: 0.75 };
    const p = { x: 0, z: 0, vx: 0, vz: 0, h: 0, vh: 0, yaw: 0, roll: 0, pitch: 0, wy: 0, wr: 0, wp: 0 };
    let bounceShake = 0;
    let flying = [];

    const extent = () => {
        const cr = Math.abs(Math.cos(p.roll));
        const sr = Math.abs(Math.sin(p.roll));
        const cp = Math.abs(Math.cos(p.pitch));
        const sp = Math.abs(Math.sin(p.pitch));
        return dims.hy * cr * cp + dims.hz * sr + dims.hx * sp;
    };

    const apply = () => {
        rig.root.position.x = p.x;
        rig.root.position.z = p.z;
        rig.pivot.rotation.set(p.roll, p.yaw, p.pitch, "YXZ");
        rig.pivot.position.y = GROUND_Y + extent() + p.h;
    };

    const detachWheels = () => {
        const wheels = rig.vehicle.wheels;
        const picks = wheels.length >= 4 ? [1, Math.floor(wheels.length * 0.7)] : [Math.min(1, wheels.length - 1)];
        [...new Set(picks)].forEach((i) => {
            const obj = wheels[i].spin.parent;
            world.attach(obj);
            flying.push({
                obj,
                r: wheels[i].radius,
                vel: new THREE.Vector3(p.vx * 0.8 + rand(0.8, 3), rand(2.2, 4.2), p.vz * 0.8 + rand(-1, 2)),
                spin: new THREE.Vector3(rand(-9, 9), rand(-9, 9), rand(-9, 9)),
                settle: 0,
                flat: new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, rand(0, Math.PI), 0)),
            });
        });
    };

    const stepWheels = (dt) => {
        flying.forEach((f) => {
            f.vel.y -= GRAVITY * dt;
            f.obj.position.addScaledVector(f.vel, dt);
            f.obj.rotateX(f.spin.x * dt);
            f.obj.rotateY(f.spin.y * dt);
            f.obj.rotateZ(f.spin.z * dt);
            const ground = GROUND_Y + THREE.MathUtils.lerp(f.r * 0.55, 0.12, Math.min(1, f.settle));
            if (f.obj.position.y < ground) {
                f.obj.position.y = ground;
                if (f.vel.y < -0.8) {
                    f.vel.y *= -0.45;
                    f.vel.x *= 0.7;
                    f.vel.z *= 0.7;
                    f.spin.multiplyScalar(0.6);
                } else {
                    f.vel.y = 0;
                }
                f.vel.x *= Math.exp(-2 * dt);
                f.vel.z *= Math.exp(-2 * dt);
                f.spin.multiplyScalar(Math.exp(-2.5 * dt));
                f.settle += dt * 0.8;
                f.obj.quaternion.slerp(f.flat, 1 - Math.exp(-dt * 3 * f.settle));
            }
        });
    };

    const start = (target) => {
        rig = target;
        const { size } = rig.vehicle;
        dims = { hx: size.x / 2, hy: size.y / 2, hz: size.z / 2 };
        Object.assign(p, { x: rig.root.position.x, z: 0, vx: 0, vz: 0, h: 0, vh: 0, yaw: 0, roll: 0, pitch: 0, wy: 0, wr: 0, wp: 0 });
        state = "wobble";
        t = 0;
        settledEmitted = false;
        smokeTimer = 0;
        bounceShake = 0;
    };

    const impact = () => {
        state = "tumble";
        impactAt = t;
        const ext = dims.hz * Math.cos(p.yaw) + dims.hx * Math.abs(Math.sin(p.yaw));
        p.z = -RAIL_Z + ext;
        p.vz = 1.0;
        p.vx = 1.5;
        p.vh = 2.7;
        p.wr = 7.0;
        p.wp = 0.7;
        p.wy = 2.2;
        burst(new THREE.Vector3(p.x + dims.hx * 0.45, GROUND_Y + 0.28, -RAIL_Z), 40, 4.2);
        detachWheels();
        if (rig.glow) rig.glow.visible = false;
        emit?.("impact");
    };

    const update = (realDt, now) => {
        stepPool(sparks, realDt);
        stepPool(smoke, realDt);
        if (state === "idle") return NEUTRAL;

        t += realDt;
        const since = t - impactAt;
        const afterImpact = state === "tumble" || state === "wreck";
        const timeScale = afterImpact ? 0.28 + 0.72 * smooth(since / 1.7) : 1;
        const dt = realDt * timeScale;
        let scroll = 1;
        let shake = 0;
        let fov = 0;

        if (state === "wobble") {
            const ramp = Math.min(1, t / 0.5);
            p.yaw = Math.sin(t * 24) * 0.1 * ramp;
            p.z = Math.sin(t * 17) * 0.13 * ramp;
            smokeTimer -= realDt;
            if (smokeTimer <= 0) {
                smokeTimer = 0.05;
                [-1, 1].forEach((s) =>
                    puff(new THREE.Vector3(p.x - dims.hx * 0.6, GROUND_Y + 0.12, p.z + s * dims.hz * 0.8), { size: 0.3, life: 0.9, up: 0.4, opacity: 0.5 })
                );
            }
            shake = 0.02 + 0.03 * ramp;
            if (t >= 0.5) state = "swerve";
        } else if (state === "swerve") {
            p.z -= 3.4 * dt;
            p.yaw = Math.min(0.72, p.yaw + 3.2 * dt);
            p.roll = -0.1;
            shake = 0.05;
            const ext = dims.hz * Math.cos(p.yaw) + dims.hx * Math.abs(Math.sin(p.yaw));
            if (p.z - ext <= -RAIL_Z) impact();
        } else {
            // tumble / wreck
            scroll = Math.exp(-since * 2.2);
            p.vh -= GRAVITY * dt;
            p.h += p.vh * dt;
            p.x = THREE.MathUtils.clamp(p.x + p.vx * dt, -1.5, 2.6);
            p.z += p.vz * dt;
            if (p.z > 0.8 || p.z < -1.0) {
                p.z = THREE.MathUtils.clamp(p.z, -1.0, 0.8);
                p.vz *= -0.5;
            }

            const onGround = p.h <= 0;
            if (onGround) {
                p.h = 0;
                if (p.vh < -0.9) {
                    p.vh *= -0.42;
                    p.wr *= 0.65;
                    p.wp *= 0.65;
                    p.wy *= 0.65;
                    p.vx *= 0.75;
                    p.vz *= 0.75;
                    bounceShake = 0.14;
                    burst(new THREE.Vector3(p.x, GROUND_Y + 0.15, p.z), 12, 2.4);
                } else {
                    p.vh = 0;
                }
            }
            const drag = Math.exp(-(onGround ? 3 : 0.4) * dt);
            p.wr *= drag;
            p.wp *= drag;
            p.wy *= drag;
            p.vx *= Math.exp(-1.2 * dt);
            p.vz *= Math.exp(-1.2 * dt);
            p.roll += p.wr * dt;
            p.pitch += p.wp * dt;
            p.yaw += p.wy * dt;

            // come to rest on the roof / wheels rather than in an odd half-tilt
            if (onGround && Math.abs(p.wr) + Math.abs(p.wp) < 2.5) {
                const k = 1 - Math.exp(-dt * 4);
                p.roll += (Math.round(p.roll / Math.PI) * Math.PI - p.roll) * k;
                p.pitch += Math.atan2(Math.sin(-p.pitch), Math.cos(-p.pitch)) * k;
            }

            smokeTimer -= realDt;
            if (smokeTimer <= 0 && since < 6) {
                smokeTimer = 0.11;
                puff(new THREE.Vector3(p.x + dims.hx * 0.3, GROUND_Y + extent() + p.h, p.z), { size: 0.5, life: 2.4 });
            }

            bounceShake *= Math.exp(-realDt * 6);
            shake = 0.34 * Math.exp(-since * 3.5) + bounceShake;
            fov = 7 * Math.exp(-since * 3);
            stepWheels(dt);

            const settled = state === "tumble" && p.h === 0 && Math.abs(p.wr) + Math.abs(p.wp) + Math.abs(p.wy) < 0.6;
            if (state === "tumble" && (settled || since > 3.6)) {
                state = "wreck";
                p.wr = p.wp = p.wy = 0;
            }
            if (state === "wreck" && !settledEmitted && since > 1.4) {
                settledEmitted = true;
                emit?.("settled");
            }
        }

        apply();

        // emergency flashers once the wreck is down
        if (state === "wreck") {
            const phase = Math.sin(now * 11);
            const y = GROUND_Y + extent() + 0.9;
            redLight.position.set(p.x - 0.6, y, p.z + 0.4);
            blueLight.position.set(p.x + 0.6, y, p.z - 0.4);
            redLight.intensity = Math.max(0, phase) * (P.isNight ? 14 : 6);
            blueLight.intensity = Math.max(0, -phase) * (P.isNight ? 14 : 6);
            redBeacon.position.copy(redLight.position);
            blueBeacon.position.copy(blueLight.position);
            redBeacon.material.opacity = Math.max(0, phase) * (P.isNight ? 0.95 : 0.8);
            blueBeacon.material.opacity = Math.max(0, -phase) * (P.isNight ? 0.95 : 0.8);
        }

        return { scroll, shake, fov, timeScale };
    };

    const reset = () => {
        state = "idle";
        rig = null;
        flying.forEach((f) => {
            world.remove(f.obj);
            disposeObject(f.obj);
        });
        flying = [];
        [...sparks, ...smoke].forEach((q) => {
            q.life = 0;
            q.sprite.visible = false;
        });
        redLight.intensity = 0;
        blueLight.intensity = 0;
        redBeacon.material.opacity = 0;
        blueBeacon.material.opacity = 0;
    };

    return {
        start,
        update,
        reset,
        get active() {
            return state !== "idle";
        },
    };
};
