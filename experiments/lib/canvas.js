export function createCanvas(width = -1, height = -1, addToDocument = true) {
	const canvas = document.createElement("canvas");
	canvas.width = width === -1 ? window.innerWidth : width;
	canvas.height = height === -1 ? window.innerHeight : height;
	if (addToDocument) {
		canvas.style.position = "absolute";
		canvas.style.left = 0;
		canvas.style.top = 0;
		document.body.appendChild(canvas);
	}
	return [canvas, canvas.getContext("2d")];
}