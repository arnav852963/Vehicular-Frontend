import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

// Procedural, theme-driven vehicles. Every vehicle faces +X and is built around
// its own origin, then scaled + dropped onto the road by `buildVehicle`.

export const GROUND_Y = -0.5;
export const VEHICLE_TYPES = ["CAR", "MOTORCYCLE", "TRUCK", "BUS"];

const TARGET_LENGTH = { CAR: 3.3, MOTORCYCLE: 2.9, TRUCK: 3.85, BUS: 4.25 };
const V2 = THREE.Vector2;

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------
const createMaterials = (p) => {
    const lens = (hex, boost = 1) =>
        new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(boost), toneMapped: false });

    return {
        paint: new THREE.MeshPhysicalMaterial({ color: p.paint, metalness: 0.5, roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.22 }),
        paintDeep: new THREE.MeshPhysicalMaterial({ color: p.paintDeep, metalness: 0.5, roughness: 0.38, clearcoat: 0.8, clearcoatRoughness: 0.25 }),
        glass: new THREE.MeshPhysicalMaterial({ color: p.glass, metalness: 0.85, roughness: 0.05, clearcoat: 1 }),
        windscreen: new THREE.MeshPhysicalMaterial({ color: p.glass, metalness: 0.6, roughness: 0.05, transparent: true, opacity: 0.6 }),
        trim: new THREE.MeshStandardMaterial({ color: p.trim, metalness: 0.9, roughness: 0.25 }),
        chrome: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, metalness: 1, roughness: 0.08 }),
        black: new THREE.MeshStandardMaterial({ color: 0x0b0b0f, metalness: 0.3, roughness: 0.55 }),
        tire: new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.92 }),
        rim: new THREE.MeshStandardMaterial({ color: p.rim, metalness: 1, roughness: 0.22 }),
        cargo: new THREE.MeshStandardMaterial({ color: p.cargo, metalness: 0.1, roughness: 0.55 }),
        cargoRib: new THREE.MeshStandardMaterial({ color: p.cargoRib, metalness: 0.2, roughness: 0.6 }),
        plate: new THREE.MeshStandardMaterial({ color: 0xf5f5f4, roughness: 0.5 }),
        headlight: lens(p.headlight, 1.25),
        taillight: lens(p.taillight, 1.1),
        accent: lens(p.accent),
        sign: lens(p.sign),
        amber: lens(0xffb020),
    };
};

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------
const rbox = (w, h, d, r, mat, x = 0, y = 0, z = 0) => {
    const radius = Math.max(0.002, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return mesh;
};

const box = (w, h, d, mat, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    return mesh;
};

const cyl = (radius, length, mat, axis, x = 0, y = 0, z = 0, segments = 18) => {
    const geo = new THREE.CylinderGeometry(radius, radius, length, segments);
    if (axis === "x") geo.rotateZ(Math.PI / 2);
    if (axis === "z") geo.rotateX(Math.PI / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    return mesh;
};

/** Cylinder running between two points. */
const limb = (a, b, radius, mat, segments = 10) => {
    const from = new THREE.Vector3(...a);
    const to = new THREE.Vector3(...b);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, from.distanceTo(to), segments), mat);
    mesh.position.copy(from).add(to).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
    mesh.castShadow = true;
    return mesh;
};

/** Thin flat panel laid along a 2D (x,y) line - used for sloped windscreens. */
const panel = (p1, p2, width, thickness, mat, offset = 0) => {
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const len = Math.hypot(dx, dy);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len, thickness, width), mat);
    mesh.rotation.z = Math.atan2(dy, dx);
    // outward normal for a profile that is walked bottom -> top on the front face
    mesh.position.set((p1[0] + p2[0]) / 2 + (dy / len) * offset, (p1[1] + p2[1]) / 2 - (dx / len) * offset, 0);
    return mesh;
};

/** Rounded extrusion of a side profile (x = length, y = height) across `width`. */
const extrude = (shape, width, mat, bevel = 0.05) => {
    const bevelSize = bevel * 0.9;
    const depth = Math.max(0.01, width - bevel * 2);
    const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: true,
        bevelThickness: bevel,
        bevelSize,
        bevelOffset: -bevelSize,
        bevelSegments: 4,
        curveSegments: 28,
    });
    geo.translate(0, 0, -depth / 2);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    return mesh;
};

