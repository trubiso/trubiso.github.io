import { createCanvas, windowSize } from "../lib/canvas.js";
import Vector2 from "../lib/vector2.js";

function createTextArea() {
	const [width, height] = windowSize();
	const textarea = document.createElement("textarea");
	textarea.style.position = "absolute";
	textarea.style.right = 0;
	textarea.style.top = 0;
	textarea.style.margin = 0;
	textarea.style.padding = 0;
	textarea.style.width = `${width/4}px`;
	textarea.style.height = `${height}px`;
	textarea.style.borderTop = "none";
	textarea.style.borderBottom = "none";
	textarea.style.resize = "none";
	textarea.style.fontFamily = "mono";
	textarea.style.fontSize = "10pt";
	textarea.style.wordBreak = "break-all";
	textarea.value = `plot("red", x => x);\nplot("blue", x => pow(x, 3));\nplot("magenta", x => cbrt(x));\nconst radius = sqrt(2);\nplotParametric("green", 0, 2 * PI, 0.001, t => [radius * cos(t), radius * sin(t)]);`;
	document.body.appendChild(textarea);
	return textarea;
}

export function main() {
	let [width, height] = windowSize();
	const [canvas, ctx] = createCanvas(width * 3 / 4, height);
	const textarea = createTextArea();

	let canvasSize = new Vector2(canvas.width, canvas.height);
	let centerInScreen = canvasSize.div(2);
	let pixelsPerUnit = canvas.width / 10;

	let centerDisplacement = Vector2.zero;
	let zoom = 1;
	const zoomDelta = 1.1;
	const movePositionDelta = 0.01;
	const zoomPositionDelta = 0.001;

	function worldToScreen(coordinates = Vector2.zero) {
		return coordinates.add(centerDisplacement).flipY().mul(pixelsPerUnit * zoom).add(centerInScreen);
	}
	
	function screenToWorld(coordinates = Vector2.zero) {
		return coordinates.sub(centerInScreen).div(pixelsPerUnit * zoom).flipY().sub(centerDisplacement);
	}

	function zoomFactor(zoom) {
		return pixelsPerUnit * zoom;
	}
	
	function grid(ctx, canvasSize, zoom) {
		ctx.lineWidth = 2;
		const base = 10;
		const correctionFactor = Math.pow(base, -Math.round(Math.log(zoom) / Math.log(base)));
		ctx.strokeStyle = "#00000055";

		const lineSize = zoomFactor(zoom * correctionFactor);
		const minCoords = Vector2.zero;
		const displacement = worldToScreen().mod(lineSize);
		const maxCoords = canvasSize;

		ctx.beginPath();
		for (let x = minCoords.x + displacement.x; x <= maxCoords.x; x += lineSize) {
			ctx.moveTo(x, 0);
			ctx.lineTo(x, canvasSize.y);
		}
		for (let y = minCoords.y + displacement.y; y <= maxCoords.y; y += lineSize) {
			ctx.moveTo(0, y);
			ctx.lineTo(canvasSize.x, y);
		}
		ctx.stroke();
		ctx.closePath();
		
		ctx.strokeStyle = "#000000bb";
		ctx.beginPath();
		ctx.moveTo(0, worldToScreen().y);
		ctx.lineTo(canvasSize.x, worldToScreen().y);
		ctx.moveTo(worldToScreen().x, 0);
		ctx.lineTo(worldToScreen().x, canvasSize.y);
		ctx.stroke();
		ctx.closePath();
	}

	function plot(color, f) {
		const minX = screenToWorld(Vector2.zero).x;
		const maxX = screenToWorld(canvasSize).x;
		const dt = (maxX - minX) * pixelsPerUnit / canvas.width / 100;
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		const initial = worldToScreen(new Vector2(minX, f(minX)));
		ctx.moveTo(initial.x, initial.y);
		// TODO: always start from the center for consistency
		for (let x = minX + dt; x < maxX + dt; x += dt) {
			const y = f(x);
			const screenPos = worldToScreen(new Vector2(x, y));
			ctx.lineTo(screenPos.x, screenPos.y);
		}
		ctx.stroke();
		ctx.closePath();
	}

	function plotInverse(color, f) {
		const minY = screenToWorld(canvasSize).y;
		const maxY = screenToWorld(Vector2.zero).y;
		const dt = (maxY - minY) * pixelsPerUnit / canvas.height / 100;
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();
		const initial = worldToScreen(new Vector2(f(minY), minY));
		ctx.moveTo(initial.x, initial.y);
		// TODO: always start from the center for consistency
		for (let y = minY + dt; y < maxY + dt; y += dt) {
			const x = f(y);
			const screenPos = worldToScreen(new Vector2(x, y));
			ctx.lineTo(screenPos.x, screenPos.y);
		}
		ctx.stroke();
		ctx.closePath();
	}

	function plotParametric(color, t0, tf, dt, f) {
		const vectorizedF = t => {
			const output = f(t);
			return new Vector2(output[0], output[1]);
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 2;
		ctx.beginPath();

		const initial = worldToScreen(vectorizedF(t0));
		ctx.moveTo(initial.x, initial.y);
		for (let t = t0 + dt; t < tf + dt; t += dt) {
			const r = vectorizedF(t);
			const screenPos = worldToScreen(r);
			ctx.lineTo(screenPos.x, screenPos.y);
		}
		ctx.stroke();
		ctx.closePath();
	}

	function D(f) {
		return (x, ...args) => {
			const dt = 0.001;
			const df = f(x + dt, ...args) - f(x, ...args);
			return df / dt;
		}
	}

	// TODO: estimate integral

	let fn = () => {
		eval(textarea.value);
	}

	function redrawCanvas() {
		ctx.clearRect(0, 0, canvasSize.x, canvasSize.y);
		grid(ctx, canvasSize, zoom);
		fn();
	}

	window.onresize = () => {
		const [newWidth, newHeight] = windowSize();
		canvas.width = newWidth * 3 / 4;
		canvas.height = newHeight;
		textarea.style.width = `${newWidth/4}px`;
		textarea.style.height = `${newHeight}px`;

		canvasSize = new Vector2(canvas.width, canvas.height);
		centerInScreen = canvasSize.div(2);
		pixelsPerUnit = canvas.width / 10;
		[width, height] = [newWidth, newHeight];
		redrawCanvas();
	}

	canvas.onwheel = (e) => {
		e.preventDefault();
		const currentPosition = new Vector2(
			parseInt(e.clientX - canvas.offsetLeft),
			parseInt(e.clientY - canvas.offsetTop),
		);
		zoom *= Math.pow(zoomDelta, -Math.sign(e.deltaY));
		const positionDelta = currentPosition.sub(centerInScreen).flipY().div(zoom);
		positionDelta.mulAssign(zoomPositionDelta * Math.sign(e.deltaY));
		centerDisplacement.addAssign(positionDelta);
		redrawCanvas();
	}

	let isMouseClicked = false;
	let mousePosition = Vector2.zero;
	canvas.onmousedown = (e) => {
		mousePosition = new Vector2(
			parseInt(e.clientX - canvas.offsetLeft),
			parseInt(e.clientY - canvas.offsetTop),
		);
		isMouseClicked = true;
		canvas.style.cursor = "grab";
	}
	canvas.onmouseup = (e) => {
		mousePosition = new Vector2(
			parseInt(e.clientX - canvas.offsetLeft),
			parseInt(e.clientY - canvas.offsetTop),
		);
		isMouseClicked = false;
		canvas.style.cursor = "default";
	}
	canvas.onmousemove = (e) => {
		if (!isMouseClicked) return;
		const currentPosition = new Vector2(
			parseInt(e.clientX - canvas.offsetLeft),
			parseInt(e.clientY - canvas.offsetTop),
		);
		const positionDelta = currentPosition.sub(mousePosition).flipY().div(zoom);
		positionDelta.mulAssign(movePositionDelta);
		centerDisplacement.addAssign(positionDelta);
		mousePosition = currentPosition;
		redrawCanvas();
	}

	textarea.addEventListener('input', (e) => {
		e.preventDefault();
		try {
			eval(textarea.value);
			redrawCanvas();
		} catch (e) {

		}
	});

	for (const prop of Object.getOwnPropertyNames(Math)) window[prop] = Math[prop];

	redrawCanvas();
}

main();