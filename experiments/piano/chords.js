const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const NOTES_USER = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function parseChord(chordString) {
	return chordString.trim().split(" ").map(x => NOTES.findIndex(y => y === x));
}

function transformChord(chord, base) {
	return chord.map(x => (12 + x - base) % 12);
}

const DEGREES = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];

function getChordCandidates(chord, octaves, onlyRooted = false, rootless = false, require5 = false) {
	const candidates = [];
	const chordTones = new Set(chord);
	for (const note of rootless ? NOTES.map((x, i) => i).filter(x => !chordTones.has(x)) : chordTones) {
		const transformed = transformChord(chord, note);
		for (const [rawShape, name, forbid5, rawDegrees, penalty] of SHAPES) {
			if (require5 && !forbid5 && !transformed.includes(7)) continue;
			const shape = rootless ? rawShape.filter(x => x !== 0) : rawShape;
			const degrees = rootless ? rawDegrees.filter(x => x !== "1") : rawDegrees;
			if (forbid5 && transformed.includes(7)) continue;
			if (!shape.every(x => transformed.includes(x))) continue;
			if (!transformed.every(x => shape.includes(x) || x === 7)) continue;

			// FIXME: this places regular chords at a disadvantage from polychords,
			// because this only counts unique notes
			let score = shape.filter(x => x !== 7).length;
			if (transformed.includes(7)) score++;
			if (!onlyRooted && chord[0] === note) score += 0.5;
			score += penalty;
			const chordDegrees = getDegreesAccordingToChord(transformed, degrees);
			const chordDegreeNotes = chordDegrees.map(x => degreeNameMap[x][note]);
			const chordName = ((chord[0] === note || onlyRooted || rootless)
				? `${NOTES_USER[note]}${name}`
				: `${NOTES_USER[note]}${name}\u2060/\u2060${chordDegreeNotes[0]}`)
				+ (rootless ? " (rootless)" : "");

			const octavedChordDegreeNotes = chordDegreeNotes.map((x, i) => `${x}${octaves[i]}`);

			candidates.push([chordName, octavedChordDegreeNotes, score]);
		}
	}

	return candidates;
}

let nameUpperStructures = document.getElementById("name-upper-structures").checked;
let includeRootless = document.getElementById("include-rootless").checked;
let includePolychords = document.getElementById("include-polychords").checked;

function setNameUpperStructures(value) {
	nameUpperStructures = value;
}

function setIncludeRootless(value) {
	includeRootless = value;
}

function setIncludePolychords(value) {
	includePolychords = value;
}

function nameChord(chord, octaves) {
	if (chord.length === 1) return [[], null];

	if (chord.length === 2) {
		const [base, other] = transformChord(chord, chord[0]);
		const alternative = octaves[1] > octaves[0];
		const intervalData = intervalNames[other];
		const [degree, name] = intervalData.length > 1
			? intervalData[alternative ? 1 : 0]
			: intervalData[0];
		const chordDegrees = ["1", degree];
		const chordDegreeNotes = chordDegrees.map(x => degreeNameMap[x][chord[0]]);
		const octavedChordDegreeNotes = chordDegreeNotes.map((x, i) => `${x}${octaves[i]}`);
		// FIXME: sometimes the octaves are silly
		return [[[`${NOTES_USER[chord[0]]} ${name}`]], octavedChordDegreeNotes];
	}

	const candidates = getChordCandidates(chord, octaves);
	if (includeRootless) candidates.push(...getChordCandidates(chord, octaves, false, true));
	if (nameUpperStructures && chord.length > 3 && chord[1] !== chord[0]) {
		const upperStructures = getChordCandidates(chord.slice(1), octaves.slice(1), true);
		
		for (const upperStructure of upperStructures) {
			if (upperStructure[0].startsWith(NOTES_USER[chord[0]])) continue;
			// FIXME: sometimes this creates duplicates like F#/Bb vs F#/A#. we need a way to stop that
			const name = `${upperStructure[0]}\u2060/\u2060${NOTES_USER[chord[0]]}`;
			if (!candidates.some(x => x[0] === name))
				candidates.push([
					name,
					[`${NOTES_USER[chord[0]]}${octaves[0]}`,...upperStructure[1]],
					upperStructure[2],
				]);
		}
	}
	if (includePolychords && chord.length >= 6) {
		// we require the 5 for polychords for now, to avoid a trillion polychords being shown
		for (let i = 2; i < chord.length; ++i) {
			const [lowerChord, lowerOctaves] = [chord.slice(0, i), octaves.slice(0, i)];
			const [upperChord, upperOctaves] = [chord.slice(i), octaves.slice(i)];

			const lowerCandidates = getChordCandidates(lowerChord, lowerOctaves, false, false, true);
			const upperCandidates = getChordCandidates(upperChord, upperOctaves, false, false, true);
			if (!lowerCandidates.length || !upperCandidates.length) continue;
			lowerCandidates.sort((a, b) => b[2] - a[2]);
			upperCandidates.sort((a, b) => b[2] - a[2]);

			// we break after a single iteration and just choose the best polychord for each possibility to avoid spam
			for (const [lowName, lowOcdn, lowScore] of lowerCandidates) {
				for (const [highName, highOcdn, highScore] of upperCandidates) {
					const name = `${highName}\u2060|\u2060${lowName}`;
					const ocdn = [...lowOcdn, ...highOcdn];
					const score = lowScore + highScore - 1;
					candidates.push([name, ocdn, score]);
					break;
				}
				break;
			}
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
	secondary.textContent = candidates.slice(1).join(" | ");
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

let sustain = false;

let notes = new Set();
let currentNotes = new Set();

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
	if (currentNotes.has(noteName)) return;
	currentNotes.add(noteName);
	notes.add(noteName);
	synth.triggerAttack(noteName, undefined, velocity / 127);
	updateCandidatesFromNotes();
}

function stop(noteName) {
	if (!currentNotes.has(noteName)) return;
	currentNotes.delete(noteName);
	if (!sustain) {
		notes.delete(noteName);
		synth.triggerRelease(noteName);
	}
	updateCandidatesFromNotes();
}

function setSustain(value) {
	if (value) {
		sustain = true;
		return;
	}

	sustain = false;
	for (const note of notes) {
		if (!currentNotes.has(note)) {
			notes.delete(note);
			synth.triggerRelease(note);
		}
	}
	updateCandidatesFromNotes();
}