/** Walks the bottom edge of a side profile (left -> right) carving a wheel arch per x. */
const archedBottom = (shape, bottomY, xs, wheelY, archR) => {
    const a = Math.asin((bottomY - wheelY) / archR);
    xs.forEach((cx) => {
        shape.lineTo(cx - archR * Math.cos(a), bottomY);
        shape.absarc(cx, wheelY, archR, Math.PI - a, a, true);
    });
};

const mergedMesh = (geos, mat) => {
    const geometry = mergeGeometries(geos, false);
    geos.forEach((g) => g.dispose());
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.castShadow = true;
    return mesh;
};

// ---------------------------------------------------------------------------
// Wheel: rounded tyre, dished rim, spokes. Spokes make the rotation readable.
// ---------------------------------------------------------------------------
const createWheel = (m, R, width, { spokes = 6, disc = false } = {}) => {
    const root = new THREE.Group();
    const spin = new THREE.Group();
    root.add(spin);

    const profile = [
        [0.6, -0.5], [0.9, -0.5], [0.985, -0.34], [1, -0.18],
        [1, 0.18], [0.985, 0.34], [0.9, 0.5], [0.6, 0.5],
    ].map(([r, y]) => new V2(R * r, width * y));
    const tireGeo = new THREE.LatheGeometry(profile, 40);
    tireGeo.rotateX(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, m.tire);
    tire.castShadow = true;
    spin.add(tire);

    const faceZ = width * 0.4;
    const rings = [];
    const discs = [];
    const hubs = [];
    const spokeGeos = [];
    [-1, 1].forEach((side) => {
        const ring = new THREE.TorusGeometry(R * 0.57, R * 0.045, 8, 40);
        ring.translate(0, 0, side * faceZ);
        rings.push(ring);

        const dark = new THREE.CylinderGeometry(R * 0.58, R * 0.58, 0.01, 32);
        dark.rotateX(Math.PI / 2);
        dark.translate(0, 0, side * (faceZ - 0.02));
        discs.push(dark);

        const hub = new THREE.CylinderGeometry(R * 0.15, R * 0.15, 0.04, 20);
        hub.rotateX(Math.PI / 2);
        hub.translate(0, 0, side * (faceZ + 0.015));
        hubs.push(hub);

        for (let i = 0; i < spokes; i++) {
            const spoke = new THREE.BoxGeometry(R * 0.5, R * 0.1, 0.025);
            spoke.translate(R * 0.32, 0, 0);
            spoke.rotateZ((i / spokes) * Math.PI * 2);
            spoke.translate(0, 0, side * (faceZ - 0.005));
            spokeGeos.push(spoke);
        }
    });
    spin.add(
        mergedMesh(discs, m.black),
        mergedMesh([...rings, ...hubs, ...spokeGeos], m.rim)
    );

    if (disc) {
        const rotor = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.72, R * 0.72, 0.012, 36), m.trim);
        rotor.rotation.x = Math.PI / 2;
        rotor.position.z = width * 0.5 + 0.012;
        spin.add(rotor);
    }

    return { root, spin };
};

