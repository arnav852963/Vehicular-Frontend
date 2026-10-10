import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildVehicle, GROUND_Y } from "./vehicleModels.js";
import { createCrashFx } from "./crashFx.js";
import {
    angleDelta,
    buildEnvironment,
    createBeamAlphaTexture,
    createGlowTexture,
    createLoop,
    createRenderer,
    createShadowBlobTexture,
    createMoonTexture,
    createSkyTexture,
    createSunRaysTexture,
    createSunTexture,
    disposeObject,
    prefersReducedMotion,
} from "./sceneKit.js";

const BASE_SPEED = 4.2; // world units / second at cruise
const BOOST_SPEED = 3.4; // speed multiplier while the user holds / drags
const DANGER_KMH = 100; // stay above this speed...
const DANGER_SECONDS = 10; // ...for this long and the vehicle crashes
const SPAN = 40; // half-length of the visible road
const SWAP_DISTANCE = 7; // how far off-screen a swapped-in vehicle starts
const CAM_BASE = new THREE.Vector3(4.6, 2.0, 5.7);
const CAM_TARGET = new THREE.Vector3(0, 0.75, 0);
const DEFAULT_ROT = { y: 0.42, x: 0.1 };

// Small deterministic RNG so the scenery looks identical on every mount.
const seeded = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const tint = (geo, hex) => {
    const c = new THREE.Color(hex);
    const count = geo.attributes.position.count;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) arr.set([c.r, c.g, c.b], i * 3);
    geo.setAttribute("color", new THREE.BufferAttribute(arr, 3));
    return geo;
};

const sphericalFromCamera = (az, el, radius) =>
    new THREE.Vector3(-Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(el) * Math.cos(az)).multiplyScalar(radius);

const VIEW_AZIMUTH = Math.atan2(CAM_BASE.x, CAM_BASE.z); // direction the camera looks (from -Z towards -X)
const deg = (d) => (d * Math.PI) / 180;

