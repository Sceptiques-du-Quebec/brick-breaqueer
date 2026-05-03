import path from "node:path";
import { fileURLToPath } from "node:url";
import buildConf from './libraries/buildconf.js';
import { createWatchers, buildCSS, buildJS } from "chokibasic";

// Configuration de l'équivalent __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { close } = createWatchers(
    [
        {
            name: "js",
            patterns: ["src/scripts/**/*.js"],
            ignored: ["**/*.min.js"],
            callback: async (events) => {
                console.log("[js] batch", events.length, events.map(e => e.file));
                
                const loaderentry = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.js");
                const loaderoutfile = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.min.js");
                
                try {
                    await buildJS(loaderentry, loaderoutfile);
                } catch (err) {
                    console.error("❌ Build error:", err);
                }
                console.log("");
            },
        },
        {
            name: "yaml",
            patterns: ["src/scripts/**/*.yaml"],
            callback: async (events) => {
                console.log("[yaml] batch", events.length, events.map(e => e.file));
                
                const yamlconf = path.resolve(__dirname, "../src/scripts/libraries/rainbowbreaker.yaml");
                const jsonconf = path.resolve(__dirname, "../src/scripts/libraries/rainbowbreaker.json");
                const loaderentry = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.js");
                const loaderoutfile = path.resolve(__dirname, "../src/scripts/brickbreaqueer.core.min.js");
                
                try {
                    await buildConf(yamlconf, jsonconf);
                    await buildJS(loaderentry, loaderoutfile);
                } catch (err) {
                    console.error("❌ Build error:", err);
                }
                console.log("");
            },
        },
    ],
    {
        cwd: process.cwd(),
        debug: true
    }
);

// Gestion propre de la fermeture (Ctrl+C)
process.on("SIGINT", async () => {
    await close();
    process.exit(0);
});