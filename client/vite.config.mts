import { defineConfig, splitVendorChunkPlugin } from "vite";
import { Config } from "../server/src/config";

export default defineConfig(() => {
    return {
        plugins: [
            splitVendorChunkPlugin()
        ],
        resolve: {
            extensions: ['.js', '.ts'],
        },
        server: {
            port: 3000,
            strictPort: true,
            host: "0.0.0.0",

            proxy: {
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
                }
            }
        },
        preview: {
            port: 3000,
            strictPort: true,
            host: "0.0.0.0",

            proxy: {
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
                }
            }
        }
    };
});
