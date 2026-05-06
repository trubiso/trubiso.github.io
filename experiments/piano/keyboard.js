function noteNameFromKeyCode(code, octave) {
	switch (code) {
		case 'KeyQ':         return`C${octave+1}`;
		case 'Digit2':       return`C#${octave+1}`;
		case 'KeyW':         return`D${octave+1}`;
		case 'Digit3':       return`D#${octave+1}`;
		case 'KeyE':         return`E${octave+1}`;
		case 'KeyR':         return`F${octave+1}`;
		case 'Digit5':       return`F#${octave+1}`;
		case 'KeyT':         return`G${octave+1}`;
		case 'Digit6':       return`G#${octave+1}`;
		case 'KeyY':         return`A${octave+1}`;
		case 'Digit7':       return`A#${octave+1}`;
		case 'KeyU':         return`B${octave+1}`;
		case 'KeyI':         return`C${octave+2}`;
		case 'Digit9':       return`C#${octave+2}`;
		case 'KeyO':         return`D${octave+2}`;
		case 'Digit0':       return`D#${octave+2}`;
		case 'KeyP':         return`E${octave+2}`;
		case 'BracketLeft':  return`F${octave+2}`;
		case 'Equal':        return`F#${octave+2}`;
		case 'BracketRight': return`G${octave+2}`;
		case 'KeyZ':         return`C${octave}`;
		case 'KeyS':         return`C#${octave}`;
		case 'KeyX':         return`D${octave}`;
		case 'KeyD':         return`D#${octave}`;
		case 'KeyC':         return`E${octave}`;
		case 'KeyV':         return`F${octave}`;
		case 'KeyG':         return`F#${octave}`;
		case 'KeyB':         return`G${octave}`;
		case 'KeyH':         return`G#${octave}`;
		case 'KeyN':         return`A${octave}`;
		case 'KeyJ':         return`A#${octave}`;
		case 'KeyM':         return`B${octave}`;
		case 'Comma':        return`C${octave+1}`;
		case 'KeyL':         return`C#${octave+1}`;
		case 'Period':       return`D${octave+1}`;
		case 'Semicolon':    return`D#${octave+1}`;
		case 'Slash':        return`E${octave+1}`;
		default: return null;
	}
}

let keyboardOctave = 4;

function raiseOctave() {
	if (keyboardOctave < 6) keyboardOctave++;
}

function lowerOctave() {
	if (keyboardOctave > 0) keyboardOctave--;
}

window.onkeydown = (e) => {
	if (e.target.tagName === "INPUT") return;

	if (e.code === "Quote") return lowerOctave();
	if (e.code === "Backslash") return raiseOctave();

	const noteName = noteNameFromKeyCode(e.code, keyboardOctave);
	if (!noteName) return;
	play(noteName);
}

window.onkeyup = (e) => {
	if (e.target.tagName === "INPUT") return;

	const noteName = noteNameFromKeyCode(e.code, keyboardOctave);
	if (!noteName) return;
	stop(noteName);
}
