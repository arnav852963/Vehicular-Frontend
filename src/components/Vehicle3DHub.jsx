import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Car, RotateCcw, Gauge } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

export const Vehicle3DHub = () => {
    const mountRef = useRef(null);
    const [isAccelerating, setIsAccelerating] = useState(false);
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 1000);
        camera.position.set(4.4, 2.5, 5.4);
        camera.lookAt(0, 0.1, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const worldGroup = new THREE.Group();
        scene.add(worldGroup);

        const colors = isBeige
            ? {
                  road: 0xd6d3d1,
                  roadStripe: 0xd97706,
                  carBody: 0xb45309, // Copper Metallic SUV
                  cabin: 0x1c1917,
                  headlight: 0xfbbf24,
                  taillight: 0xef4444,
                  rim: 0xd4af37, // Gold Rim
                  trim: 0xe7e5e4,
                  ambient: 0xfffbeb,
                  directional: 0xd97706,
                  speedLines: 0xf59e0b,
                  mountain: 0x78716c,
                  treeFoliage: 0xb45309,
                  treeTrunk: 0x44403c,
                  guardrail: 0xa8a29e,
              }
            : {
                  road: 0x1e293b,
                  roadStripe: 0x6366f1,
                  carBody: 0x312e81, // Indigo Metallic SUV
                  cabin: 0x09090b,
                  headlight: 0x38bdf8,
                  taillight: 0xf43f5e,
                  rim: 0x94a3b8, // Titanium Rim
                  trim: 0xd4d4d8,
                  ambient: 0x334155,
                  directional: 0x818cf8,
                  speedLines: 0x38bdf8,
                  mountain: 0x1e1b4b,
                  treeFoliage: 0x312e81,
                  treeTrunk: 0x18181b,
                  guardrail: 0x475569,
              };

        // 1. Moving Asphalt Highway Road & Shoulders
        const roadMesh = new THREE.Mesh(
            new THREE.BoxGeometry(16, 0.08, 3.2),
            new THREE.MeshStandardMaterial({ color: colors.road, roughness: 0.8 })
        );
        roadMesh.position.y = -0.54;
        worldGroup.add(roadMesh);

        // Highway Guardrails
        const guardrailMat = new THREE.MeshStandardMaterial({ color: colors.guardrail, roughness: 0.4, metalness: 0.6 });
        const leftGuardrail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.05), guardrailMat);
        leftGuardrail.position.set(0, -0.42, 1.55);
        const rightGuardrail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.05), guardrailMat);
        rightGuardrail.position.set(0, -0.42, -1.55);
        worldGroup.add(leftGuardrail, rightGuardrail);

        // Moving Center Dashed Line Stripes
        const stripeGroup = new THREE.Group();
        worldGroup.add(stripeGroup);
        const stripeMat = new THREE.MeshBasicMaterial({ color: colors.roadStripe });
        const stripes = [];
        for (let i = -8; i <= 8; i += 1.6) {
            const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.01, 0.14), stripeMat);
            stripe.position.set(i, -0.49, 0);
            stripeGroup.add(stripe);
            stripes.push(stripe);
        }

        // 2. SCENERY: DISTANT MOUNTAIN RANGE (Parallax Background)
        const mountainGroup = new THREE.Group();
        worldGroup.add(mountainGroup);
        const mountainMat = new THREE.MeshStandardMaterial({ color: colors.mountain, roughness: 0.9, flatShading: true });
        const mountains = [];
        const mountainCoords = [
            [-7, 0.8, -4.5, 2.8, 1.8],
            [-3.5, 1.1, -5.0, 3.4, 2.2],
            [0, 0.9, -4.2, 3.0, 1.9],
            [3.8, 1.3, -4.8, 3.6, 2.4],
            [7.5, 0.85, -4.4, 2.9, 1.8],
        ];

        mountainCoords.forEach(([x, y, z, r, h]) => {
            const mountain = new THREE.Mesh(new THREE.ConeGeometry(r, h, 6), mountainMat);
            mountain.position.set(x, y, z);
            mountainGroup.add(mountain);
            mountains.push(mountain);
        });

        // 3. SCENERY: ROADSIDE PINE TREES (Passing by Infinitely)
        const treeGroup = new THREE.Group();
        worldGroup.add(treeGroup);
        const foliageMat = new THREE.MeshStandardMaterial({ color: colors.treeFoliage, roughness: 0.8, flatShading: true });
        const trunkMat = new THREE.MeshStandardMaterial({ color: colors.treeTrunk, roughness: 0.9 });
        const trees = [];

        const treePositions = [
            [-8, 1.8], [-5.5, 2.1], [-3, 1.9], [-0.5, 2.2], [2, 1.85], [4.5, 2.1], [7, 1.9],
            [-7, -1.9], [-4.5, -2.2], [-2, -1.85], [0.5, -2.1], [3, -1.9], [5.5, -2.2], [8, -1.8]
        ];

        treePositions.forEach(([x, z]) => {
            const singleTree = new THREE.Group();
            const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), trunkMat);
            trunk.position.y = -0.28;

            const cone1 = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.6, 6), foliageMat);
            cone1.position.y = 0.08;
            const cone2 = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.5, 6), foliageMat);
            cone2.position.y = 0.38;

            singleTree.add(trunk, cone1, cone2);
            singleTree.position.set(x, -0.1, z);
            treeGroup.add(singleTree);
            trees.push(singleTree);
        });

        // 4. SCENERY: ARCHE STREET LIGHT LAMPS WITH DOWNLIGHT GLOW
        const lampGroup = new THREE.Group();
        worldGroup.add(lampGroup);
        const lampPoleMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.4 });
        const lampLightMat = new THREE.MeshBasicMaterial({ color: colors.headlight });
        const lamps = [];

        for (let i = -8; i <= 8; i += 4) {
            const lamp = new THREE.Group();
            const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 12), lampPoleMat);
            pole.position.y = 0.16;

            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.03, 0.03), lampPoleMat);
            arm.position.set(0.18, 0.84, 0);

            const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), lampLightMat);
            bulb.position.set(0.38, 0.82, 0);

            lamp.add(pole, arm, bulb);
            lamp.position.set(i, -0.54, -1.35);
            lampGroup.add(lamp);
            lamps.push(lamp);
        }

        // 5. MODERN LUXURY SUV MODEL GROUP
        const suvGroup = new THREE.Group();
        worldGroup.add(suvGroup);

        const paintMat = new THREE.MeshStandardMaterial({
            color: colors.carBody,
            roughness: 0.15,
            metalness: 0.8,
        });

        const trimMat = new THREE.MeshStandardMaterial({
            color: colors.trim,
            roughness: 0.2,
            metalness: 0.9,
        });

        const darkAccentsMat = new THREE.MeshStandardMaterial({
            color: 0x18181b,
            roughness: 0.7,
        });

        // Lower Monocoque Body
        const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.42, 1.42), paintMat);
        mainChassis.position.set(0, -0.06, 0);
        suvGroup.add(mainChassis);

        // Hood & Front Grille
        const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 1.32), paintMat);
        hoodMesh.position.set(1.15, 0.1, 0);
        hoodMesh.rotation.z = -0.05;

        const grilleFascia = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1.15), darkAccentsMat);
        grilleFascia.position.set(1.61, 0.02, 0);

        const grilleTrim = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 1.18), trimMat);
        grilleTrim.position.set(1.61, 0.18, 0);
        suvGroup.add(hoodMesh, grilleFascia, grilleTrim);

        // Glass Cabin with Pillars
        const glassMat = new THREE.MeshStandardMaterial({
            color: colors.cabin,
            roughness: 0.05,
            metalness: 0.95,
            transparent: true,
            opacity: 0.9,
        });

        const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 1.22), glassMat);
        windshield.position.set(0.48, 0.44, 0);
        windshield.rotation.z = -0.42;

        const mainCabinGlass = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.52, 1.25), glassMat);
        mainCabinGlass.position.set(-0.25, 0.46, 0);

        const rearHatchGlass = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.48, 1.22), glassMat);
        rearHatchGlass.position.set(-1.08, 0.44, 0);
        rearHatchGlass.rotation.z = 0.35;
        suvGroup.add(windshield, mainCabinGlass, rearHatchGlass);

        // Roof Panel & Rear Aerodynamic Roof Spoiler
        const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 1.24), paintMat);
        roofPanel.position.set(-0.22, 0.72, 0);

        const roofSpoiler = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.04, 1.3), darkAccentsMat);
        roofSpoiler.position.set(-1.22, 0.72, 0);
        suvGroup.add(roofPanel, roofSpoiler);

        // Side Sills & Wheel Arches
        const leftSill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.08), trimMat);
        leftSill.position.set(-0.1, -0.25, 0.72);
        const rightSill = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.08), trimMat);
        rightSill.position.set(-0.1, -0.25, -0.72);
        suvGroup.add(leftSill, rightSill);

        const archCoords = [
            [0.85, -0.1, 0.68],
            [0.85, -0.1, -0.68],
            [-0.85, -0.1, 0.68],
            [-0.85, -0.1, -0.68],
        ];
        archCoords.forEach(([x, y, z]) => {
            const arch = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.28, 0.1), darkAccentsMat);
            arch.position.set(x, y, z);
            suvGroup.add(arch);
        });

        // Headlights & Rear Light Bar
        const headLensMat = new THREE.MeshBasicMaterial({ color: colors.headlight });
        const leftHeadBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.42), headLensMat);
        leftHeadBar.position.set(1.6, 0.12, 0.42);
        const rightHeadBar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.42), headLensMat);
        rightHeadBar.position.set(1.6, 0.12, -0.42);

        const rearLightbar = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.08, 1.28),
            new THREE.MeshBasicMaterial({ color: colors.taillight })
        );
        rearLightbar.position.set(-1.41, 0.24, 0);
        suvGroup.add(leftHeadBar, rightHeadBar, rearLightbar);

        // 4 Modern Alloy Wheels
        const wheels = [];
        const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 32);
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
        const rimMat = new THREE.MeshStandardMaterial({ color: colors.rim, metalness: 0.9, roughness: 0.2 });
        const brakeMat = new THREE.MeshStandardMaterial({ color: 0xd4d4d8, metalness: 0.9 });
        const caliperMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5 });

        const wheelCoords = [
            [0.85, -0.24, 0.72],
            [0.85, -0.24, -0.72],
            [-0.85, -0.24, 0.72],
            [-0.85, -0.24, -0.72],
        ];

        wheelCoords.forEach(([x, y, z]) => {
            const wGroup = new THREE.Group();
            wGroup.position.set(x, y, z);
            wGroup.rotation.x = Math.PI / 2;

            const tire = new THREE.Mesh(tireGeo, tireMat);
            const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16), rimMat);
            const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.18, 16), brakeMat);
            const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.09), caliperMat);
            caliper.position.set(0.1, 0, 0);

            wGroup.add(tire, rim, disc, caliper);
            suvGroup.add(wGroup);
            wheels.push(wGroup);
        });

        // 6. Motion Speed Lines & Particles
        const particleCount = 120;
        const particleGeo = new THREE.BufferGeometry();
        const particlePos = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount * 3; i += 3) {
            particlePos[i] = (Math.random() - 0.5) * 14;
            particlePos[i + 1] = Math.random() * 3.0 - 0.4;
            particlePos[i + 2] = (Math.random() - 0.5) * 5;
        }
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));
        const particleSystem = new THREE.Points(
            particleGeo,
            new THREE.PointsMaterial({ size: 0.04, color: colors.speedLines, transparent: true, opacity: 0.6 })
        );
        scene.add(particleSystem);

        // Lighting
        const ambientLight = new THREE.AmbientLight(colors.ambient, isBeige ? 3.5 : 3.0);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(colors.directional, isBeige ? 4.2 : 3.6);
        mainLight.position.set(6, 9, 6);
        scene.add(mainLight);

        const headlightLight = new THREE.PointLight(colors.headlight, 3.5, 9);
        headlightLight.position.set(2.2, 0.1, 0);
        scene.add(headlightLight);

        // Controls & Interaction
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let targetRotationY = 0.42;
        let targetRotationX = 0.14;
        let currentSpeedFactor = 1;
        let targetSpeedFactor = 1;

        const onPointerDown = (e) => {
            isDragging = true;
            targetSpeedFactor = 3.6;
            setIsAccelerating(true);
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
            targetRotationX = Math.max(-0.15, Math.min(0.45, targetRotationX + deltaY * 0.008));

            previousMousePosition = { x: currentX, y: currentY };
        };

        const onPointerUp = () => {
            isDragging = false;
            targetSpeedFactor = 1;
            setIsAccelerating(false);
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

        // Animation Loop with Scenery Motion
        let animationFrameId;
        let clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            currentSpeedFactor += (targetSpeedFactor - currentSpeedFactor) * 0.12;

            worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.08;
            worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.08;

            // 1. Road Stripes Motion
            stripes.forEach((st) => {
                st.position.x -= 0.07 * currentSpeedFactor;
                if (st.position.x < -8) {
                    st.position.x = 8;
                }
            });

            // 2. Roadside Trees Motion
            trees.forEach((tr) => {
                tr.position.x -= 0.08 * currentSpeedFactor;
                if (tr.position.x < -8) {
                    tr.position.x = 8;
                }
            });

            // 3. Street Lamps Motion
            lamps.forEach((lp) => {
                lp.position.x -= 0.09 * currentSpeedFactor;
                if (lp.position.x < -8) {
                    lp.position.x = 8;
                }
            });

            // 4. Distant Mountains Slow Parallax Motion
            mountains.forEach((m) => {
                m.position.x -= 0.015 * currentSpeedFactor;
                if (m.position.x < -8.5) {
                    m.position.x = 8.5;
                }
            });

            // 5. SUV Wheel Spin & Pitch
            wheels.forEach((w) => {
                w.rotation.y += 0.2 * currentSpeedFactor;
            });

            const pitchAngle = (currentSpeedFactor - 1) * -0.035;
            suvGroup.rotation.z = pitchAngle;
            suvGroup.position.y = Math.sin(elapsedTime * 11 * currentSpeedFactor) * (0.01 * currentSpeedFactor);

            // 6. Particle Stream
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] -= 0.12 * currentSpeedFactor;
                if (positions[i] < -7) {
                    positions[i] = 7;
                }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;

            headlightLight.intensity = isAccelerating ? 8.5 : 3.5;

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
        <div className={`relative mt-5 h-56 sm:h-64 w-full rounded-2xl border backdrop-blur-md overflow-hidden shadow-xl select-none group transition-colors duration-200 ${
            isBeige
                ? "border-amber-300/60 bg-amber-50/70"
                : "border-slate-700/50 bg-slate-900/90"
        }`}>
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
        </div>
    );
};
