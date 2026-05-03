import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCSS, buildJS } from "chokibasic";
import buildConf from './libraries/buildconf.js';

// Équivalent de __dirname pour les modules ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcin = path.resolve(__dirname, "../src/");
const ljsin = path.resolve(srcin, "scripts/brickbreaqueer.core.js");
const ljsout = path.resolve(srcin, "scripts/brickbreaqueer.core.min.js");

const ROOT = process.cwd();
const SRCCONF = path.join(ROOT, 'rainbowbreaker.yaml');
const DSTCONF = path.join(ROOT, 'src/scripts/libraries/rainbowbreaker.json');

// Exécution de la fonction asynchrone
(async () => {
	try {
		await buildConf(SRCCONF, DSTCONF);
		await buildJS(ljsin, ljsout);
		console.log("✅ Build terminé avec succès !");
	} catch (error) {
		console.error("❌ Erreur lors du build :", error);
	}
})();