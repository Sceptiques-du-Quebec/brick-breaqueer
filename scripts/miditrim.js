import fs from "fs";
import path from "path";
import { parseMidi, writeMidi } from "midi-file";

const inputPath = process.argv[2];

if (!inputPath) {
	console.error("❌ Usage: node run miditrim <fichier.mid>");
	process.exit(1);
}

if (!fs.existsSync(inputPath)) {
	console.error("❌ Fichier introuvable:", inputPath);
	process.exit(1);
}

const ext = path.extname(inputPath);
const base = inputPath.slice(0, -ext.length);
const outputPath = `${base}_trim.mid`;

const input = fs.readFileSync(inputPath);
const midi = parseMidi(input);

function addAbsoluteTime(track) {
	let time = 0;
	return track.map(event => {
		time += event.deltaTime;
		return { ...event, absoluteTime: time };
	});
}

function toDeltaTime(track) {
	let lastTime = 0;
	return track.map(event => {
		const deltaTime = event.absoluteTime - lastTime;
		lastTime = event.absoluteTime;
		const { absoluteTime, ...rest } = event;
		return { ...rest, deltaTime };
	});
}

let globalStart = Infinity;
let globalEnd = 0;

midi.tracks = midi.tracks.map(track => {
	const absTrack = addAbsoluteTime(track);
	absTrack.forEach(event => {
		if (event.type === "noteOn" && event.velocity > 0) {
			if (event.absoluteTime < globalStart) {
				globalStart = event.absoluteTime;
			}
		}
		if (event.type === "noteOff" || (event.type === "noteOn" && event.velocity === 0)) {
			if (event.absoluteTime > globalEnd) {
				globalEnd = event.absoluteTime;
			}
		}
	});
	return absTrack;
});

midi.tracks = midi.tracks.map(track => {
	let events = track.filter(e => !(e.meta && e.type === "endOfTrack"));

	if (events.length === 0) {
		return [{
			deltaTime: 0,
			meta: true,
			type: "endOfTrack"
		}];
	}

	let trimmed = events.map(e => {
		let t = e.absoluteTime - globalStart;
		return { ...e, absoluteTime: t < 0 ? 0 : t };
	});

	trimmed = trimmed.filter(e => e.absoluteTime <= (globalEnd - globalStart));

	if (trimmed.length === 0) {
		trimmed.push({
			absoluteTime: 0,
			deltaTime: 0,
			meta: true,
			type: "endOfTrack"
		});
	}

	trimmed = toDeltaTime(trimmed);
	trimmed.push({ deltaTime: 0, meta: true, type: "endOfTrack" });

	return trimmed;
});

const output = writeMidi(midi);
fs.writeFileSync(outputPath, Buffer.from(output));
console.log(`✅ MIDI trimmed: ${outputPath}`);