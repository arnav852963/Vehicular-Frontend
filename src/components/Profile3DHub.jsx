import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";
import { getPalette } from "./3dModels/scenePalettes.js";
import {
    buildEnvironment,
    createGlowTexture,
    createLoop,
    createRadialBackdrop,
    createRenderer,
    disposeObject,
    prefersReducedMotion,
} from "./3dModels/sceneKit.js";

const createProfileScene = ({ container, palette, onPulse }) => {
    const renderer = createRenderer(container);
    if (!renderer) return null;

    const P = palette;
    const C = P.profile;
    const reduced = prefersReducedMotion();
    const scene = new THREE.Scene();
    const glowTex = createGlowTexture();
    const backdrop = createRadialBackdrop(C.bgInner, C.bgOuter);
    const envTarget = buildEnvironment(renderer, P.env);

    scene.background = backdrop;
    scene.environment = envTarget.texture;
    scene.environmentIntensity = P.isNight ? 0.7 : 0.9;

    const camera = new THREE.PerspectiveCamera(40, 2, 0.1, 100);
    const orb = new THREE.Group();
    scene.add(orb);

    const additive = P.isNight ? THREE.AdditiveBlending : THREE.NormalBlending;

    // soft halo behind everything
    const halo = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: glowTex,
            color: C.glow,
            transparent: true,
            opacity: C.glowOpacity,
            blending: additive,
            depthWrite: false,
            toneMapped: false,
        })
    );
    halo.scale.setScalar(5.2);
    halo.position.z = -1.2;
    scene.add(halo);

    // faceted gem core + wire shell
    const core = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.62, 0),
        new THREE.MeshStandardMaterial({
            color: C.core,
            emissive: C.coreEmissive,
            emissiveIntensity: 0.55,
            metalness: 0.55,
            roughness: 0.18,
            flatShading: true,
        })
    );
    const shell = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.95, 1)),
        new THREE.LineBasicMaterial({ color: C.shell, transparent: true, opacity: 0.75, toneMapped: false })
    );
    const shellFill = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.95, 1),
        new THREE.MeshBasicMaterial({
            color: C.shell,
            transparent: true,
            opacity: P.isNight ? 0.07 : 0.1,
            depthWrite: false,
            side: THREE.DoubleSide,
        })
    );
    orb.add(core, shell, shellFill);

    // orbit rings with nodes riding on them
    const makeRing = (radius, tube, color, tiltX, tiltY) => {
        const pivot = new THREE.Group();
        pivot.rotation.set(tiltX, tiltY, 0);
        const spin = new THREE.Group();
        pivot.add(spin);
        spin.add(
            new THREE.Mesh(
                new THREE.TorusGeometry(radius, tube, 12, 96),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, toneMapped: false })
            )
        );
        orb.add(pivot);
        return { spin, radius };
    };
    const ringA = makeRing(1.35, 0.018, C.ringA, Math.PI / 2.6, 0.2);
    const ringB = makeRing(1.62, 0.012, C.ringB, -Math.PI / 3.2, -0.35);

    const nodeGeo = new THREE.SphereGeometry(0.07, 20, 20);
    const nodeMat = new THREE.MeshBasicMaterial({ color: C.node, toneMapped: false });
    const nodeHaloMat = new THREE.SpriteMaterial({
        map: glowTex,
        color: C.node,
        transparent: true,
        opacity: 0.9,
        blending: additive,
        depthWrite: false,
        toneMapped: false,
    });
    [
        [ringA, 0],
        [ringA, Math.PI],
        [ringB, Math.PI / 2],
        [ringB, (3 * Math.PI) / 2],
    ].forEach(([ring, angle]) => {
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, 0);
        const nodeHalo = new THREE.Sprite(nodeHaloMat);
        nodeHalo.scale.setScalar(0.5);
        node.add(nodeHalo);
        ring.spin.add(node);
    });

    // floating particles (round, soft)
    const COUNT = 110;
    const positions = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        const r = 1.7 + Math.random() * 1.6;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        positions.set(
            [r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) * 0.8, r * Math.sin(phi) * Math.sin(theta)],
            i * 3
        );
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({
            map: glowTex,
            size: 0.1,
            color: C.particle,
            transparent: true,
            opacity: 0.85,
            blending: additive,
            depthWrite: false,
            toneMapped: false,
        })
    );
    scene.add(particles);

    // expanding scan pulse under the orb
    const pulseMat = new THREE.MeshBasicMaterial({
        color: C.ringB,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
    });
    const pulse = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 96).rotateX(-Math.PI / 2), pulseMat);
    pulse.position.y = -1.45;
    scene.add(pulse);

    // lights
    scene.add(new THREE.HemisphereLight(P.hemiSky, P.hemiGround, P.isNight ? 0.9 : 0.8));
    const key = new THREE.DirectionalLight(P.keyColor, P.isNight ? 1.6 : 1.4);
    key.position.set(3, 4, 5);
    scene.add(key);
    const inner = new THREE.PointLight(C.core, P.isNight ? 6 : 3, 5);
    inner.position.set(0, 0, 1.4);
    scene.add(inner);

    // interaction
    const dom = renderer.domElement;
    let dragging = false;
    let last = { x: 0, y: 0 };
    let targetY = 0;
    let targetX = 0.1;
    let spin = 1;
    let returnAt = 0;

    const onDown = (e) => {
        dragging = true;
        spin = 3.5;
        last = { x: e.clientX, y: e.clientY };
        dom.setPointerCapture?.(e.pointerId);
        onPulse?.(true);
    };
    const onMove = (e) => {
        if (!dragging) return;
        targetY += (e.clientX - last.x) * 0.01;
        targetX = THREE.MathUtils.clamp(targetX + (e.clientY - last.y) * 0.01, -0.9, 0.9);
        last = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e) => {
        if (!dragging) return;
        dragging = false;
        spin = reduced ? 0.5 : 1;
        if (e?.pointerId !== undefined) dom.releasePointerCapture?.(e.pointerId);
        returnAt = performance.now() / 1000 + 1.6;
        onPulse?.(false);
    };
    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    dom.addEventListener("lostpointercapture", onUp);
    if (reduced) spin = 0.5;

    let pulseT = 0;
    const loop = createLoop({
        renderer,
        container,
        onResize: (w, h) => {
            camera.aspect = w / h;
            camera.position.set(0, 0, 4.4 * Math.max(1, 1.9 / (w / h)));
            camera.updateProjectionMatrix();
        },
        update: (dt, now) => {
            if (!dragging) {
                targetY += 0.45 * spin * dt;
                if (now > returnAt) targetX += (0.1 - targetX) * (1 - Math.exp(-dt * 1.2));
            }
            const follow = 1 - Math.exp(-dt * 6);
            orb.rotation.y += (targetY - orb.rotation.y) * follow;
            orb.rotation.x += (targetX - orb.rotation.x) * follow;

            core.rotation.y += dt * 0.6 * spin;
            core.rotation.x += dt * 0.35 * spin;
            shell.rotation.y -= dt * 0.25 * spin;
            shellFill.rotation.copy(shell.rotation);
            ringA.spin.rotation.z += dt * 0.7 * spin;
            ringB.spin.rotation.z -= dt * 0.9 * spin;
            particles.rotation.y += dt * 0.05 * spin;

            const breathe = 1 + Math.sin(now * 2.2) * 0.035;
            core.scale.setScalar(breathe);
            halo.material.opacity = C.glowOpacity * (0.85 + Math.sin(now * 1.6) * 0.15 + (spin > 1.5 ? 0.25 : 0));
            core.material.emissiveIntensity = 0.45 + Math.sin(now * 2.2) * 0.12 + (spin > 1.5 ? 0.35 : 0);

            pulseT = (pulseT + dt * (spin > 1.5 ? 0.9 : 0.35)) % 1;
            pulse.scale.setScalar(1.1 + pulseT * 1.4);
            pulseMat.opacity = (1 - pulseT) * 0.4;

            renderer.render(scene, camera);
        },
    });

    return {
        dispose: () => {
            loop.dispose();
            dom.removeEventListener("pointerdown", onDown);
            dom.removeEventListener("pointermove", onMove);
            dom.removeEventListener("pointerup", onUp);
            dom.removeEventListener("pointercancel", onUp);
            dom.removeEventListener("lostpointercapture", onUp);
            disposeObject(scene);
            glowTex.dispose();
            backdrop.dispose();
            envTarget.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            dom.remove();
        },
    };
};