// ---------------------------------------------------------------------------
// Vehicle builders. All coordinates are in "natural" units before the fit step.
// ---------------------------------------------------------------------------
const buildCar = (ctx) => {
    const { m, add } = ctx;
    const W = 1.44;
    const R = 0.3;
    const WY = -0.2;
    const FX = 0.98;
    const RX = -0.95;
    const ARCH = 0.37;
    const BOT = -0.3;

    const body = new THREE.Shape();
    body.moveTo(-1.5, BOT);
    archedBottom(body, BOT, [RX, FX], WY, ARCH);
    body.lineTo(1.5, BOT);
    body.quadraticCurveTo(1.6, BOT, 1.6, -0.1);
    body.lineTo(1.585, 0.05);
    body.quadraticCurveTo(1.56, 0.15, 1.42, 0.18);
    body.lineTo(0.62, 0.26);
    body.lineTo(-1.1, 0.28);
    body.quadraticCurveTo(-1.52, 0.28, -1.57, 0.1);
    body.lineTo(-1.58, -0.12);
    body.quadraticCurveTo(-1.58, BOT, -1.5, BOT);
    add(extrude(body, W, m.paint, 0.05));

    // greenhouse
    const cabin = new THREE.Shape();
    cabin.moveTo(0.62, 0.24);
    cabin.lineTo(0.2, 0.67);
    cabin.lineTo(-0.74, 0.69);
    cabin.quadraticCurveTo(-1.0, 0.66, -1.18, 0.3);
    cabin.lineTo(-1.18, 0.24);
    add(extrude(cabin, W - 0.2, m.glass, 0.02));
    add(rbox(0.98, 0.06, 1.24, 0.025, m.paint, -0.27, 0.69, 0));

    [-1, 1].forEach((s) => {
        const z = s * 0.62;
        add(
            limb([0.63, 0.26, z], [0.21, 0.69, z], 0.03, m.paint),
            limb([-0.22, 0.26, z], [-0.2, 0.69, z], 0.028, m.paint),
            limb([-1.19, 0.27, z], [-0.76, 0.69, z], 0.035, m.paint),
            limb([0.1, 0.75, s * 0.5], [-0.7, 0.755, s * 0.5], 0.016, m.chrome),
            box(1.75, 0.014, 0.01, m.trim, -0.27, 0.285, s * 0.727),
            box(2.4, 0.012, 0.012, m.accent, -0.02, 0.1, s * 0.727),
            box(0.012, 0.46, 0.01, m.black, 0.5, 0.04, s * 0.724),
            box(0.012, 0.46, 0.01, m.black, -0.22, 0.04, s * 0.724),
            box(0.012, 0.46, 0.01, m.black, -0.98, 0.04, s * 0.724),
            rbox(0.12, 0.02, 0.012, 0.008, m.chrome, 0.16, 0.19, s * 0.727),
            rbox(0.12, 0.02, 0.012, 0.008, m.chrome, -0.6, 0.19, s * 0.727),
            limb([0.45, 0.28, s * 0.7], [0.43, 0.33, s * 0.74], 0.012, m.black),
            rbox(0.14, 0.09, 0.12, 0.035, m.paint, 0.42, 0.34, s * 0.78),
            // lights
            rbox(0.07, 0.075, 0.34, 0.03, m.headlight, 1.58, 0.09, s * 0.5),
            box(0.02, 0.012, 0.36, m.accent, 1.595, 0.14, s * 0.5),
            cyl(0.03, 0.08, m.chrome, "x", -1.62, -0.26, s * 0.4, 14)
        );
        ctx.beam(1.63, 0.09, s * 0.5);
        ctx.glow(1.65, 0.09, s * 0.5, ctx.p.headlight, 0.55, 0.85);
        ctx.glow(-1.62, 0.13, s * 0.45, ctx.p.taillight, 0.45, 0.7);
    });

    add(
        rbox(0.05, 0.16, 0.72, 0.02, m.black, 1.605, -0.04, 0),
        rbox(0.03, 0.025, 0.74, 0.01, m.chrome, 1.615, 0.05, 0),
        rbox(0.05, 0.07, 0.9, 0.02, m.black, 1.59, -0.2, 0),
        rbox(0.06, 0.07, 1.12, 0.03, m.taillight, -1.59, 0.13, 0),
        rbox(0.06, 0.1, 1.2, 0.03, m.black, -1.585, -0.2, 0),
        rbox(0.02, 0.12, 0.34, 0.01, m.plate, -1.605, -0.06, 0),
        box(2.9, 0.05, 1.2, m.black, 0, -0.31, 0)
    );

    [FX, RX].forEach((x) => ctx.well(x, WY, ARCH - 0.02, W - 0.12));
    [FX, RX].forEach((x) => [-1, 1].forEach((s) => ctx.wheel(x, WY, s * 0.6, R, 0.27, { spokes: 6 })));
};

