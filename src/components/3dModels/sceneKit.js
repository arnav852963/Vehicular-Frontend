import * as THREE from "three";

// ---------------------------------------------------------------------------
// Renderer
// ---------------------------------------------------------------------------
export const createRenderer = (container) => {
    try {
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(container.clientWidth || 320, container.clientHeight || 224);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        // Tone mapping is intentionally off so the fog / background hex values
        // match the Tailwind theme colours exactly.
        renderer.toneMapping = THREE.NoToneMapping;
        renderer.domElement.style.display = "block";
        renderer.domElement.style.touchAction = "pan-y";
        container.appendChild(renderer.domElement);
        return renderer;
    } catch {
        return null;
    }
};

// ---------------------------------------------------------------------------
// Textures
// ---------------------------------------------------------------------------
const canvasTexture = (width, height, draw, srgb = true) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    draw(canvas.getContext("2d"), width, height);
    const texture = new THREE.CanvasTexture(canvas);
    if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
};

/** Soft round white dot - used for glows, particles, lamp halos. */
export const createGlowTexture = () =>
    canvasTexture(128, 128, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.25, "rgba(255,255,255,0.55)");
        g.addColorStop(0.6, "rgba(255,255,255,0.12)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });

/** White -> black gradient. Used as an alphaMap so headlight beams fade out. */
export const createBeamAlphaTexture = () =>
    canvasTexture(
        4,
        128,
        (ctx, w, h) => {
            const g = ctx.createLinearGradient(0, 0, 0, h);
            g.addColorStop(0, "#ffffff");
            g.addColorStop(0.35, "#6b6b6b");
            g.addColorStop(1, "#000000");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
        },
        false
    );

/** Dark soft blob used as a fake contact shadow under the vehicle. */
export const createShadowBlobTexture = () =>
    canvasTexture(128, 128, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, "rgba(0,0,0,0.95)");
        g.addColorStop(0.55, "rgba(0,0,0,0.45)");
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });

/** Vertical sky gradient. `horizonAt` is the 0..1 position of the horizon from the top. */
export const createSkyTexture = ({ top, mid, horizon }, horizonAt = 0.42) =>
    canvasTexture(4, 512, (ctx, w, h) => {
        const g = ctx.createLinearGradient(0, 0, 0, h);
        g.addColorStop(0, top);
        g.addColorStop(horizonAt * 0.55, mid);
        g.addColorStop(horizonAt, horizon);
        g.addColorStop(1, horizon);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });

/** Radial backdrop for the profile orb. */
export const createRadialBackdrop = (inner, outer) =>
    canvasTexture(256, 256, (ctx, w, h) => {
        const g = ctx.createRadialGradient(w / 2, h * 0.5, 0, w / 2, h * 0.5, w * 0.72);
        g.addColorStop(0, inner);
        g.addColorStop(1, outer);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
    });

// ---------------------------------------------------------------------------
// Reflection environment (theme-tinted softboxes, baked into a PMREM)
// ---------------------------------------------------------------------------
export const buildEnvironment = (renderer, envSpec) => {
    const envScene = new THREE.Scene();

    const sphereGeo = new THREE.SphereGeometry(10, 32, 16);
    const top = new THREE.Color(envSpec.top);
    const mid = new THREE.Color(envSpec.horizon);
    const bottom = new THREE.Color(envSpec.bottom);
    const pos = sphereGeo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i) / 10;
        c.copy(mid).lerp(y >= 0 ? top : bottom, Math.abs(y));
        colors.set([c.r, c.g, c.b], i * 3);
    }
    sphereGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    envScene.add(new THREE.Mesh(sphereGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));

    envSpec.panels.forEach(({ color, intensity, pos: p, size }) => {
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(size[0], size[1]),
            new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide })
        );
        panel.position.set(p[0], p[1], p[2]);
        panel.lookAt(0, 0, 0);
        envScene.add(panel);
    });

    const pmrem = new THREE.PMREMGenerator(renderer);
    const target = pmrem.fromScene(envScene, 0.02);
    pmrem.dispose();
    disposeObject(envScene);
    return target;
};

// ---------------------------------------------------------------------------
// Disposal
// ---------------------------------------------------------------------------
const TEXTURE_KEYS = ["map", "alphaMap", "envMap", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap"];

/** `shared` is an optional Set of textures that outlive `root` and must not be disposed. */
export const disposeObject = (root, shared) => {
    root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        const mats = obj.material ? (Array.isArray(obj.material) ? obj.material : [obj.material]) : [];
        mats.forEach((mat) => {
            TEXTURE_KEYS.forEach((key) => {
                const tex = mat[key];
                if (tex && !shared?.has(tex)) tex.dispose?.();
            });
            mat.dispose();
        });
    });
};

// ---------------------------------------------------------------------------
// Render loop: resize-aware, pauses when off-screen / tab hidden
// ---------------------------------------------------------------------------
export const createLoop = ({ renderer, container, onResize, update }) => {
    let rafId = 0;
    let running = false;
    let visible = true;
    let last = 0;

    const frame = (now) => {
        if (!running) return;
        rafId = requestAnimationFrame(frame);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        update(dt, now / 1000);
    };

    const start = () => {
        if (running) return;
        running = true;
        last = performance.now();
        rafId = requestAnimationFrame(frame);
    };
    const stop = () => {
        running = false;
        cancelAnimationFrame(rafId);
    };
    const sync = () => (visible && !document.hidden ? start() : stop());

    const resizeObserver = new ResizeObserver(() => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h);
        onResize(w, h);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
        ([entry]) => {
            visible = entry.isIntersecting;
            sync();
        },
        { threshold: 0 }
    );
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", sync);

    onResize(container.clientWidth || 320, container.clientHeight || 224);
    start();

    return {
        dispose: () => {
            stop();
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener("visibilitychange", sync);
        },
    };
};

export const prefersReducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Shortest signed angular distance from a to b. */
export const angleDelta = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
