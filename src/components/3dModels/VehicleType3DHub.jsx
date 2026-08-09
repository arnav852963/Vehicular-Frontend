import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../../context/ThemeContext.jsx";

export const VehicleType3DHub = ({ type = "CAR" }) => {
    const mountRef = useRef(null);
    const { theme } = useTheme();
    const isBeige = theme === "beige";

    const normalizedType = typeof type === "string" ? type.toUpperCase() : "CAR";
    const activeType = ["CAR", "MOTORCYCLE", "TRUCK", "BUS"].includes(normalizedType)
        ? normalizedType
        : "CAR";

    useEffect(() => {
        const container = mountRef.current;
        if (!container) return;

        const width = container.clientWidth;
        const height = container.clientHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
        camera.position.set(4.5, 2.5, 5.5);
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
                  body: 0xb45309,
                  cabin: 0x1c1917,
                  headlight: 0xfbbf24,
                  taillight: 0xef4444,
                  rim: 0xd4af37,
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
                  body: 0x312e81,
                  cabin: 0x09090b,
                  headlight: 0x38bdf8,
                  taillight: 0xf43f5e,
                  rim: 0x94a3b8,
                  trim: 0xd4d4d8,
                  ambient: 0x334155,
                  directional: 0x818cf8,
                  speedLines: 0x38bdf8,
                  mountain: 0x1e1b4b,
                  treeFoliage: 0x312e81,
                  treeTrunk: 0x18181b,
                  guardrail: 0x475569,
              };

        // 1. Moving Asphalt Highway Road
        const roadMesh = new THREE.Mesh(
            new THREE.BoxGeometry(16, 0.08, 3.4),
            new THREE.MeshStandardMaterial({ color: colors.road, roughness: 0.8 })
        );
        roadMesh.position.y = -0.54;
        worldGroup.add(roadMesh);

        // Guardrails
        const guardrailMat = new THREE.MeshStandardMaterial({ color: colors.guardrail, roughness: 0.4, metalness: 0.6 });
        const leftGuardrail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.05), guardrailMat);
        leftGuardrail.position.set(0, -0.42, 1.65);
        const rightGuardrail = new THREE.Mesh(new THREE.BoxGeometry(16, 0.12, 0.05), guardrailMat);
        rightGuardrail.position.set(0, -0.42, -1.65);
        worldGroup.add(leftGuardrail, rightGuardrail);

        // Moving Center Road Stripes
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

        // Distant Mountains
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

        // Roadside Pine Trees
        const treeGroup = new THREE.Group();
        worldGroup.add(treeGroup);
        const foliageMat = new THREE.MeshStandardMaterial({ color: colors.treeFoliage, roughness: 0.8, flatShading: true });
        const trunkMat = new THREE.MeshStandardMaterial({ color: colors.treeTrunk, roughness: 0.9 });
        const trees = [];

        const treePositions = [
            [-8, 2.0], [-5.5, 2.3], [-3, 2.0], [-0.5, 2.3], [2, 1.95], [4.5, 2.2], [7, 2.0],
            [-7, -2.0], [-4.5, -2.3], [-2, -1.95], [0.5, -2.2], [3, -2.0], [5.5, -2.3], [8, -2.0]
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

        // 2. PROCEDURAL HIGH-FPS VEHICLE MODEL CREATION
        const vehicleGroup = new THREE.Group();
        worldGroup.add(vehicleGroup);

        const wheels = [];
        const bodyMat = new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.15, metalness: 0.8 });
        const glassMat = new THREE.MeshStandardMaterial({ color: colors.cabin, roughness: 0.05, metalness: 0.95, transparent: true, opacity: 0.9 });
        const trimMat = new THREE.MeshStandardMaterial({ color: colors.trim, roughness: 0.2, metalness: 0.9 });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.95 });
        const rimMat = new THREE.MeshStandardMaterial({ color: colors.rim, metalness: 0.9, roughness: 0.2 });
        const headLensMat = new THREE.MeshBasicMaterial({ color: colors.headlight });
        const tailLensMat = new THREE.MeshBasicMaterial({ color: colors.taillight });

        if (activeType === "MOTORCYCLE") {
            // === DUCATI SUPERBIKE MODEL ===
            const ducatiRedMat = new THREE.MeshStandardMaterial({
                color: isBeige ? 0xd97706 : 0xdc2626,
                roughness: 0.15,
                metalness: 0.75,
            });

            const mainFrame = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 0.38), ducatiRedMat);
            mainFrame.position.set(0, 0.08, 0);

            const noseFairing = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.35, 0.44), ducatiRedMat);
            noseFairing.position.set(0.68, 0.28, 0);
            noseFairing.rotation.z = -0.22;

            const leftWinglet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.3), trimMat);
            leftWinglet.position.set(0.75, 0.22, 0.32);
            const rightWinglet = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 0.3), trimMat);
            rightWinglet.position.set(0.75, 0.22, -0.32);

            const fuelTank = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.34, 0.42), ducatiRedMat);
            fuelTank.position.set(0.15, 0.35, 0);

            const windscreen = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.38), glassMat);
            windscreen.position.set(0.62, 0.48, 0);
            windscreen.rotation.z = -0.45;

            const trellisMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
            const trellisL = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6), trellisMat);
            trellisL.rotation.z = 0.5;
            trellisL.position.set(0.2, 0.12, 0.21);
            const trellisR = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.6), trellisMat);
            trellisR.rotation.z = 0.5;
            trellisR.position.set(0.2, 0.12, -0.21);

            const exhaustL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35), trimMat);
            exhaustL.rotation.z = Math.PI / 2;
            exhaustL.position.set(-0.62, 0.22, 0.12);
            const exhaustR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35), trimMat);
            exhaustR.rotation.z = Math.PI / 2;
            exhaustR.position.set(-0.62, 0.22, -0.12);

            const leftHead = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.18), headLensMat);
            leftHead.position.set(0.92, 0.25, 0.12);
            const rightHead = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.18), headLensMat);
            rightHead.position.set(0.92, 0.25, -0.12);
            const tail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, 0.18), tailLensMat);
            tail.position.set(-0.78, 0.35, 0);

            const seat = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.14, 0.34), trimMat);
            seat.position.set(-0.35, 0.28, 0);

            const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.82, 12), trellisMat);
            fork.rotation.z = -0.32;
            fork.position.set(0.72, -0.05, 0);

            vehicleGroup.add(
                mainFrame, noseFairing, leftWinglet, rightWinglet, fuelTank, windscreen,
                trellisL, trellisR, exhaustL, exhaustR, leftHead, rightHead, tail, seat, fork
            );

            const bikeWheelCoords = [[0.76, -0.26, 0], [-0.72, -0.26, 0]];
            bikeWheelCoords.forEach(([x, y, z]) => {
                const wGroup = new THREE.Group();
                wGroup.position.set(x, y, z);
                wGroup.rotation.x = Math.PI / 2;
                const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 28), tireMat);
                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.21, 14), rimMat);
                wGroup.add(tire, rim);
                vehicleGroup.add(wGroup);
                wheels.push(wGroup);
            });
        } else if (activeType === "TRUCK") {
            // === HEAVY SEMI-TRUCK MODEL ===
            const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.45), bodyMat);
            cab.position.set(0.6, 0.42, 0);
            vehicleGroup.add(cab);

            const cabGlass = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.48, 1.38), glassMat);
            cabGlass.position.set(0.85, 0.68, 0);
            vehicleGroup.add(cabGlass);

            const grille = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.65, 1.25), trimMat);
            grille.position.set(1.42, 0.22, 0);
            vehicleGroup.add(grille);

            const stackL = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12), trimMat);
            stackL.position.set(-0.15, 0.85, 0.68);
            const stackR = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12), trimMat);
            stackR.position.set(-0.15, 0.85, -0.68);
            vehicleGroup.add(stackL, stackR);

            const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.28, 1.2), trimMat);
            frame.position.set(-0.9, -0.08, 0);
            vehicleGroup.add(frame);

            const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.35), headLensMat);
            hlL.position.set(1.42, 0.05, 0.45);
            const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.35), headLensMat);
            hlR.position.set(1.42, 0.05, -0.45);
            vehicleGroup.add(hlL, hlR);

            const truckWheelCoords = [
                [0.85, -0.26, 0.72], [0.85, -0.26, -0.72],
                [-0.6, -0.26, 0.72], [-0.6, -0.26, -0.72],
                [-1.2, -0.26, 0.72], [-1.2, -0.26, -0.72],
            ];
            truckWheelCoords.forEach(([x, y, z]) => {
                const wGroup = new THREE.Group();
                wGroup.position.set(x, y, z);
                wGroup.rotation.x = Math.PI / 2;
                const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 28), tireMat);
                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.23, 14), rimMat);
                wGroup.add(tire, rim);
                vehicleGroup.add(wGroup);
                wheels.push(wGroup);
            });
        } else if (activeType === "BUS") {
            // === STREAMLINED EXPRESS TRANSIT COACH BUS MODEL ===
            const busBody = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.2, 1.4), bodyMat);
            busBody.position.set(0, 0.45, 0);
            vehicleGroup.add(busBody);

            const leftGlass = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.48, 0.04), glassMat);
            leftGlass.position.set(0.1, 0.65, 0.71);
            const rightGlass = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.48, 0.04), glassMat);
            rightGlass.position.set(0.1, 0.65, -0.71);

            const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.85, 1.32), glassMat);
            frontWindshield.position.set(1.81, 0.58, 0);
            vehicleGroup.add(leftGlass, rightGlass, frontWindshield);

            const destSign = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.95), headLensMat);
            destSign.position.set(1.81, 0.98, 0);
            vehicleGroup.add(destSign);

            const bumper = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.22, 1.44), trimMat);
            bumper.position.set(0, -0.1, 0);
            vehicleGroup.add(bumper);

            const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.35), headLensMat);
            hlL.position.set(1.81, -0.05, 0.48);
            const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.35), headLensMat);
            hlR.position.set(1.81, -0.05, -0.48);
            const tailBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 1.28), tailLensMat);
            tailBar.position.set(-1.81, 0.2, 0);
            vehicleGroup.add(hlL, hlR, tailBar);

            const busWheelCoords = [
                [1.2, -0.26, 0.72], [1.2, -0.26, -0.72],
                [-0.8, -0.26, 0.72], [-0.8, -0.26, -0.72],
                [-1.35, -0.26, 0.72], [-1.35, -0.26, -0.72],
            ];
            busWheelCoords.forEach(([x, y, z]) => {
                const wGroup = new THREE.Group();
                wGroup.position.set(x, y, z);
                wGroup.rotation.x = Math.PI / 2;
                const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 28), tireMat);
                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.23, 14), rimMat);
                wGroup.add(tire, rim);
                vehicleGroup.add(wGroup);
                wheels.push(wGroup);
            });
        } else {
            // === MODERN LUXURY SUV / CAR MODEL === (CAR & OTHER)
            const mainChassis = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.42, 1.42), bodyMat);
            mainChassis.position.set(0, -0.06, 0);

            const hoodMesh = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.24, 1.32), bodyMat);
            hoodMesh.position.set(1.15, 0.1, 0);
            hoodMesh.rotation.z = -0.05;

            const grilleFascia = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 1.15), trimMat);
            grilleFascia.position.set(1.61, 0.02, 0);

            const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.48, 1.22), glassMat);
            windshield.position.set(0.48, 0.44, 0);
            windshield.rotation.z = -0.42;

            const mainCabinGlass = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.52, 1.25), glassMat);
            mainCabinGlass.position.set(-0.25, 0.46, 0);

            const roofPanel = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.05, 1.24), bodyMat);
            roofPanel.position.set(-0.22, 0.72, 0);

            const hlL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.42), headLensMat);
            hlL.position.set(1.6, 0.12, 0.42);
            const hlR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.42), headLensMat);
            hlR.position.set(1.6, 0.12, -0.42);

            const tailBar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 1.28), tailLensMat);
            tailBar.position.set(-1.41, 0.24, 0);

            vehicleGroup.add(mainChassis, hoodMesh, grilleFascia, windshield, mainCabinGlass, roofPanel, hlL, hlR, tailBar);

            const carWheelCoords = [
                [0.85, -0.24, 0.72], [0.85, -0.24, -0.72],
                [-0.85, -0.24, 0.72], [-0.85, -0.24, -0.72],
            ];
            carWheelCoords.forEach(([x, y, z]) => {
                const wGroup = new THREE.Group();
                wGroup.position.set(x, y, z);
                wGroup.rotation.x = Math.PI / 2;
                const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.24, 32), tireMat);
                const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.25, 16), rimMat);
                wGroup.add(tire, rim);
                vehicleGroup.add(wGroup);
                wheels.push(wGroup);
            });
        }

        // 3. Motion Particles
        const particleCount = 100;
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

        // Touch & Drag Controls with Speed Boost
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let targetRotationY = 0.42;
        let targetRotationX = 0.14;
        let currentSpeedFactor = 1;
        let targetSpeedFactor = 1;

        const onPointerDown = (e) => {
            isDragging = true;
            targetSpeedFactor = 3.6;
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

            currentSpeedFactor += (targetSpeedFactor - currentSpeedFactor) * 0.12;

            worldGroup.rotation.y += (targetRotationY - worldGroup.rotation.y) * 0.08;
            worldGroup.rotation.x += (targetRotationX - worldGroup.rotation.x) * 0.08;

            stripes.forEach((st) => {
                st.position.x -= 0.07 * currentSpeedFactor;
                if (st.position.x < -8) {
                    st.position.x = 8;
                }
            });

            trees.forEach((tr) => {
                tr.position.x -= 0.08 * currentSpeedFactor;
                if (tr.position.x < -8) {
                    tr.position.x = 8;
                }
            });

            mountains.forEach((m) => {
                m.position.x -= 0.015 * currentSpeedFactor;
                if (m.position.x < -8.5) {
                    m.position.x = 8.5;
                }
            });

            wheels.forEach((w) => {
                w.rotation.y += 0.2 * currentSpeedFactor;
            });

            const pitchAngle = (currentSpeedFactor - 1) * -0.035;
            vehicleGroup.rotation.z = pitchAngle;
            vehicleGroup.position.y = Math.sin(elapsedTime * 11 * currentSpeedFactor) * (0.01 * currentSpeedFactor);

            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] -= 0.12 * currentSpeedFactor;
                if (positions[i] < -7) {
                    positions[i] = 7;
                }
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;

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
    }, [isBeige, activeType]);

    return (
        <div className={`relative my-4 h-56 sm:h-64 w-full rounded-2xl border backdrop-blur-md overflow-hidden shadow-xl select-none group transition-colors duration-200 ${
            isBeige
                ? "border-amber-300/60 bg-amber-50/70"
                : "border-slate-700/50 bg-slate-900/90"
        }`}>
            <div ref={mountRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />
        </div>
    );
};