const buildBike = (ctx) => {
    const { m, add } = ctx;
    const R = 0.32;
    const WY = -0.18;
    const FX = 0.8;
    const RX = -0.8;

    ctx.wheel(FX, WY, 0, R, 0.17, { spokes: 5, disc: true });
    ctx.wheel(RX, WY, 0, R, 0.24, { spokes: 5, disc: true });

    // fairing / tank / tail as one smooth extruded form
    const shape = new THREE.Shape();
    shape.moveTo(0.94, 0.02);
    shape.splineThru([
        new V2(1.0, 0.18), new V2(0.82, 0.36), new V2(0.62, 0.5),
        new V2(0.4, 0.55), new V2(0.2, 0.62), new V2(-0.05, 0.58),
        new V2(-0.3, 0.5), new V2(-0.55, 0.55), new V2(-0.85, 0.6), new V2(-0.97, 0.55),
    ]);
    shape.lineTo(-0.95, 0.4);
    shape.splineThru([new V2(-0.7, 0.3), new V2(-0.3, 0.26), new V2(0.05, 0.2)]);
    shape.lineTo(0.4, 0.1);
    shape.lineTo(0.7, 0.02);
    add(extrude(shape, 0.34, m.paint, 0.07));

    // engine + radiator
    add(
        rbox(0.5, 0.36, 0.3, 0.05, m.black, 0.05, -0.04, 0),
        rbox(0.3, 0.16, 0.28, 0.04, m.black, 0.15, 0.16, 0),
        cyl(0.12, 0.36, m.trim, "z", 0.2, -0.1, 0, 20),
        rbox(0.1, 0.3, 0.24, 0.03, m.black, 0.5, 0.05, 0),
        rbox(0.55, 0.07, 0.28, 0.03, m.black, -0.45, 0.545, 0),
        panel([0.8, 0.4], [0.6, 0.64], 0.24, 0.015, m.windscreen, 0.01),
        rbox(0.1, 0.04, 0.3, 0.015, m.trim, 0.62, 0.43, 0),
        limb([0.6, 0.55, -0.32], [0.6, 0.55, 0.32], 0.02, m.black),
        rbox(0.06, 0.055, 0.13, 0.02, m.headlight, 0.985, 0.17, 0.075),
        rbox(0.06, 0.055, 0.13, 0.02, m.headlight, 0.985, 0.17, -0.075),
        rbox(0.05, 0.05, 0.2, 0.02, m.taillight, -0.985, 0.5, 0),
        box(0.01, 0.012, 0.3, m.accent, 1.0, 0.23, 0)
    );
    ctx.beam(1.03, 0.17, 0, { r: 0.4, len: 3 });
    ctx.glow(1.04, 0.17, 0, ctx.p.headlight, 0.6, 0.85);
    ctx.glow(-1.0, 0.5, 0, ctx.p.taillight, 0.4, 0.7);

    // front fender
    const fender = new THREE.Mesh(new THREE.TorusGeometry(R + 0.045, 0.02, 8, 28, 1.25), m.paint);
    fender.scale.z = 3.6;
    fender.rotation.z = 0.45;
    fender.position.set(FX, WY, 0);
    fender.castShadow = true;
    add(fender);

    [-1, 1].forEach((s) => {
        add(
            limb([0.62, 0.43, s * 0.1], [FX, WY, s * 0.1], 0.026, m.rim),
            limb([0.74, 0.1, s * 0.1], [FX, WY, s * 0.1], 0.036, m.black),
            limb([-0.25, -0.1, s * 0.12], [RX, WY, s * 0.12], 0.034, m.trim),
            limb([0.62, 0.56, s * 0.2], [0.58, 0.7, s * 0.25], 0.01, m.black),
            rbox(0.03, 0.05, 0.09, 0.012, m.black, 0.58, 0.72, s * 0.26),
            cyl(0.024, 0.1, m.black, "z", 0.6, 0.55, s * 0.34, 10)
        );
    });

    // exhaust (visible side)
    add(
        limb([0.22, -0.02, 0.16], [-0.05, -0.14, 0.17], 0.03, m.chrome),
        limb([-0.05, -0.14, 0.17], [-0.55, -0.1, 0.18], 0.05, m.chrome),
        limb([-0.5, -0.1, 0.18], [-0.97, 0.1, 0.19], 0.068, m.chrome),
        cyl(0.05, 0.03, m.black, "x", -0.98, 0.1, 0.19, 14),
        limb([-0.2, -0.05, 0.15], [-0.2, -0.05, 0.3], 0.015, m.trim)
    );
};

