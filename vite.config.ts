import { defineConfig } from "vite";
import { Config } from "./src/config";

export default defineConfig(() => {
    return {
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
                    target: `http://${Config.host}:${Config.port}/play`,
                    changeOrigin: true,
                    secure: false,
                    ws: true
                }
            }
        }
    };
});
