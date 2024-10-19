import { createCanvas } from '../lib/canvas.js';
import { grid } from '../lib/canvasShapes.js';
import Vector2 from '../lib/vector2.js';
import { PhysicsObject } from './physicsObject.js';
import { PhysicsSystem } from './physicsSystem.js';

let zoom = 0.5;
let gridZoom = zoom;

export function main() {
	const [gridCanvas, gridCtx] = createCanvas();
	const [trailCanvas, trailCtx] = createCanvas();
	const [canvas, ctx] = createCanvas();

	const width = canvas.width;
	const height = canvas.height;

	const screenMiddle = new Vector2(width / 2, height / 2);
	const screenSize = new Vector2(width, height);
	
	// const sunMass = 27084469;
	// const earthMass = 81.335;
	// const moonMass = 1;
	// const sunEarthDistance = 11629.32;
	// const earthMoonDistance = 30;
	// const solarSystem = new PhysicsSystem(
	// 	new PhysicsObject(sunMass, 1250, Vector2.zero, Vector2.zero, "orange"),
	// 	new PhysicsObject(earthMass, 10, new Vector2(0, sunEarthDistance), new Vector2(Math.sqrt(G * sunMass / sunEarthDistance), 0), "blue"),
	// 	new PhysicsObject(moonMass, 1, new Vector2(0, sunEarthDistance + earthMoonDistance), new Vector2(500, 0), "red"),
	// )
	// // For this system, the zooms must be changed to the following values, and G must be set to 100
	// zoom = 0.0004;
	// gridZoom = sunEarthDistance / 10000;

	const mutualOrbitSystem = new PhysicsSystem(
		new PhysicsObject(1000, 1, new Vector2(-4, 0), Vector2.diag( 2), "red" ),
		new PhysicsObject(1000, 1, new Vector2( 4, 0), Vector2.diag(-2), "blue"),
	)

	const ellasticCollisionSystem = new PhysicsSystem(
		new PhysicsObject(1, 1, Vector2.zero,       Vector2.zero,       "red"  ),
		new PhysicsObject(1, 1, new Vector2(0, -5), new Vector2(0, 10), "blue" ),
		new PhysicsObject(1, 1, new Vector2(0,  5), Vector2.zero,       "green"),
	);

	const collisionOrbitSystem = new PhysicsSystem(
		new PhysicsObject(100, 1, new Vector2(-12, -4), Vector2.zero,      "red" ),
		new PhysicsObject(100, 1, new Vector2(-10, -8), new Vector2(0, 1), "blue"),
	);

	const system = mutualOrbitSystem;

	let previousTime = performance.now();
	function loop(time) {
		let deltaTime = (time - previousTime) / 1000;

		ctx.clearRect(0, 0, screenSize.x, screenSize.y);
		system.tickAndDraw(ctx, trailCtx, deltaTime, screenMiddle, zoom);
		
		previousTime = time;

		requestAnimationFrame(loop);
	}

	grid(gridCtx, screenSize, gridZoom);
	requestAnimationFrame(loop);
}

main();