import path from 'node:path';
import chokibasic from 'chokibasic';
import { fileURLToPath } from 'node:url';
import { buildConf } from 'chokibasic';
import { midiTrim } from './libraries/miditrim.js';
import { processMp3 } from './libraries/processmp3.js';
import { processSvg } from './libraries/processsvg.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const src = path.resolve(__dirname, "../src/scripts/libraries/rainbowbreaker.yaml");
const dst = path.resolve(__dirname, "../src/scripts/libraries/rainbowbreaker.json");

try {
	buildConf(src, dst, {
		"**/*.json": (content) => JSON.parse(content.toString('utf8')),
		"**/*.mid": (content)  => midiTrim(content, true),
		"**/*.mp3": (content)  => processMp3(content),
		"**/*.svg": (content)  => processSvg(content, 800)
	});
} catch (err) {
    console.error("Erreur lors du traitement MIDI :", err);
}


