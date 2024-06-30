import { type ProxyOptions, defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { Config } from "../server/src/config";

const proxyConfig: Record<string, ProxyOptions> = {
    "/api": {
        target: `http://${Config.host}:${Config.port}`,
        changeOrigin: true,
        secure: false
    },
    "/play": {
        target: `http://${Config.host}:${Config.port}`,
        changeOrigin: true,
        secure: false,
        ws: true
    },
    "/team_v2": {
        target: `http://${Config.host}:${Config.port}`,
        changeOrigin: true,
        secure: false,
        ws: true
    }
};

export default defineConfig(() => {
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
            })
        ],
        json: {
            stringify: true
        },
        server: {
            port: 3000,
            strictPort: true,
            host: "0.0.0.0",
            proxy: proxyConfig
        },
        preview: {
            port: 3000,
            strictPort: true,
            host: "0.0.0.0",
            proxy: proxyConfig
        }
    };
});
