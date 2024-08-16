import { defineConfig, minimalPreset as preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
    preset,
    images: ["public/img/icon_app.png"],
});
