import { defineConfig } from "vite";
import stripBlockPlugin from "vite-plugin-strip-block";
import { version } from "../package.json";
import { Config } from "../server/src/config";
import { GIT_VERSION } from "../server/src/utils/gitRevision";

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

const selectedTheme = SplashThemes["main"];

export default defineConfig(({ mode }) => {
    process.env = {
        ...process.env,
        VITE_GAME_VERSION: version,
        VITE_BACKGROUND_IMG: selectedTheme.SPLASH_BG,
    };

    const regions = {
        ...Config.regions,
        ...(mode === "development"
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
            chunkSizeWarningLimit: 2000,
            rollupOptions: {
                output: {
                    assetFileNames(assetInfo) {
                        if (assetInfo.name?.endsWith(".css")) {
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
            extensions: [".js", ".ts"],
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
        },
        plugins: [
            mode !== "development"
                ? stripBlockPlugin({
                      start: "STRIP_FROM_PROD_CLIENT:START",
                      end: "STRIP_FROM_PROD_CLIENT:END",
                  })
                : undefined,
        ],
        json: {
            stringify: true,
        },
        server: {
            port: 3000,
            strictPort: true,
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
            strictPort: true,
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
