const { Factory, EasyScore, System } = Vex.Flow;

function clearNotes() {
	document.getElementById("sheet-music").innerHTML = "";
}

function displayNotes(octavedChordDegreeNotes) {
	clearNotes();

	const vf = new Factory({
		renderer: { elementId: 'sheet-music', width: 150, height: 250 },
	});

	const score = vf.EasyScore();
	const system = vf.System();

	const bass = octavedChordDegreeNotes.filter(x => parseInt(x.slice(x.length - 1)) <= 3);
	const treble = octavedChordDegreeNotes.filter(x => parseInt(x.slice(x.length - 1)) >= 4);

	system
		.addStave({
			voices: treble.length ? [
				score.voice(score.notes(
					treble.length > 1
						? "(" + treble.join(" ") + ")/w"
						: treble[0] + "/w",
					{clef: 'treble'}
				)),
			] : [],
		})
		.addClef('treble');
	
	system
		.addStave({
			voices: bass.length ? [
				score.voice(score.notes(
					bass.length > 1
						? "(" + bass.join(" ") + ")/w"
						: bass[0] + "/w",
					{clef: 'bass'}
				)),
			] : [],
		})
		.addClef('bass');
	
	system.addConnector();

	vf.draw();
}