import { resolve } from "node:path";
import { type Plugin, type ServerOptions, defineConfig } from "vite";
import { getConfig } from "../config";
import { version } from "../package.json";
import { GIT_VERSION } from "../server/src/utils/gitRevision";
import { codefendPlugin } from "./vite-plugins/codefendPlugin";
import { ejsPlugin } from "./vite-plugins/ejsPlugin";

import stripBlockPlugin from "vite-plugin-strip-block";

export const SplashThemes = {
    main: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash.png",
    },
    easter: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_easter.png",
    },
    halloween: {
        MENU_MUSIC: "audio/ambient/menu_music_02.mp3",
        SPLASH_BG: "/img/main_splash_halloween.png",
    },
    faction: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_0_7_0.png",
    },
    snow: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_0_6_10.png",
    },
    spring: {
        MENU_MUSIC: "audio/ambient/menu_music_01.mp3",
        SPLASH_BG: "/img/main_splash_7_3.png",
    },
};

export default defineConfig(({ mode }) => {
    const isDev = mode === "development";

    const Config = getConfig(!isDev, "");

    const selectedTheme = SplashThemes[Config.clientTheme];

    process.env.VITE_ADIN_PLAY_SCRIPT = "";
    process.env.VITE_AIP_PLACEMENT_ID = "";
    process.env.VITE_TURNSTILE_SCRIPT = "";

    if (Config.secrets.AIP_ID) {
        process.env.VITE_ADIN_PLAY_SCRIPT = `
    <script async src="//api.adinplay.com/libs/aiptag/pub/SNP/${Config.secrets.AIP_PLACEMENT_ID}/tag.min.js"></script>
    <script>
        window.aiptag = window.aiptag || { cmd: [] };
        aiptag.cmd.display = aiptag.cmd.display || [];
        // CMP tool settings
        aiptag.cmp = {
            show: true,
            position: "centered", // centered, bottom
            button: false,
            buttonText: "Privacy settings",
            buttonPosition: "bottom-left", // bottom-left, bottom-right, top-left, top-right
        };
    </script>
    `;
        process.env.VITE_AIP_PLACEMENT_ID = Config.secrets.AIP_PLACEMENT_ID;
    }

    if (Config.secrets.TURNSTILE_SITE_KEY) {
        process.env.VITE_TURNSTILE_SCRIPT = `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>`;
    }

    process.env = {
        ...process.env,
        VITE_GAME_VERSION: version,
        VITE_BACKGROUND_IMG: selectedTheme.SPLASH_BG,
    };

    const plugins: Plugin[] = [ejsPlugin()];

    if (!isDev) {
        plugins.push(codefendPlugin());

        plugins.push(
            stripBlockPlugin({
                start: "STRIP_FROM_PROD_CLIENT:START",
                end: "STRIP_FROM_PROD_CLIENT:END",
            }),
        );
    }

    const serverOptions: ServerOptions = {
        port: Config.vite.port,
        host: Config.vite.host,
        proxy: {
            // regex that matches /stats, /stats/slug but doesn't match /stats/
            // since if it matches /stats/ it will infinite loop :p
            // also why does vite not work without trailing slashes at the end of paths 😭
            "^/stats(?!/$).*": {
                target: `http://${Config.vite.host}:${Config.vite.port}`,
                rewrite: (path) => path.replace(/^\/stats(?!\/$).*/, "/stats/"),
                changeOrigin: true,
                secure: false,
            },
            "/api": {
                target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                changeOrigin: true,
                secure: false,
            },
            "/team_v2": {
                target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                changeOrigin: true,
                secure: false,
                ws: true,
            },
        },
    };

    return {
        appType: "mpa",
        base: "",
        build: {
            target: "es2022",
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                input: {
                    main: resolve(import.meta.dirname, "index.html"),
                    stats: resolve(import.meta.dirname, "stats/index.html"),
                },
                output: {
                    assetFileNames(assetInfo) {
                        if (assetInfo.names[0]?.endsWith(".css")) {
                            return "css/[name]-[hash][extname]";
                        }
                        return "assets/[name]-[hash][extname]";
                    },
                    entryFileNames: "js/[hash].js",
                    chunkFileNames: "js/[hash].js",
                },
            },
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        define: {
            GAME_REGIONS: Config.regions,
            GIT_VERSION: JSON.stringify(GIT_VERSION),
            PING_TEST_URLS: Object.entries(Config.regions).map(([key, data]) => {
                return {
                    region: key,
                    zone: key,
                    url: data.address,
                    https: data.https,
                };
            }),
            MENU_MUSIC: JSON.stringify(selectedTheme.MENU_MUSIC),
            AIP_PLACEMENT_ID: JSON.stringify(Config.secrets.AIP_PLACEMENT_ID),
            IS_DEV: isDev,
            GOOGLE_LOGIN_SUPPORTED: JSON.stringify(
                Config.secrets.GOOGLE_CLIENT_ID && Config.secrets.GOOGLE_SECRET_ID,
            ),
            DISCORD_LOGIN_SUPPORTED: JSON.stringify(
                Config.secrets.DISCORD_CLIENT_ID && Config.secrets.DISCORD_SECRET_ID,
            ),
            MOCK_LOGIN_SUPPORTED: JSON.stringify(Config.debug.allowMockAccount),
            TURNSTILE_SITE_KEY: JSON.stringify(Config.secrets.TURNSTILE_SITE_KEY),
        },
        plugins,
        json: {
            stringify: true,
        },
        server: serverOptions,
        preview: serverOptions,
    };
});
