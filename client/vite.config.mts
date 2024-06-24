import { ProxyOptions, defineConfig } from "vite";
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
}

export default defineConfig(() => {
    return {
        base: "",
        build: {
            chunkSizeWarningLimit: 1000,
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
                    manualChunks(id, chunkInfo) {
                        if (id.includes("node_modules")) {
                            return "vendor";
                        } else if (id.includes("shared")) {
                            return "shared";
                        }
                    },
                }
            },
        },
        resolve: {
            extensions: ['.js', '.ts'],
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
