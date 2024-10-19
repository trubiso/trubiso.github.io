import { arrow } from './canvasShapes.js';
import { random } from './random.js';

export default class Vector2 {
	// Constructors
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	static get zero() {
		return new Vector2(0, 0);
	}

	static get inf() {
		return new Vector2(Infinity, Infinity);
	}

	static diag(k) {
		return new Vector2(k, k);
	}

	static random(minX, maxX, minY = minX, maxY = maxX) {
		return new Vector2(random(minX, maxX), random(minY, maxY));
	}

	// Addition
	add(other) {
		return new Vector2(this.x + other.x, this.y + other.y);
	}

	addAssign(other) {
		this.x += other.x;
		this.y += other.y;
	}

	sub(other) {
		return new Vector2(this.x - other.x, this.y - other.y);
	}

	subAssign(other) {
		this.x -= other.x;
		this.y -= other.y;
	}

	// Scaling
	mul(k) {
		return new Vector2(this.x * k, this.y * k);
	}

	mulAssign(k) {
		this.x *= k;
		this.y *= k;
	}

	div(k) {
		return new Vector2(this.x / k, this.y / k);
	}
	
	divAssign(k) {
		this.x /= k;
		this.y /= k;
	}

	neg() {
		return new Vector2(-this.x, -this.y);
	}

	// Magnitude
	get length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	normalized() {
		return this.div(this.length);
	}

	withMagnitude(newMagnitude) {
		return this.normalized().mul(newMagnitude);
	}

	// Dot
	dot(other) {
		return this.x * other.x + this.y * other.y;
	}

	// Comparison
	min(other) {
		return new Vector2(Math.min(this.x, other.x), Math.min(this.y, other.y));
	}

	max(other) {
		return new Vector2(Math.max(this.x, other.x), Math.max(this.y, other.y));
	}

	clamp(min, max) {
		return this.min(Vector2.diag(max)).max(Vector2.diag(min));
	}

	// Utility
	perpendicular() {
		return new Vector2(-this.y, this.x);
	}

	flipY() {
		return new Vector2(this.x, -this.y);
	}

	transform(f) {
		return f(this);
	}

	draw(ctx, from, zoom, coordsTransform, lengthTransform, style = "black") {
		let start = from.transform(coordsTransform);
		let difference = this.normalized().mul(lengthTransform(this.length));
		let end = from.add(difference).transform(coordsTransform);
		arrow(ctx, start, end, zoom, style);
	}

	drawFromEdge(ctx, from, radius, zoom, coordsTransform, lengthTransform, style = "black") {
		this.draw(ctx, from.add(this.normalized().mul(radius)), zoom, coordsTransform, lengthTransform, style);
	}
}