export const createRoadScene = ({ container, palette: P, type, onSpeed, onBoost, onDanger, onCrash }) => {
    const renderer = createRenderer(container);
    if (!renderer) return null;

    const reduced = prefersReducedMotion();
    const scene = new THREE.Scene();
    const glowTex = createGlowTexture();
    const beamAlpha = createBeamAlphaTexture();
    const blobTex = createShadowBlobTexture();
    const skyTex = createSkyTexture({ top: P.skyTop, mid: P.skyMid, horizon: P.horizon }, 0.25);
    const envTarget = buildEnvironment(renderer, P.env);

    scene.background = skyTex;
    scene.fog = new THREE.Fog(P.horizon, P.fogNear, P.fogFar);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = P.envIntensity;

    const camera = new THREE.PerspectiveCamera(38, 1.5, 0.1, 220);
    const world = new THREE.Group();
    scene.add(world);

    // ----- scrolling helper: periodic content is shifted by (distance mod period) -----
    const scrollers = [];
    const scroller = (period, k = 1) => {
        const group = new THREE.Group();
        world.add(group);
        scrollers.push({ group, period, k });
        return group;
    };
    const copiesFor = (period) => Math.ceil(SPAN / period) + 1;

    // ----- ground, road, markings -----
    const ground = new THREE.Mesh(
        new THREE.CircleGeometry(80, 48).rotateX(-Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: P.ground, roughness: 1 })
    );
    ground.position.y = GROUND_Y - 0.03;
    ground.receiveShadow = true;

    const road = new THREE.Mesh(
        new THREE.BoxGeometry(SPAN * 2.4, 0.06, 3.3),
        new THREE.MeshStandardMaterial({ color: P.road, roughness: 0.85, metalness: 0.05 })
    );
    road.position.y = GROUND_Y - 0.03;
    road.receiveShadow = true;
    world.add(ground, road);

    const edgeMat = new THREE.MeshBasicMaterial({ color: P.roadEdge, transparent: true, opacity: 0.55 });
    [-1, 1].forEach((s) => {
        const edge = new THREE.Mesh(new THREE.BoxGeometry(SPAN * 2.4, 0.008, 0.045), edgeMat);
        edge.position.set(0, GROUND_Y + 0.002, s * 1.46);
        world.add(edge);
    });

    // dashed centre line
    {
        const geos = [];
        const n = copiesFor(1.8) * 2 + 2;
        for (let i = -n; i <= n; i++) geos.push(new THREE.BoxGeometry(0.9, 0.008, 0.11).translate(i * 1.8, GROUND_Y + 0.002, 0));
        const dashes = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshBasicMaterial({ color: P.roadStripe, toneMapped: false }));
        geos.forEach((g) => g.dispose());
        scroller(1.8).add(dashes);
    }

    // guardrail beam + posts
    const railMat = new THREE.MeshStandardMaterial({ color: P.rail, metalness: 0.7, roughness: 0.35 });
    [-1, 1].forEach((s) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(SPAN * 2.4, 0.07, 0.035), railMat);
        rail.position.set(0, GROUND_Y + 0.14, s * 1.7);
        world.add(rail);
    });
    {
        const geos = [];
        const n = copiesFor(2) * 2 + 2;
        for (let i = -n; i <= n; i++)
            [-1, 1].forEach((s) => geos.push(new THREE.BoxGeometry(0.05, 0.2, 0.05).translate(i * 2, GROUND_Y + 0.07, s * 1.7)));
        const posts = new THREE.Mesh(mergeGeometries(geos), railMat);
        geos.forEach((g) => g.dispose());
        scroller(2).add(posts);
    }

    // ----- trees (one merged mesh) -----
    {
        const rnd = seeded(7);
        const geos = [];
        const period = 14;
        const addTree = (x, z) => {
            const s = (z > 0 ? 0.7 : 0.85) + rnd() * 0.5;
            const foliage = P.foliage[Math.floor(rnd() * P.foliage.length)];
            const parts = [
                tint(new THREE.CylinderGeometry(0.045, 0.065, 0.34, 6).translate(0, 0.17, 0), P.trunk),
                tint(new THREE.ConeGeometry(0.38, 0.62, 7).translate(0, 0.54, 0), foliage),
                tint(new THREE.ConeGeometry(0.29, 0.52, 7).translate(0, 0.84, 0), foliage),
                tint(new THREE.ConeGeometry(0.2, 0.42, 7).translate(0, 1.1, 0), foliage),
            ];
            parts.forEach((g) => {
                g.rotateY(rnd() * Math.PI);
                g.scale(s, s * (0.9 + rnd() * 0.3), s);
                g.translate(x, GROUND_Y, z);
                geos.push(g);
            });
        };
        const block = [];
        for (let i = 0; i < 4; i++) {
            block.push([(i + rnd() * 0.7) * (period / 4), 3.4 + rnd() * 1.0]);
            block.push([(i + 0.2 + rnd() * 0.7) * (period / 4), -(2.5 + rnd() * 1.1)]);
        }
        for (let c = -copiesFor(period); c <= copiesFor(period); c++) block.forEach(([x, z]) => addTree(x + c * period, z));
        const trees = new THREE.Mesh(
            mergeGeometries(geos),
            new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.85 })
        );
        geos.forEach((g) => g.dispose());
        scroller(period).add(trees);
    }

    // ----- mountains (slow parallax, snow caps) -----
    {
        const rnd = seeded(21);
        const geos = [];
        const period = 40;
        const far = new THREE.Color(P.mountainFar);
        const near = new THREE.Color(P.mountainNear);
        [-1, 1].forEach((side) => {
            for (let c = -copiesFor(period); c <= copiesFor(period); c++) {
                for (let i = 0; i < 5; i++) {
                    const x = c * period + (i + rnd() * 0.6) * (period / 5);
                    const z = side * (9.5 + rnd() * 5);
                    const r = 2.6 + rnd() * 1.8;
                    const h = 2 + rnd() * 1.6;
                    const body = new THREE.ConeGeometry(r, h, 5).rotateY(rnd() * Math.PI);
                    tint(body, far.clone().lerp(near, rnd()));
                    body.translate(x, GROUND_Y + h / 2 - 0.1, z);
                    const capH = h * 0.32;
                    const cap = new THREE.ConeGeometry(r * 0.32, capH, 5).rotateY(0);
                    tint(cap, P.mountainSnow);
                    cap.translate(x, GROUND_Y + h - 0.1 - capH / 2 + 0.01, z);
                    geos.push(body, cap);
                }
            }
        });
        const mountains = new THREE.Mesh(
            mergeGeometries(geos),
            new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 })
        );
        geos.forEach((g) => g.dispose());
        scroller(period, 0.12).add(mountains);
    }

    // ----- street lamps (lit at night, dormant by day) -----
    {
        const period = 7.2;
        const poleGeos = [];
        const headGeos = [];
        const poolGeos = [];
        const haloPositions = [];
        for (let c = -copiesFor(period); c <= copiesFor(period); c++) {
            const x = c * period;
            poleGeos.push(
                new THREE.CylinderGeometry(0.028, 0.04, 1.75, 8).translate(x, GROUND_Y + 0.875, -2.15),
                new THREE.BoxGeometry(0.03, 0.03, 0.95).translate(x, GROUND_Y + 1.74, -1.7)
            );
            headGeos.push(new THREE.BoxGeometry(0.2, 0.035, 0.12).translate(x, GROUND_Y + 1.71, -1.25));
            poolGeos.push(new THREE.PlaneGeometry(2.6, 2.6).rotateX(-Math.PI / 2).translate(x, GROUND_Y + 0.004, -0.9));
            haloPositions.push([x, GROUND_Y + 1.7, -1.25]);
        }
        const g = scroller(period);
        g.add(
            new THREE.Mesh(mergeGeometries(poleGeos), new THREE.MeshStandardMaterial({ color: P.lampPole, metalness: 0.6, roughness: 0.45 })),
            new THREE.Mesh(mergeGeometries(headGeos), new THREE.MeshBasicMaterial({ color: P.lampsOn ? P.lampLight : P.lampPole, toneMapped: false }))
        );
        if (P.lampsOn) {
            g.add(
                new THREE.Mesh(
                    mergeGeometries(poolGeos),
                    new THREE.MeshBasicMaterial({
                        map: glowTex,
                        color: P.lampLight,
                        transparent: true,
                        opacity: 0.38,
                        blending: THREE.AdditiveBlending,
                        depthWrite: false,
                        toneMapped: false,
                    })
                )
            );
            const haloMat = new THREE.SpriteMaterial({
                map: glowTex,
                color: P.lampLight,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                toneMapped: false,
            });
            haloPositions.forEach(([x, y, z]) => {
                const halo = new THREE.Sprite(haloMat);
                halo.position.set(x, y, z);
                halo.scale.setScalar(0.7);
                g.add(halo);
            });
        }
        [...poleGeos, ...headGeos, ...poolGeos].forEach((geo) => geo.dispose());
    }

    // ----- speed streaks -----
    const STREAKS = 56;
    const streakRnd = seeded(99);
    const streakData = Array.from({ length: STREAKS }, () => ({
        x: (streakRnd() - 0.5) * 20,
        y: -0.3 + streakRnd() * 2.7,
        z: (streakRnd() - 0.5) * 7,
        speed: 1.3 + streakRnd() * 1.1,
    }));
    const streakPositions = new Float32Array(STREAKS * 6);
    const streakGeo = new THREE.BufferGeometry();
    streakGeo.setAttribute("position", new THREE.BufferAttribute(streakPositions, 3));
    const streakMat = new THREE.LineBasicMaterial({
        color: P.streak,
        transparent: true,
        opacity: P.streakOpacity,
        blending: P.streakBlend === "additive" ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false,
    });
    const streaks = new THREE.LineSegments(streakGeo, streakMat);
    streaks.frustumCulled = false;
    world.add(streaks);

    // ----- sky: stars + moon at night, sun + clouds by day -----
    const sky = new THREE.Group();
    sky.position.copy(CAM_BASE);
    scene.add(sky);

    let starMat = null;
    const cloudPivot = new THREE.Group();
    sky.add(cloudPivot);

    // ----- moon (dusk) / sun (beige): both sit in the strip of sky just above the horizon,
    // slightly off-centre so they clear the HUD chips -----
    let sunRays = null;
    let celestialHalo = null;
    {
        const angular = (degrees) => 70 * deg(degrees); // world size of an angular diameter at 70 units
        const diameter = angular(P.isNight ? 7 : 8.5);
        const pos = sphericalFromCamera(VIEW_AZIMUTH + deg(P.isNight ? -8 : 8), deg(P.isNight ? 5.6 : 5), 70);

        const sprite = (map, scale, extra) => {
            const mat = new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, fog: false, toneMapped: false, ...extra });
            const obj = new THREE.Sprite(mat);
            obj.position.copy(pos);
            obj.scale.setScalar(scale);
            sky.add(obj);
            return obj;
        };

        celestialHalo = sprite(glowTex, diameter * (P.isNight ? 3.4 : 3.8), {
            color: P.celestialGlow,
            opacity: P.isNight ? 0.5 : 0.75,
            blending: P.isNight ? THREE.AdditiveBlending : THREE.NormalBlending,
        });
        if (!P.isNight) {
            sunRays = sprite(createSunRaysTexture(), diameter * 3.2, { opacity: 0.55, blending: THREE.AdditiveBlending });
        }
        sprite(P.isNight ? createMoonTexture(P.celestial) : createSunTexture(), diameter / 0.9, {});
    }

    if (P.isNight) {
        const rnd = seeded(5);
        const count = 110;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const v = sphericalFromCamera(VIEW_AZIMUTH + (rnd() - 0.5) * deg(100), deg(0.8 + rnd() * 8), 75);
            pos.set([v.x, v.y, v.z], i * 3);
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        starMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.8,
            sizeAttenuation: false,
            transparent: true,
            opacity: P.starOpacity,
            fog: false,
            depthWrite: false,
        });
        sky.add(new THREE.Points(geo, starMat));
    } else {
        const rnd = seeded(13);
        const cloudMat = new THREE.MeshBasicMaterial({ color: 0xfffaf0, transparent: true, opacity: 0.88, fog: false, depthWrite: false });
        const puff = new THREE.SphereGeometry(1, 14, 10);
        for (let i = 0; i < 7; i++) {
            const cloud = new THREE.Group();
            for (let j = 0; j < 4; j++) {
                const blob = new THREE.Mesh(puff, cloudMat);
                blob.position.set(j * 2.4 - 3.6 + rnd(), rnd() * 0.8, rnd() * 0.6);
                blob.scale.set(2.4 + rnd() * 1.4, 1.1 + rnd() * 0.6, 1.2);
                cloud.add(blob);
            }
            const az = VIEW_AZIMUTH + (i / 7 - 0.5) * deg(130) + (rnd() - 0.5) * deg(8);
            cloud.position.copy(sphericalFromCamera(az, deg(2.5 + rnd() * 5.5), 68));
            cloud.scale.setScalar(0.45 + rnd() * 0.35);
            cloudPivot.add(cloud);
        }
    }

    // ----- vehicle rigs: a vehicle + its contact shadow / underglow, swappable at runtime -----
    const textures = { glow: glowTex, beamAlpha };
    const sharedTextures = new Set([glowTex, beamAlpha, blobTex]);

    const createRig = (vehicleType) => {
        const vehicle = buildVehicle(vehicleType, P, textures);
        const root = new THREE.Group();
        // the pivot sits at the vehicle's centre so a crash can tumble it around its middle
        const cY = GROUND_Y + vehicle.size.y / 2;
        const pivot = new THREE.Group();
        pivot.position.y = cY;
        vehicle.group.position.y = vehicle.baseY - cY;
        pivot.add(vehicle.group);
        root.add(pivot);

        const blob = new THREE.Mesh(
            new THREE.PlaneGeometry(vehicle.size.x * 1.35, vehicle.size.z * 1.7).rotateX(-Math.PI / 2),
            new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity: P.shadowOpacity, depthWrite: false })
        );
        blob.position.y = GROUND_Y + 0.003;
        root.add(blob);

        let glow = null;
        if (P.underglowOpacity > 0) {
            glow = new THREE.Mesh(
                new THREE.PlaneGeometry(vehicle.size.x * 1.5, vehicle.size.z * 2.1).rotateX(-Math.PI / 2),
                new THREE.MeshBasicMaterial({
                    map: glowTex,
                    color: P.underglow,
                    transparent: true,
                    opacity: P.underglowOpacity,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    toneMapped: false,
                })
            );
            glow.position.y = GROUND_Y + 0.006;
            root.add(glow);
        }
        return { root, pivot, cY, vehicle, blob, glow };
    };

    let rig = createRig(type);
    world.add(rig.root);
    let currentType = type;
    let leaving = null; // { rig, fromX, t } - the previous vehicle driving away
    let entering = 1; // progress of the arriving vehicle (negative = waiting, 1 = arrived)
    let kick = 0; // short speed burst while swapping

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easeIn = (t) => t * t;
    const retire = (old) => {
        world.remove(old.root);
        disposeObject(old.root, sharedTextures);
    };

    /** Swap to another vehicle: the old one drives off ahead, the new one pulls in from behind. */
    const setType = (next) => {
        if (next === currentType) return;
        currentType = next;
        if (crashed) {
            restart();
            return;
        }
        if (leaving) retire(leaving.rig);
        leaving = { rig, fromX: rig.root.position.x, t: 0 };
        rig = createRig(next);
        rig.root.position.x = -SWAP_DISTANCE;
        world.add(rig.root);
        entering = -0.45; // brief delay so the old vehicle clears the lane first
        kick = 1;
    };

    // ----- lights -----
    scene.add(new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.hemiIntensity));

    const key = new THREE.DirectionalLight(P.keyColor, P.keyIntensity);
    key.position.set(...P.keyPos);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 24;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.02;
    scene.add(key);

    const rim = new THREE.DirectionalLight(P.rimColor, P.rimIntensity);
    rim.position.set(-7, 1.6, -1.5); // low + sideways: lights the edges without mirroring into the camera
    scene.add(rim);

    // ----- crash (hold above DANGER_KMH for DANGER_SECONDS) -----
    const crash = createCrashFx({ world, glowTex, palette: P, emit: (event) => onCrash?.(event) });
    let crashed = false;
    let overTime = 0;
    let lastDanger = -1;

    // ----- interaction -----
    const dom = renderer.domElement;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let targetY = DEFAULT_ROT.y;
    let targetX = DEFAULT_ROT.x;
    let returnAt = 0;
    let targetSpeed = reduced ? 0.7 : 1;
    let speedFactor = targetSpeed;
    let dist = 0;
    let lastKmh = -1;
    const cruise = targetSpeed;

    const setBoost = (on) => {
        targetSpeed = on ? BOOST_SPEED : cruise;
        onBoost?.(on);
    };
    const startCrash = () => {
        crashed = true;
        dragging = false;
        onBoost?.(false);
        if (leaving) {
            retire(leaving.rig);
            leaving = null;
        }
        entering = 1;
        rig.root.position.x = 0;
        targetSpeed = cruise;
        returnAt = 0; // bring the camera back to the hero angle so the crash is framed well
        crash.start(rig);
    };

    /** Reset everything and bring a fresh vehicle in as if the scene had just loaded. */
    const restart = () => {
        crash.reset();
        retire(rig);
        if (leaving) {
            retire(leaving.rig);
            leaving = null;
        }
        rig = createRig(currentType);
        rig.root.position.x = -SWAP_DISTANCE;
        world.add(rig.root);
        entering = -0.1;
        kick = 0.8;
        crashed = false;
        overTime = 0;
        lastDanger = -1;
        speedFactor = 0.25;
        targetSpeed = cruise;
        onCrash?.("none");
        onDanger?.(0);
    };

    const onDown = (e) => {
        if (crashed) {
            restart();
            return;
        }
        dragging = true;
        last = { x: e.clientX, y: e.clientY };
        try {
            dom.setPointerCapture?.(e.pointerId);
        } catch {
            /* capture is a nicety; ignore pointers the browser can't capture */
        }
        setBoost(true);
    };
    const onMove = (e) => {
        if (!dragging) return;
        targetY += (e.clientX - last.x) * 0.008;
        targetX = Math.max(-0.12, Math.min(0.4, targetX + (e.clientY - last.y) * 0.006));
        last = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e) => {
        if (!dragging) return;
        dragging = false;
        try {
            if (e?.pointerId !== undefined) dom.releasePointerCapture?.(e.pointerId);
        } catch {
            /* ignore */
        }
        returnAt = performance.now() / 1000 + 2.2;
        setBoost(false);
    };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("lostpointercapture", onUp);

    // ----- loop -----
    let baseFov = 38;
    const camPos = new THREE.Vector3();
    let shaken = false;
    const frame = (w, h) => {
        const aspect = w / h;
        camera.aspect = aspect;
        const pull = Math.min(Math.max(1.55 / aspect, 1), 1.7);
        camera.position.copy(CAM_TARGET).addScaledVector(new THREE.Vector3().subVectors(CAM_BASE, CAM_TARGET), pull);
        camPos.copy(camera.position);
        camera.lookAt(CAM_TARGET);
        camera.updateProjectionMatrix();
    };

    const wrapStreak = (s, tailLen) => {
        if (s.x + tailLen < -10) s.x += 20;
    };

    const loop = createLoop({
        renderer,
        container,
        onResize: frame,
        update: (realDt, now) => {
            const fx = crash.update(realDt, now);
            const dt = realDt * fx.timeScale; // slow-motion during the crash

            if (!crashed) {
                // sustained overspeed -> crash
                overTime = 48 * speedFactor > DANGER_KMH ? overTime + realDt : 0;
                const q = Math.round(Math.min(1, overTime / DANGER_SECONDS) * 20) / 20;
                if (q !== lastDanger) {
                    lastDanger = q;
                    onDanger?.(q);
                }
                if (overTime >= DANGER_SECONDS) startCrash();
            }

            if (!crashed) {
                kick = Math.max(0, kick - dt * 1.4);
                speedFactor += (Math.max(targetSpeed, 1 + kick * 1.8) - speedFactor) * (1 - Math.exp(-dt * 4.5));
            }
            const eff = crashed ? speedFactor * fx.scroll : speedFactor;
            const v = BASE_SPEED * eff;
            dist += v * dt;

            scrollers.forEach(({ group, period, k }) => {
                group.position.x = -((dist * k) % period);
            });

            // swap transition
            if (entering < 1) {
                entering = Math.min(1, entering + dt / 1.0);
                rig.root.position.x = -SWAP_DISTANCE * (1 - easeOut(Math.max(0, entering)));
            }
            if (leaving) {
                leaving.t = Math.min(1, leaving.t + dt / 0.6);
                leaving.rig.root.position.x = leaving.fromX + (SWAP_DISTANCE + 2) * easeIn(leaving.t);
                if (leaving.t >= 1) {
                    retire(leaving.rig);
                    leaving = null;
                }
            }

            // wheels + suspension (bob + squat under acceleration)
            const boost = THREE.MathUtils.clamp((eff - 1) / (BOOST_SPEED - 1), 0, 1);
            const rigs = leaving ? [rig, leaving.rig] : [rig];
            rigs.forEach((r) => {
                const { vehicle } = r;
                vehicle.wheels.forEach((w) => {
                    w.spin.rotation.z -= (v * dt) / w.radius;
                });
                if (crashed && r === rig) return; // the crash drives the pose
                vehicle.group.position.y = vehicle.baseY - r.cY + Math.sin(now * (8 + eff * 4)) * 0.004 * (0.4 + boost * 1.4);
                vehicle.group.rotation.z = boost * 0.018;
            });

            // camera orbit with smooth return to the hero angle
            if (!dragging && now > returnAt) {
                const k = 1 - Math.exp(-dt * 1.4);
                targetY += angleDelta(targetY, DEFAULT_ROT.y) * k;
                targetX += (DEFAULT_ROT.x - targetX) * k;
            }
            const sway = reduced || dragging ? 0 : Math.sin(now * 0.35) * 0.05;
            const follow = 1 - Math.exp(-dt * 7);
            world.rotation.y += (targetY + sway - world.rotation.y) * follow;
            world.rotation.x += (targetX - world.rotation.x) * follow;

            const fov = (reduced ? baseFov : baseFov + boost * 4.5) + fx.fov;
            if (Math.abs(fov - camera.fov) > 0.01) {
                camera.fov = fov;
                camera.updateProjectionMatrix();
            }

            // streaks
            const tailLen = 0.14 + boost * 0.9;
            for (let i = 0; i < STREAKS; i++) {
                const s = streakData[i];
                s.x -= v * dt * s.speed;
                wrapStreak(s, tailLen);
                streakPositions.set([s.x, s.y, s.z, s.x + tailLen, s.y, s.z], i * 6);
            }
            streakGeo.attributes.position.needsUpdate = true;
            streakMat.opacity = P.streakOpacity * (0.55 + boost * 0.9);

            if (starMat) starMat.opacity = P.starOpacity * (0.82 + Math.sin(now * 1.3) * 0.18);
            if (!reduced) cloudPivot.rotation.y += dt * 0.004;
            if (sunRays && !reduced) sunRays.material.rotation += realDt * 0.05;
            if (celestialHalo) celestialHalo.material.opacity = (P.isNight ? 0.5 : 0.75) * (0.92 + Math.sin(now * 0.9) * 0.08);

            const kmh = Math.round(48 * eff);
            if (kmh !== lastKmh) {
                lastKmh = kmh;
                onSpeed?.(kmh);
            }

            // camera shake: rattles as the danger timer fills, then the big crash hit
            const dangerShake = !crashed && lastDanger > 0.3 ? 0.004 + 0.022 * lastDanger * lastDanger : 0;
            const shakeAmp = (fx.shake + dangerShake) * (reduced ? 0.35 : 1);
            if (shakeAmp > 0.0005) {
                camera.position.set(
                    camPos.x + (Math.random() - 0.5) * shakeAmp,
                    camPos.y + (Math.random() - 0.5) * shakeAmp,
                    camPos.z + (Math.random() - 0.5) * shakeAmp
                );
                camera.lookAt(CAM_TARGET);
                shaken = true;
            } else if (shaken) {
                camera.position.copy(camPos);
                camera.lookAt(CAM_TARGET);
                shaken = false;
            }

            renderer.render(scene, camera);
        },
    });

    return {
        setType,
        restart,
        dispose: () => {
            loop.dispose();
            dom.removeEventListener("pointerdown", onDown);
            dom.removeEventListener("pointermove", onMove);
            dom.removeEventListener("pointerup", onUp);
            dom.removeEventListener("pointercancel", onUp);
            dom.removeEventListener("lostpointercapture", onUp);
            disposeObject(scene);
            [glowTex, beamAlpha, blobTex, skyTex].forEach((t) => t.dispose());
            envTarget.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            dom.remove();
        },
    };
};
