import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildCSS, buildJS, buildConf } from "chokibasic";
// import { buildCSS, buildJS, buildConf } from "../../chokibasic/index.js";
import { midiTrim } from './libraries/miditrim.js';
import { processMp3 } from './libraries/processmp3.js';
import { processSvg } from './libraries/processsvg.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcin = path.resolve(__dirname, "../src/");
const ljsin = path.resolve(srcin, "scripts/brickbreaqueer.core.js");
const ljsout = path.resolve(srcin, "scripts/brickbreaqueer.core.min.js");

const ROOT = process.cwd();
const SRCCONF = path.join(ROOT, 'src/scripts/libraries/rainbowbreaker.yaml');
const DSTCONF = path.join(ROOT, 'src/scripts/libraries/rainbowbreaker.json');


(async () => {
	try {
		await buildConf(SRCCONF, DSTCONF, {
			"**/*.json": (content) => JSON.parse(content.toString('utf8')),
			"**/*.mid": (content) => midiTrim(content, true),
			"**/*.mp3": (content) => processMp3(content),
			"**/*.svg": (content) => processSvg(content, 800)
		});
		await buildJS(ljsin, ljsout);
		console.log("✅ Build terminé avec succès !");
	} catch (error) {
		console.error("❌ Erreur lors du build :", error);
	}
})();