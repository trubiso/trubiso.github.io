const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const NOTES_USER = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function parseChord(chordString) {
	return chordString.trim().split(" ").map(x => NOTES.findIndex(y => y === x));
}

function transformChord(chord, base) {
	return chord.map(x => (12 + x - base) % 12);
}

const DEGREES = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];

function nameChord(chord, octaves) {
	const candidates = [];
	for (const note of new Set(chord)) {
		const transformed = transformChord(chord, note);
		for (const [shape, name, forbid5, degrees] of SHAPES) {
			if (forbid5 && transformed.includes(7)) continue;
			if (!shape.every(x => transformed.includes(x))) continue;
			if (!transformed.every(x => shape.includes(x) || x === 7)) continue;

			let score = shape.filter(x => x !== 7).length;
			if (transformed.includes(7)) score++;
			if (chord[0] === note) score += 0.5;
			const chordDegrees = getDegreesAccordingToChord(transformed, degrees);
			const chordDegreeNotes = chordDegrees.map(x => degreeNameMap[x][note]);
			const chordName = chord[0] === note
				? `${NOTES_USER[note]}${name}`
				: `${NOTES_USER[note]}${name}/${chordDegreeNotes[0]}`;

			const octavedChordDegreeNotes = chordDegreeNotes.map((x, i) => `${x}${octaves[i]}`);

			candidates.push([chordName, octavedChordDegreeNotes, score]);
		}
	}

	candidates.sort((a, b) => b[2] - a[2]);
	return [candidates.map(([name]) => [name]), candidates[0]?.[1]];
}

const main = document.getElementById("main-candidate");
const secondary = document.getElementById("secondary-candidates");

function updateCandidates(candidates, notesPlaying, base) {
	if (!candidates.length) {
		main.textContent = notesPlaying ? `${base} n.c.` : "";
		secondary.textContent = "";
		return;
	}

	if (candidates.length === 1) {
		main.textContent = candidates[0];
		secondary.textContent = "";
		return;
	}

	main.textContent = candidates[0];
	secondary.textContent = candidates.slice(1).join("\n");
}

const synth = new Tone.Sampler({
	urls: {
		A0: "A0.mp3",
		C1: "C1.mp3",
		"D#1": "Ds1.mp3",
		"F#1": "Fs1.mp3",
		A1: "A1.mp3",
		C2: "C2.mp3",
		"D#2": "Ds2.mp3",
		"F#2": "Fs2.mp3",
		A2: "A2.mp3",
		C3: "C3.mp3",
		"D#3": "Ds3.mp3",
		"F#3": "Fs3.mp3",
		A3: "A3.mp3",
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
		C5: "C5.mp3",
		"D#5": "Ds5.mp3",
		"F#5": "Fs5.mp3",
		A5: "A5.mp3",
		C6: "C6.mp3",
		"D#6": "Ds6.mp3",
		"F#6": "Fs6.mp3",
		A6: "A6.mp3",
		C7: "C7.mp3",
		"D#7": "Ds7.mp3",
		"F#7": "Fs7.mp3",
		A7: "A7.mp3",
		C8: "C8.mp3",
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

synth.context.lookAhead = 0.001;

let notes = new Set();

function updateCandidatesFromNotes() {
	const noteArray = Array.from(notes.keys());
	noteArray.sort((a, b) => {
		const ao = parseInt(a.slice(a.length - 1));
		const bo = parseInt(b.slice(b.length - 1));
		if (ao !== bo) return ao - bo;
		const an = a.slice(0, a.length - 1);
		const bn = b.slice(0, b.length - 1);
		const ai = NOTES.findIndex(x => x === an);
		const bi = NOTES.findIndex(x => x === bn);
		return ai - bi;
	});
	const noteValues = noteArray.map(note => NOTES.findIndex(x => x === note.slice(0, note.length - 1)));
	const [names, ocdn] = nameChord(noteValues, noteArray.map(note => parseInt(note.slice(note.length - 1))));

	updateCandidates(
		names,
		noteArray.length > 1,
		noteArray.length
			? NOTES_USER[NOTES.findIndex(x => x === noteArray[0].slice(0, noteArray[0].length - 1))]
			: "-"
	);

	if (ocdn) displayNotes(ocdn);
	else if (noteArray.length) displayNotes(noteArray);
	else clearNotes();

	for (const child of piano.children) {
		const isPlaying = notes.has(child.dataset.note);
		const showsPlaying = child.classList.contains("key-pressed");
		if (isPlaying === showsPlaying) continue;
		if (isPlaying) child.classList.add("key-pressed");
		else child.classList.remove("key-pressed");
	}
}

function play(noteName, velocity = 127) {
	if (notes.has(noteName)) return;
	notes.add(noteName);
	synth.triggerAttack(noteName, undefined, velocity / 127);
	updateCandidatesFromNotes();
}

function stop(noteName) {
	if (!notes.has(noteName)) return;
	notes.delete(noteName);
	synth.triggerRelease(noteName);
	updateCandidatesFromNotes();
}
