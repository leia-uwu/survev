import { defineConfig } from "vite";
import stripBlockPlugin from "vite-plugin-strip-block";
import { version } from "../package.json";
import { Config } from "../server/src/config";
import { GIT_VERSION } from "../server/src/utils/gitRevision";
import { codefendPlugin } from "./vite-plugins/codefendPlugin";

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

const selectedTheme = SplashThemes[Config.client.theme];

const AdsVars = {
    VITE_ADIN_PLAY_SCRIPT: `
    <script async src="//api.adinplay.com/libs/aiptag/pub/SNP/${Config.client.AIP_ID}/tag.min.js"></script>
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
    `,
    VITE_AIP_PLACEMENT_ID: Config.client.AIP_PLACEMENT_ID,
};

if (!Config.client.AIP_ID) {
    for (const key in AdsVars) {
        AdsVars[key] = "";
    }
}

export default defineConfig(({ mode }) => {
    process.env = {
        ...process.env,
        VITE_GAME_VERSION: version,
        VITE_BACKGROUND_IMG: selectedTheme.SPLASH_BG,
        ...AdsVars,
    };

    const isDev = mode === "development";

    const regions = {
        ...Config.regions,
        ...(isDev
            ? {
                  local: {
                      https: false,
                      address: `${Config.devServer.host}:${Config.devServer.port}`,
                      l10n: "index-local",
                  },
              }
            : {}),
    };

    return {
        base: "",
        build: {
            target: "es2022",
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                output: {
                    assetFileNames(assetInfo) {
                        if (assetInfo.names[0]?.endsWith(".css")) {
                            return "css/[name]-[hash][extname]";
                        }
                        return "assets/[name]-[hash][extname]";
                    },
                    entryFileNames: "js/app-[hash].js",
                    chunkFileNames: "js/[name]-[hash].js",
                    manualChunks(id, _chunkInfo) {
                        if (id.includes("node_modules")) {
                            return "vendor";
                        }
                        if (id.includes("shared")) {
                            return "shared";
                        }
                    },
                },
            },
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        define: {
            GAME_REGIONS: regions,
            GIT_VERSION: JSON.stringify(GIT_VERSION),
            PING_TEST_URLS: Object.entries(regions).map(([key, data]) => {
                return {
                    region: key,
                    zone: key,
                    url: data.address,
                    https: data.https,
                };
            }),
            MENU_MUSIC: JSON.stringify(selectedTheme.MENU_MUSIC),
            AIP_PLACEMENT_ID: JSON.stringify(Config.client.AIP_PLACEMENT_ID),
        },
        plugins: !isDev
            ? [
                  codefendPlugin(),
                  stripBlockPlugin({
                      start: "STRIP_FROM_PROD_CLIENT:START",
                      end: "STRIP_FROM_PROD_CLIENT:END",
                  }),
              ]
            : undefined,
        json: {
            stringify: true,
        },
        server: {
            port: 3000,
            host: "0.0.0.0",
            proxy: {
                "/api": {
                    target: `http://${Config.devServer.host}:${Config.devServer.port}`,
                    changeOrigin: true,
                    secure: false,
                },
                "/team_v2": {
                    target: `http://${Config.devServer.host}:${Config.devServer.port}`,
                    changeOrigin: true,
                    secure: false,
                    ws: true,
                },
            },
        },
        preview: {
            port: 3000,
            host: "0.0.0.0",
            proxy: {
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
        },
    };
});
