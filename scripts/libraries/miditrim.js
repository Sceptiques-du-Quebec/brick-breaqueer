import { parseMidi, writeMidi } from "midi-file";

/**
 * Trime les silences au début et à la fin d'un contenu MIDI.
 * @param {Buffer|Uint8Array} srcContent - Le binaire du fichier MIDI source.
 * @param {boolean} uriBase64 - Si true, retourne une Data URI string. Sinon, retourne un Buffer.
 * @returns {Buffer|string} - Le binaire trimmé ou sa représentation Data URI.
 */
export function midiTrim(srcContent, uriBase64 = false) {
	const midi = parseMidi(srcContent);

	// Fonctions utilitaires internes
	const addAbsoluteTime = (track) => {
		let time = 0;
		return track.map(event => {
			time += event.deltaTime;
			return { ...event, absoluteTime: time };
		});
	};

	const toDeltaTime = (track) => {
		let lastTime = 0;
		return track.map(event => {
			const deltaTime = event.absoluteTime - lastTime;
			lastTime = event.absoluteTime;
			const { absoluteTime, ...rest } = event;
			return { ...rest, deltaTime };
		});
	};

	let globalStart = Infinity;
	let globalEnd = 0;

	// 1. Calculer les bornes globales basées sur l'activité des notes
	midi.tracks = midi.tracks.map(track => {
		const absTrack = addAbsoluteTime(track);
		absTrack.forEach(event => {
			if (event.type === "noteOn" && event.velocity > 0) {
				if (event.absoluteTime < globalStart) globalStart = event.absoluteTime;
			}
			if (event.type === "noteOff" || (event.type === "noteOn" && event.velocity === 0)) {
				if (event.absoluteTime > globalEnd) globalEnd = event.absoluteTime;
			}
		});
		return absTrack;
	});

	// Sécurité si aucune note n'est trouvée
	if (globalStart === Infinity) {
		return uriBase64 
			? `data:audio/midi;base64,${Buffer.from(srcContent).toString('base64')}` 
			: Buffer.from(srcContent);
	}

	// 2. Ajuster les timings et filtrer les événements
	midi.tracks = midi.tracks.map(track => {
		let events = track.filter(e => !(e.meta && e.type === "endOfTrack"));

		if (events.length === 0) {
			return [{ deltaTime: 0, meta: true, type: "endOfTrack" }];
		}

		let trimmed = events.map(e => {
			let t = e.absoluteTime - globalStart;
			return { ...e, absoluteTime: t < 0 ? 0 : t };
		});

		trimmed = trimmed.filter(e => e.absoluteTime <= (globalEnd - globalStart));

		if (trimmed.length === 0) {
			trimmed.push({ absoluteTime: 0, deltaTime: 0, meta: true, type: "endOfTrack" });
		}

		trimmed = toDeltaTime(trimmed);
		trimmed.push({ deltaTime: 0, meta: true, type: "endOfTrack" });

		return trimmed;
	});

	// 3. Exportation
	const outputUint8Array = writeMidi(midi);
	const outputBuffer = Buffer.from(outputUint8Array);

	if (uriBase64) {
		return `data:audio/midi;base64,${outputBuffer.toString('base64')}`;
	}

	return outputBuffer;
}