const buildTruck = (ctx) => {
    const { m, add } = ctx;
    const R = 0.33;
    const WY = -0.17;

    // chassis + cargo box
    add(
        rbox(3.95, 0.12, 0.66, 0.03, m.black, -0.02, -0.05, 0),
        box(2.5, 0.2, 0.86, m.black, -0.78, 0.1, 0),
        rbox(2.6, 1.3, 1.42, 0.05, m.cargo, -0.74, 0.85, 0),
        box(0.012, 1.2, 0.01, m.black, -2.045, 0.85, 0),
        rbox(0.04, 0.2, 0.1, 0.02, m.taillight, -2.05, 0.4, 0.62),
        rbox(0.04, 0.2, 0.1, 0.02, m.taillight, -2.05, 0.4, -0.62),
        rbox(0.12, 0.1, 1.3, 0.03, m.black, -2.06, -0.02, 0),
        box(0.012, 0.06, 1.3, m.amber, -2.046, 0.12, 0)
    );
    [-0.5, -0.2, 0.2, 0.5].forEach((z) => add(cyl(0.012, 1.1, m.chrome, "y", -2.055, 0.85, z, 8)));
    ctx.glow(-2.1, 0.4, 0.62, ctx.p.taillight, 0.5, 0.7);
    ctx.glow(-2.1, 0.4, -0.62, ctx.p.taillight, 0.5, 0.7);

    [-1, 1].forEach((s) => {
        for (let i = 0; i < 7; i++) add(box(0.035, 1.2, 0.012, m.cargoRib, -1.9 + i * 0.4, 0.85, s * 0.717));
        add(
            box(2.58, 0.26, 0.012, m.paint, -0.74, 0.52, s * 0.72),
            box(2.58, 0.025, 0.012, m.accent, -0.74, 0.69, s * 0.724),
            box(2.58, 0.025, 0.012, m.accent, -0.74, 0.35, s * 0.724),
            cyl(0.15, 0.85, m.chrome, "x", -0.35, 0.0, s * 0.47, 20)
        );
    });

    // cab-over
    const cab = new THREE.Shape();
    cab.moveTo(0.7, -0.1);
    archedBottom(cab, -0.1, [1.45], WY, 0.41);
    cab.lineTo(1.95, -0.1);
    cab.lineTo(1.99, 0.0);
    cab.lineTo(1.99, 0.5);
    cab.lineTo(1.86, 0.98);
    cab.quadraticCurveTo(1.82, 1.06, 1.7, 1.06);
    cab.lineTo(0.78, 1.06);
    cab.quadraticCurveTo(0.7, 1.06, 0.7, 0.98);
    add(extrude(cab, 1.3, m.paint, 0.05));

    const sideWindow = new THREE.Shape();
    sideWindow.moveTo(1.0, 0.52);
    sideWindow.lineTo(1.8, 0.56);
    sideWindow.lineTo(1.72, 0.94);
    sideWindow.lineTo(1.0, 0.94);
    add(extrude(sideWindow, 1.34, m.glass, 0.015));
    add(panel([1.99, 0.52], [1.87, 0.97], 1.1, 0.02, m.glass, 0.015));

    add(
        rbox(0.05, 0.36, 0.92, 0.02, m.black, 2.0, 0.2, 0),
        rbox(0.14, 0.15, 1.36, 0.04, m.trim, 1.98, -0.06, 0)
    );
    [0.1, 0.2, 0.3].forEach((y) => add(box(0.02, 0.02, 0.9, m.chrome, 2.03, y, 0)));
    for (let i = -2; i <= 2; i++) add(rbox(0.04, 0.05, 0.07, 0.02, m.amber, 1.62, 1.09, i * 0.2));

    [-1, 1].forEach((s) => {
        add(
            rbox(0.06, 0.1, 0.22, 0.03, m.headlight, 2.01, 0.3, s * 0.5),
            rbox(0.05, 0.06, 0.1, 0.02, m.amber, 2.0, 0.08, s * 0.56),
            box(0.012, 0.8, 0.01, m.black, 1.0, 0.45, s * 0.654),
            rbox(0.1, 0.02, 0.012, 0.008, m.chrome, 1.12, 0.55, s * 0.656),
            limb([1.78, 0.82, s * 0.65], [1.7, 0.9, s * 0.86], 0.012, m.black),
            rbox(0.05, 0.32, 0.14, 0.02, m.black, 1.7, 0.88, s * 0.88)
        );
        ctx.beam(2.06, 0.3, s * 0.5);
        ctx.glow(2.07, 0.3, s * 0.5, ctx.p.headlight, 0.6, 0.85);
    });

    ctx.well(1.45, WY, 0.39, 1.18);
    [-1, 1].forEach((s) => {
        ctx.wheel(1.45, WY, s * 0.6, R, 0.28, { spokes: 6 });
        ctx.wheel(-1.1, WY, s * 0.6, R, 0.3, { spokes: 6 });
        ctx.wheel(-1.65, WY, s * 0.6, R, 0.3, { spokes: 6 });
    });
};

