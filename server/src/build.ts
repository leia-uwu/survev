import { existsSync, rmSync } from "node:fs";
import esbuild from "esbuild";

if (existsSync("./dist")) {
    rmSync("./dist", { recursive: true });
}

esbuild.buildSync({
    entryPoints: [
        "./src/gameServer.ts",
        "./src/game/gameProcess.ts",
        "./src/api/index.ts",
    ],
    bundle: true,
    minify: true,
    outdir: "./dist",
    platform: "node",
    packages: "external",
    entryNames: "[name]",
    sourcemap: "linked",
    logLevel: "debug",
    format: "esm",
    define: {
        "process.env.NODE_ENV": "'production'",
    },
});
