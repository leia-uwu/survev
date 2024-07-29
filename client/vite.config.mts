import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import stripBlockPlugin from "vite-plugin-strip-block";
import { Config } from "../server/src/config";

export default defineConfig(({ mode }) => {
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
                    }
                }
            }
        },
        resolve: {
            extensions: [".js", ".ts"]
        },
        define: {
            GAME_REGIONS: {
                ...Config.regions,
                ...(mode === "development"
                    ? {
                          local: {
                              https: false,
                              address: `${Config.devServer.host}:${Config.devServer.port}`,
                              l10n: "index-local"
                          }
                      }
                    : {})
            }
        },
        plugins: [
            VitePWA({
                registerType: "autoUpdate",
                includeAssets: ["favicon.ico", "img/apple-touch-icon-180x180.png"],
                manifest: {
                    name: "Resurviv",
                    short_name: "Resurviv",
                    description: "Describe me daddy",
                    background_color: "#80af49",
                    theme_color: "#80af49",
                    icons: [
                        {
                            src: "img/pwa-192x192.png",
                            sizes: "192x192",
                            type: "image/png"
                        },
                        {
                            src: "img/pwa-512x512.png",
                            sizes: "512x512",
                            type: "image/png"
                        }
                    ]
                },
                devOptions: {
                    enabled: true
                }
            }),
            stripBlockPlugin({
                start: "STRIP_FROM_PROD_CLIENT:START",
                end: "STRIP_FROM_PROD_CLIENT:END"
            })
        ],
        json: {
            stringify: true
        },
        server: {
            port: 3000,
            strictPort: true,
            host: "0.0.0.0",
            proxy: {
                "/api": {
                    target: `http://${Config.devServer.host}:${Config.devServer.port}`,
                    changeOrigin: true,
                    secure: false
                },
                "/team_v2": {
                    target: `http://${Config.devServer.host}:${Config.devServer.port}`,
                    changeOrigin: true,
                    secure: false,
                    ws: true
                }
            }
        },
        preview: {
            port: 3000,
            strictPort: true,
            host: "0.0.0.0",
            proxy: {
                "/api": {
                    target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                    changeOrigin: true,
                    secure: false
                },
                "/team_v2": {
                    target: `http://${Config.apiServer.host}:${Config.apiServer.port}`,
                    changeOrigin: true,
                    secure: false,
                    ws: true
                }
            }
        }
    };
});
