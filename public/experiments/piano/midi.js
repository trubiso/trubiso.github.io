let id = "";

navigator.requestMIDIAccess().then(midi => {
	const deviceSelect = document.getElementById("device");
	midi.inputs.forEach(input => {
		deviceSelect.appendChild(new Option(input.name, input.id));

		input.onmidimessage = (msg) => {
			if (id !== input.id) return;

			const [status, note, velocity] = msg.data;
			const command = status & 0xf0;

			if (command === 0xE0) {
				const lsb = msg.data[1];
				const msb = msg.data[2];
				const value = (msb << 7) | lsb;
				const normalized = 2 * (value - 8192) / 8192;
				console.log(normalized);
				// synth.pitch = normalized * 200;
				return;
			}

			const noteName = Tone.Frequency(note, "midi").toNote();
			if (command === 0x90 && velocity > 0) {
				play(noteName, velocity);
			} else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
				stop(noteName);
			}
		};
	});

	deviceSelect.onchange = (e) => {
		id = e.target.value;
		Tone.start();
	}
	id = deviceSelect.value;
});