export const Profile3DHub = ({ userInfo }) => {
    const mountRef = useRef(null);
    const [isPulsing, setIsPulsing] = useState(false);
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;
        const scene = createProfileScene({ container, palette: getPalette(theme), onPulse: setIsPulsing });
        return () => scene?.dispose();
    }, [theme]);

    return (
        <div
            className={`relative h-48 sm:h-52 w-full rounded-2xl border overflow-hidden shadow-lg select-none my-4 transition-colors duration-200 ${
                isBeige ? "border-amber-300/60 shadow-amber-900/10" : "border-indigo-400/20 shadow-black/40"
            }`}
            style={{ background: isBeige ? "#f6e6c4" : "#0b0e2e" }}
        >
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background: isBeige
                        ? "radial-gradient(ellipse at center, transparent 55%, rgba(120,80,30,0.14) 100%)"
                        : "radial-gradient(ellipse at center, transparent 50%, rgba(3,4,15,0.5) 100%)",
                }}
            />

            <div className={`pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-md transition-colors ${
                isBeige
                    ? "border-amber-400/40 bg-amber-100/90 text-amber-900"
                    : "border-indigo-400/25 bg-slate-950/55 text-indigo-100"
            }`}>
                <ShieldCheck className={`h-3.5 w-3.5 ${isBeige ? "text-amber-700" : "text-indigo-300"}`} />
                <span className="text-[11px] font-semibold tracking-wide">3D Identity Matrix • Verified</span>
            </div>

            <div className={`pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md text-[10px] transition-colors ${
                isBeige
                    ? "border-stone-300 bg-stone-100/80 text-stone-700"
                    : "border-indigo-400/20 bg-slate-950/55 text-indigo-200/80"
            }`}>
                <Sparkles className="h-3 w-3 text-amber-500 animate-spin [animation-duration:8s]" />
                <span>Drag to inspect</span>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
                <div className={`flex items-center gap-1.5 font-semibold ${isBeige ? "text-stone-800" : "text-indigo-100"}`}>
                    <UserCheck className={`h-4 w-4 ${isPulsing ? "text-amber-500 animate-bounce" : isBeige ? "text-amber-600" : "text-indigo-300"}`} />
                    <span>{isPulsing ? "Pulse Matrix Active!" : "Hold / Drag 3D Orb"}</span>
                </div>
                <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                    isPulsing
                        ? "border-amber-500 bg-amber-500 text-white animate-pulse"
                        : isBeige
                            ? "border-emerald-600/30 bg-emerald-100/80 text-emerald-900"
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                }`}>
                    {userInfo?.username ? `@${userInfo.username}` : "Verified Account"}
                </span>
            </div>
        </div>
    );
};