const buildBus = (ctx) => {
    const { m, add } = ctx;
    const R = 0.33;
    const WY = -0.17;
    const FX = 1.45;
    const RX = -1.25;

    const body = new THREE.Shape();
    body.moveTo(-2.05, -0.1);
    archedBottom(body, -0.1, [RX, FX], WY, 0.41);
    body.lineTo(2.0, -0.1);
    body.quadraticCurveTo(2.12, -0.1, 2.12, 0.05);
    body.lineTo(2.12, 0.5);
    body.quadraticCurveTo(2.1, 0.9, 2.0, 1.1);
    body.quadraticCurveTo(1.94, 1.2, 1.8, 1.2);
    body.lineTo(-1.9, 1.2);
    body.quadraticCurveTo(-2.1, 1.2, -2.12, 1.0);
    body.lineTo(-2.12, 0.05);
    body.quadraticCurveTo(-2.12, -0.1, -2.05, -0.1);
    add(extrude(body, 1.42, m.paint, 0.05));

    // continuous window band
    const band = new THREE.Shape();
    band.moveTo(-1.72, 0.5);
    band.lineTo(1.68, 0.5);
    band.lineTo(1.68, 1.0);
    band.lineTo(-1.72, 1.0);
    add(extrude(band, 1.46, m.glass, 0.02));
    add(
        panel([2.115, 0.55], [2.02, 1.12], 1.28, 0.02, m.glass, 0.015),
        panel([-2.12, 1.05], [-2.12, 0.55], 1.2, 0.02, m.glass, 0.015),
        rbox(0.04, 0.13, 0.9, 0.02, m.sign, 2.05, 1.12, 0),
        rbox(1.2, 0.12, 0.8, 0.05, m.cargo, -0.5, 1.26, 0),
        rbox(0.1, 0.14, 1.34, 0.04, m.black, 2.13, -0.02, 0),
        rbox(0.1, 0.14, 1.34, 0.04, m.black, -2.13, -0.02, 0),
        rbox(0.03, 0.22, 0.66, 0.02, m.black, 2.13, 0.28, 0),
        cyl(0.05, 0.03, m.chrome, "x", 2.15, 0.3, 0, 20),
        rbox(0.02, 0.12, 0.34, 0.01, m.plate, -2.14, 0.15, 0)
    );

    [-1, 1].forEach((s) => {
        add(
            box(4.1, 0.14, 0.012, m.cargo, 0, 0.36, s * 0.714),
            box(4.1, 0.03, 0.012, m.accent, 0, 0.455, s * 0.716),
            rbox(0.05, 0.1, 0.3, 0.03, m.headlight, 2.13, 0.14, s * 0.5),
            rbox(0.04, 0.4, 0.1, 0.02, m.taillight, -2.13, 0.5, s * 0.58),
            limb([1.98, 0.9, s * 0.7], [2.02, 0.84, s * 0.86], 0.012, m.black),
            rbox(0.05, 0.3, 0.1, 0.02, m.black, 2.02, 0.82, s * 0.88)
        );
        ctx.beam(2.18, 0.14, s * 0.5);
        ctx.glow(2.19, 0.14, s * 0.5, ctx.p.headlight, 0.6, 0.85);
        ctx.glow(-2.18, 0.5, s * 0.58, ctx.p.taillight, 0.5, 0.7);
        [-1.75, -1.1, -0.45, 0.2, 0.85, 1.5].forEach((x) => add(box(0.05, 0.54, 0.02, m.paint, x, 0.75, s * 0.735)));
    });

    // passenger door (visible side)
    add(
        box(0.6, 1.0, 0.016, m.glass, 1.18, 0.4, 0.722),
        box(0.012, 1.0, 0.02, m.chrome, 1.18, 0.4, 0.726)
    );

    [FX, RX].forEach((x) => ctx.well(x, WY, 0.39, 1.18));
    [FX, RX].forEach((x) => [-1, 1].forEach((s) => ctx.wheel(x, WY, s * 0.6, R, 0.28, { spokes: 6 })));
};

