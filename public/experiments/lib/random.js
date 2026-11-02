import { zoomFactor } from "./coords.js";
import { numberToHex } from "./util.js";
import Vector2 from "./vector2.js";

export function random(min, max) {
	return Math.random() * (max - min) + min;
}

export function randFn(min, max) {
	return () => random(min, max);
}

export function randomInteger(min, max) {
	return Math.round(random(min, max));
}

export function randomColor() {
	const r = numberToHex(randomInteger(0, 255));
	const g = numberToHex(randomInteger(0, 255));
	const b = numberToHex(randomInteger(0, 255));
	return `#${r}${g}${b}`;
}

export function randomPosition(screenSize, zoom) {
	const x = Math.floor(screenSize.x / zoomFactor(zoom)) / 2;
	const y = Math.floor(screenSize.y / zoomFactor(zoom)) / 2;
	return Vector2.random(-x, x, -y, y);
}