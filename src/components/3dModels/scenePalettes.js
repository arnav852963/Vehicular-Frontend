// Single source of truth for every colour used by the three.js scenes.
// "dusk"  -> neon-lit indigo night drive (matches the slate / indigo UI)
// "beige" -> warm golden-hour drive      (matches the cream / amber UI)

export const SCENE_PALETTES = {
    dusk: {
        isNight: true,

        // sky + atmosphere (fog colour === horizon colour so the ground melts into the sky)
        skyTop: "#050716",
        skyMid: "#15154a",
        horizon: "#2a2d78",
        celestial: "#e0e7ff",
        celestialGlow: "#818cf8",
        starOpacity: 0.9,
        fogNear: 8,
        fogFar: 30,

        // world
        ground: 0x0c1230,
        road: 0x1a2133,
        roadEdge: 0x94a3b8,
        roadStripe: 0x818cf8,
        rail: 0x64748b,
        mountainFar: 0x2d2f86,
        mountainNear: 0x1b1b57,
        mountainSnow: 0x7c83ee,
        foliage: [0x312e81, 0x1e40af, 0x4338ca],
        trunk: 0x14131f,
        lampPole: 0x334155,
        lampLight: 0x7dd3fc,
        lampsOn: true,

        // vehicle
        paint: 0x4f46e5,
        paintDeep: 0x2b2a8f,
        glass: 0x070a18,
        trim: 0xcbd5e1,
        rim: 0x94a3b8,
        cargo: 0xcbd5e1,
        cargoRib: 0x94a3b8,
        accent: 0x38bdf8,
        headlight: 0xdff4ff,
        beam: 0x7dd3fc,
        beamOpacity: 0.2,
        taillight: 0xff3b5c,
        sign: 0x38bdf8,

        // lights
        hemiSky: 0x6366f1,
        hemiGround: 0x0b1030,
        hemiIntensity: 1.0,
        keyColor: 0x9aa8ff,
        keyIntensity: 2.1,
        keyPos: [-5, 8, 6],
        rimColor: 0x38bdf8,
        rimIntensity: 2.4,
        envIntensity: 0.42,
        underglow: 0x38bdf8,
        underglowOpacity: 0.5,
        shadowOpacity: 0.55,
        streak: 0x7dd3fc,
        streakOpacity: 0.32,
        streakBlend: "additive",

        // reflection environment (studio softboxes tinted by theme)
        env: {
            top: "#2a2d78",
            horizon: "#4c51bf",
            bottom: "#05060f",
            panels: [
                { color: "#c7d2fe", intensity: 1.8, pos: [-4, 8, 5], size: [8, 4] },
                { color: "#38bdf8", intensity: 1.6, pos: [6, 3, -6], size: [3, 8] },
                { color: "#a78bfa", intensity: 2.2, pos: [7, 2, 5], size: [3, 5] },
            ],
        },

        // profile orb
        profile: {
            bgInner: "#232672",
            bgOuter: "#070a1c",
            shell: 0x818cf8,
            core: 0x38bdf8,
            coreEmissive: 0x2563eb,
            ringA: 0x818cf8,
            ringB: 0x38bdf8,
            node: 0x7dd3fc,
            particle: 0xa5b4fc,
            glow: "#6366f1",
            glowOpacity: 0.55,
        },
    },

    beige: {
        isNight: false,

        skyTop: "#fbe4b4",
        skyMid: "#fcecd0",
        horizon: "#f6e9d3",
        celestial: "#fff1c7",
        celestialGlow: "#ffc978",
        starOpacity: 0,
        fogNear: 9,
        fogFar: 32,

        ground: 0xd6c6a2,
        road: 0x58514a,
        roadEdge: 0xfaf3e0,
        roadStripe: 0xfef3c7,
        rail: 0xa8a29e,
        mountainFar: 0xcfb48a,
        mountainNear: 0xa88b62,
        mountainSnow: 0xfff7e6,
        foliage: [0x9a4a0c, 0xb45f0a, 0x8a6218],
        trunk: 0x57402b,
        lampPole: 0x78716c,
        lampLight: 0xfde68a,
        lampsOn: false,

        paint: 0xb9500a,
        paintDeep: 0x7c2d12,
        glass: 0x1c1917,
        trim: 0xe7e5e4,
        rim: 0xd4af37,
        cargo: 0xf8f1e2,
        cargoRib: 0xd6c9ad,
        accent: 0xfbbf24,
        headlight: 0xfff3c4,
        beam: 0xfde68a,
        beamOpacity: 0.07,
        taillight: 0xe11d48,
        sign: 0xfbbf24,

        hemiSky: 0xfff4e0,
        hemiGround: 0xc9b48c,
        hemiIntensity: 0.9,
        keyColor: 0xffe2b0,
        keyIntensity: 1.7,
        keyPos: [5, 8, 6],
        rimColor: 0xffffff,
        rimIntensity: 0.9,
        envIntensity: 0.5,
        underglow: 0xfbbf24,
        underglowOpacity: 0.0,
        shadowOpacity: 0.42,
        streak: 0x92400e,
        streakOpacity: 0.16,
        streakBlend: "normal",

        env: {
            top: "#fff1d6",
            horizon: "#f6dfb8",
            bottom: "#b79d70",
            panels: [
                { color: "#fff7e6", intensity: 1.6, pos: [5, 8, 6], size: [9, 5] },
                { color: "#ffe0a6", intensity: 2.2, pos: [-6, 3, 3], size: [4, 6] },
                { color: "#ffffff", intensity: 0.6, pos: [0, 4, -8], size: [8, 3] },
            ],
        },

        profile: {
            bgInner: "#fff4de",
            bgOuter: "#f0dcb6",
            shell: 0xb45309,
            core: 0xf59e0b,
            coreEmissive: 0xd97706,
            ringA: 0xb45309,
            ringB: 0xd97706,
            node: 0xf59e0b,
            particle: 0xb45309,
            glow: "#fbbf24",
            glowOpacity: 0.7,
        },
    },
};

export const getPalette = (theme) => (theme === "beige" ? SCENE_PALETTES.beige : SCENE_PALETTES.dusk);