const BUILDERS = { CAR: buildCar, MOTORCYCLE: buildBike, TRUCK: buildTruck, BUS: buildBus };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
const measure = (group) => {
    const bounds = new THREE.Box3();
    group.updateMatrixWorld(true);
    group.traverse((o) => {
        if (o.isMesh && !o.userData.skipBounds) bounds.expandByObject(o);
    });
    return bounds;
};

/**
 * Builds a vehicle, scales it to a consistent on-screen length and sits it on
 * the road surface. Returns the group plus the data the render loop needs.
 */
export const buildVehicle = (type, palette, textures) => {
    const m = createMaterials(palette);
    const group = new THREE.Group();
    const wheels = [];

    const beamMat = new THREE.MeshBasicMaterial({
        color: palette.beam,
        transparent: true,
        opacity: palette.beamOpacity,
        alphaMap: textures.beamAlpha,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
    });

    const ctx = {
        p: palette,
        m,
        add: (...objects) => group.add(...objects),
        wheel: (x, y, z, R, width, opts) => {
            const { root, spin } = createWheel(m, R, width, opts);
            root.position.set(x, y, z);
            group.add(root);
            wheels.push({ spin, R });
        },
        well: (x, y, radius, width) => {
            const well = cyl(radius, width, m.black, "z", x, y, 0, 28);
            well.castShadow = false;
            group.add(well);
        },
        beam: (x, y, z, { r = 0.5, len = 3.4 } = {}) => {
            const geo = new THREE.ConeGeometry(r, len, 28, 1, true);
            geo.translate(0, -len / 2, 0);
            geo.rotateZ(Math.PI / 2);
            const beam = new THREE.Mesh(geo, beamMat);
            beam.position.set(x, y, z);
            beam.rotation.z = -0.05;
            beam.scale.set(1, 0.55, 1);
            beam.userData.skipBounds = true;
            group.add(beam);
        },
        glow: (x, y, z, color, size, opacity) => {
            const sprite = new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map: textures.glow,
                    color,
                    transparent: true,
                    opacity,
                    blending: THREE.AdditiveBlending,
                    depthWrite: false,
                    toneMapped: false,
                })
            );
            sprite.position.set(x, y, z);
            sprite.scale.setScalar(size);
            group.add(sprite);
        },
    };

    (BUILDERS[type] || buildCar)(ctx);

    const natural = measure(group);
    const scale = TARGET_LENGTH[type] / (natural.max.x - natural.min.x);
    group.scale.setScalar(scale);
    const fitted = measure(group);
    group.position.set(-(fitted.min.x + fitted.max.x) / 2, GROUND_Y - fitted.min.y, 0);

    return {
        group,
        wheels: wheels.map(({ spin, R }) => ({ spin, radius: R * scale })),
        size: fitted.getSize(new THREE.Vector3()),
        baseY: group.position.y,
    };
};
