import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export const Profile3DHub = ({ userInfo }) => {
    const mountRef = useRef(null);
    const [isPulsing, setIsPulsing] = useState(false);
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
        camera.position.set(0, 0, 4.2);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const worldGroup = new THREE.Group();
        scene.add(worldGroup);

        const colors = isBeige
            ? {
                  core: 0xd97706,
                  coreInner: 0xf59e0b,
                  ringOuter: 0xb45309,
                  ringInner: 0xf59e0b,
                  particle: 0xd97706,
                  ambient: 0xfffbeb,
                  directional: 0xd97706,
              }
            : {
                  core: 0x6366f1,
                  coreInner: 0x38bdf8,
                  ringOuter: 0x818cf8,
                  ringInner: 0x38bdf8,
                  particle: 0x818cf8,
                  ambient: 0x334155,
                  directional: 0x818cf8,
              };

        // 1. Central 3D Polyhedral Identity Core
        const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
        const coreMat = new THREE.MeshStandardMaterial({
            color: colors.core,
            roughness: 0.2,
            metalness: 0.8,
            wireframe: true,
        });
        const coreMesh = new THREE.Mesh(coreGeo, coreMat);
        worldGroup.add(coreMesh);

        // Inner Solid Crystal Core
        const crystalGeo = new THREE.OctahedronGeometry(0.5, 0);
        const crystalMat = new THREE.MeshBasicMaterial({
            color: colors.coreInner,
            wireframe: false,
            transparent: true,
            opacity: 0.85,
        });
        const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
        worldGroup.add(crystalMesh);

        // 2. Concentric Orbiting Holographic Rings
        const ringOuterGeo = new THREE.TorusGeometry(1.28, 0.02, 16, 64);
        const ringOuterMat = new THREE.MeshBasicMaterial({ color: colors.ringOuter, transparent: true, opacity: 0.8 });
        const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat);
        ringOuter.rotation.x = Math.PI / 3;
        worldGroup.add(ringOuter);

        const ringInnerGeo = new THREE.TorusGeometry(1.48, 0.015, 16, 64);
        const ringInnerMat = new THREE.MeshBasicMaterial({ color: colors.ringInner, transparent: true, opacity: 0.6 });
        const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
        ringInner.rotation.y = Math.PI / 4;
        worldGroup.add(ringInner);

        // 3. Orbiting Data Node Orbs (Representing Verified Attributes)
        const nodesGroup = new THREE.Group();
        worldGroup.add(nodesGroup);
        const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const nodeMat = new THREE.MeshBasicMaterial({ color: colors.coreInner });

        const nodeOrbs = [];
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const orb = new THREE.Mesh(nodeGeo, nodeMat);
            orb.position.set(Math.cos(angle) * 1.35, Math.sin(angle) * 1.35, 0);
            nodesGroup.add(orb);
            nodeOrbs.push(orb);
        }

        // 4. Floating Particle Cloud
        const particleCount = 90;
        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            particlePos[i] = (Math.random() - 0.5) * 4.5;
            particlePos[i + 1] = (Math.random() - 0.5) * 4.5;
            particlePos[i + 2] = (Math.random() - 0.5) * 3;
        }
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
        const particleSystem = new THREE.Points(
            particleGeo,
            new THREE.PointsMaterial({ size: 0.035, color: colors.particle, transparent: true, opacity: 0.6 })
        );
        scene.add(particleSystem);

        // Lighting
        const ambientLight = new THREE.AmbientLight(colors.ambient, isBeige ? 3.5 : 3.0);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(colors.coreInner, 4, 8);
        pointLight.position.set(0, 0, 2);
        scene.add(pointLight);

        // Touch & Drag Controls
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let targetRotationY = 0;
        let targetRotationX = 0;
        let spinSpeed = 1;

        const onPointerDown = (e) => {
            isDragging = true;
            spinSpeed = 3.5;
            setIsPulsing(true);
            previousMousePosition = {
                x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
                y: e.clientY || (e.touches && e.touches[0].clientY) || 0,
            };
        };

        const onPointerMove = (e) => {
            if (!isDragging) return;
            const currentX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const currentY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            const deltaX = currentX - previousMousePosition.x;
            const deltaY = currentY - previousMousePosition.y;

            targetRotationY += deltaX * 0.008;
            targetRotationX += deltaY * 0.008;

            previousMousePosition = { x: currentX, y: currentY };
        };

        const onPointerUp = () => {
            isDragging = false;
            spinSpeed = 1;
            setIsPulsing(false);
        };

        const domElement = renderer.domElement;
        domElement.addEventListener("mousedown", onPointerDown);
        domElement.addEventListener("mousemove", onPointerMove);
        window.addEventListener("mouseup", onPointerUp);

        domElement.addEventListener("touchstart", onPointerDown, { passive: true });
        domElement.addEventListener("touchmove", onPointerMove, { passive: true });
        window.addEventListener("touchend", onPointerUp);

        const handleResize = () => {
            if (!container) return;
            const newW = container.clientWidth;
            const newH = container.clientHeight;
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
        };
        window.addEventListener("resize", handleResize);

        // Animation Loop
        let animationFrameId;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.08;
            worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.08;

            if (!isDragging) {
                targetRotationY += 0.005 * spinSpeed;
            }

            // Core Crystal & Ring Animations
            coreMesh.rotation.y += 0.01 * spinSpeed;
            crystalMesh.rotation.x += 0.015 * spinSpeed;
            ringOuter.rotation.z += 0.012 * spinSpeed;
            ringInner.rotation.z -= 0.016 * spinSpeed;
            nodesGroup.rotation.z += 0.01 * spinSpeed;

            // Breathing Scale Motion
            const pulseFactor = Math.sin(elapsedTime * 3) * 0.04;
            coreMesh.scale.set(1 + pulseFactor, 1 + pulseFactor, 1 + pulseFactor);

            particleSystem.rotation.y += 0.001;

            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mouseup", onPointerUp);
            window.removeEventListener("touchend", onPointerUp);

            if (domElement) {
                domElement.removeEventListener("mousedown", onPointerDown);
                domElement.removeEventListener("mousemove", onPointerMove);
                domElement.removeEventListener("touchstart", onPointerDown);
                domElement.removeEventListener("touchmove", onPointerMove);
                if (domElement.parentNode) {
                    domElement.parentNode.removeChild(domElement);
                }
            }
            renderer.dispose();
        };
    }, [isBeige]);

    return (
        <div className={`relative h-48 sm:h-52 w-full rounded-2xl border backdrop-blur-md overflow-hidden shadow-lg select-none my-4 transition-colors duration-200 ${
            isBeige
                ? "border-amber-300/60 bg-amber-50/70"
                : "border-slate-700/50 bg-slate-900/90"
        }`}>
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

            <div className={`pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border px-3 py-1 backdrop-blur-md transition-colors ${
                isBeige
                    ? "border-amber-400/40 bg-amber-100/90 text-amber-900"
                    : "border-indigo-500/30 bg-indigo-500/10 text-indigo-200"
            }`}>
                <ShieldCheck className={`h-3.5 w-3.5 ${isBeige ? "text-amber-700" : "text-indigo-400"}`} />
                <span className="text-[11px] font-semibold tracking-wide">3D Identity Matrix • Verified</span>
            </div>

            <div className={`pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full border px-2.5 py-1 backdrop-blur-md text-[10px] transition-colors ${
                isBeige
                    ? "border-stone-300 bg-stone-100/80 text-stone-700"
                    : "border-slate-700/60 bg-slate-800/60 text-slate-400"
            }`}>
                <Sparkles className="h-3 w-3 text-amber-500 animate-spin [animation-duration:8s]" />
                <span>Drag to inspect</span>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px]">
                <div className={`flex items-center gap-1.5 font-semibold ${isBeige ? "text-stone-800" : "text-slate-300"}`}>
                    <UserCheck className={`h-4 w-4 ${isPulsing ? "text-amber-500 animate-bounce" : isBeige ? "text-amber-600" : "text-indigo-400"}`} />
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
