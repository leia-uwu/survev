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
        menuMusic: "audio/ambient/menu_music_01.mp3",
        splashBg: "/img/main_splash.png",
    },
    easter: {
        menuMusic: "audio/ambient/menu_music_01.mp3",
        splashBg: "/img/main_splash_easter.png",
    },
    halloween: {
        menuMusic: "audio/ambient/menu_music_02.mp3",
        splashBg: "/img/main_splash_halloween.png",
    },
    faction: {
        menuMusic: "audio/ambient/menu_music_01.mp3",
        splashBg: "/img/main_splash_0_7_0.png",
    },
    cobalt: {
        menuMusic: "audio/ambient/menu_music_01.mp3",
        splashBg: "/img/main_splash_cobalt.png",
    },
    snow: {
        menuMusic: "audio/ambient/menu_music_01.mp3",
        splashBg: "/img/main_splash_0_6_10.png",
    },
    spring: {
        menuMusic: "audio/ambient/menu_music_01.mp3",
        splashBg: "/img/main_splash_7_3.png",
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
        process.env.VITE_ADIN_PLAY_SCRIPT = `<script>
        const urlParams = new URLSearchParams(self.location.search);

        const isCrazyGames = urlParams.has("crazygames");

        const isPOKI = window != window.parent && document.referrer && (() => { try { return new URL(document.referrer).origin.includes("poki"); } catch(e) { return false; } })();

        const isWithinGameMonetize = window.location.href.includes("gamemonetize") || (window != window.parent && document.referrer && (() => { try { return new URL(document.referrer).origin.includes("gamemonetize"); } catch(e) { return false; } })());

        if (!isCrazyGames && !isPOKI && !isWithinGameMonetize) {
            const script = document.createElement("script");
            script.src = "//api.adinplay.com/libs/aiptag/pub/SNP/${Config.secrets.AIP_ID}/tag.min.js";
            document.head.appendChild(script);

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

            script.addEventListener("load", () => {
                window.aiptag.cmd.display.push(() => {
                    window.aipDisplayTag.display("${Config.secrets.AIP_PLACEMENT_ID}_728x90");
                });
            });
        }
    </script>`;
        process.env.VITE_AIP_PLACEMENT_ID = Config.secrets.AIP_PLACEMENT_ID;
    }

    if (Config.secrets.TURNSTILE_SITE_KEY) {
        process.env.VITE_TURNSTILE_SCRIPT = `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" defer></script>`;
    }

    process.env.VITE_GAME_VERSION = version;
    process.env.VITE_BACKGROUND_IMG = selectedTheme.splashBg;

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
            // this redirects /stats to /stats/
            // because vite is cringe and does not work without trailing slashes at the end of paths 😭
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
            MENU_MUSIC: JSON.stringify(selectedTheme.menuMusic),
            AIP_PLACEMENT_ID: JSON.stringify(Config.secrets.AIP_PLACEMENT_ID),
            VITE_GAMEMONETIZE_ID: JSON.stringify(Config.secrets.GAMEMONETIZE_ID),
            IS_DEV: isDev,
            PROXY_DEFS: JSON.stringify(Config.proxies),
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
