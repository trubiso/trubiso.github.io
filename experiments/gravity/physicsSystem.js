import { screenToWorld, worldToScreen, zoomFactor } from "../lib/coords.js";
import { random, randomColor, randomPosition } from "../lib/random.js";
import { constructArray, numberToHex } from "../lib/util.js";
import Vector2 from "../lib/vector2.js";
import { PhysicsObject } from "./physicsObject.js";

export class PhysicsSystem {
	/** @type {PhysicsObject[]} */
	objects;

	// Constructors
	constructor(...objects) {
		this.objects = objects;
	}

	static random(screenSize, zoom, n = 4) {
		return new PhysicsSystem(...constructArray(n, () => new PhysicsObject(random(1, 250), random(0.2, 2), randomPosition(screenSize, zoom), Vector2.random(-3, 3), randomColor())));
	}

	// Properties
	gravitationalField(point, objectIndex = -1) {
		return this.objects
			.filter((_, i) => i !== objectIndex)
			.map(x => x.gravitationalField(point))
			.reduce((a, b) => a.add(b));
	}

	gravitationalPotentialEnergy(point, objectIndex) {
		return this.objects
			.filter((_, i) => i !== objectIndex)
			.map(x => x.gravitationalPotentialEnergy(point))
			.reduce((a, b) => a + b) * this.objects[objectIndex].mass;
	}

	// Solving the ODE
	tick(dt) {
		const gravitationalAccelerations = this.objects.map((x, i) => this.gravitationalField(x.position, i));

		for (let i = 0; i < this.objects.length; ++i) {
			this.objects[i].acceleration = gravitationalAccelerations[i];
			this.objects[i].tick(dt);
		}

		this.resolveCollisions();
	}

	resolveCollisions() {
		for (let i = 0; i < this.objects.length; ++i) {
			for (let j = i + 1; j < this.objects.length; ++j) {
				const distance = this.objects[i].distanceTo(this.objects[j]);
				if (distance >= 0) continue;

				// The objects have definitely collided by this point
				const direction = this.objects[i].directionTowards(this.objects[j]);
				const sumOfInverseMasses = this.objects[i].inverseMass + this.objects[j].inverseMass;

				// Resolve position
				const depthResolution = direction.mul(distance / (sumOfInverseMasses));
				this.objects[i].position.addAssign(depthResolution.mul( this.objects[i].inverseMass));
				this.objects[j].position.addAssign(depthResolution.mul(-this.objects[j].inverseMass));

				// Resolve velocity
				const relativeVelocity = this.objects[i].velocity.sub(this.objects[j].velocity);
				const relativeVelocityInDirectionOfCollision = relativeVelocity.dot(direction);
				const separationVelocity = -relativeVelocityInDirectionOfCollision * (1 + Math.min(this.objects[i].elasticity, this.objects[j].elasticity));

				const impulse = direction.mul(separationVelocity / (sumOfInverseMasses));

				this.objects[i].velocity.addAssign(impulse.mul( this.objects[i].inverseMass));
				this.objects[j].velocity.addAssign(impulse.mul(-this.objects[j].inverseMass));
			}
		}
	}

	// Drawing
	// TODO: consolidate contexts, screenMiddle, zoom, and such data in a DrawingContext class
	drawField(ctx, screenMiddle, zoom) {
		const precisionLevel = 16;
		const squareSize = zoomFactor(zoom);
		for (let i = 0; i < width / precisionLevel; ++i) {
			for (let j = 0; j < height / precisionLevel; ++j) {
				const screenPosition = new Vector2(i * precisionLevel, j * precisionLevel);
				const worldPosition = screenToWorld(screenMiddle, zoom)(screenPosition);
				const fieldValue = this.gravitationalField(worldPosition).length;

				const normalized = Math.min(fieldValue / G * 100, 1000) / 1000;
				const green = numberToHex(Math.round(Math.sqrt(normalized) * 255))

				const normalized2 = Math.min(fieldValue / G * 10, 1000) / 1000;
				const blue = numberToHex(Math.round(normalized2 * 255));
				ctx.fillStyle = `#ff${green}${blue}`;
				ctx.fillRect(screenPosition.x, screenPosition.y, squareSize);
			}
		}
	}

	drawBalls(ctx, screenMiddle, zoom) {
		function sigmoid(x) {
			return Math.min(x, 100) / 100;
		}

		// draw arrows
		for (let i = 0; i < this.objects.length; ++i) {
			// TODO: clean up these arrow functions
			this.objects[i].velocity.drawFromEdge(ctx, this.objects[i].position, this.objects[i].radius, zoom, worldToScreen(screenMiddle, zoom), x => sigmoid(x * 2));
			this.gravitationalField(this.objects[i].position, i).drawFromEdge(ctx, this.objects[i].position, this.objects[i].radius, zoom, worldToScreen(screenMiddle, zoom), x => sigmoid(x / 10) * 2, "orange");
		}

		// draw balls
		for (let i = 0; i < this.objects.length; ++i) {
			let p = this.objects[i].position.transform(worldToScreen(screenMiddle, zoom));
			ctx.beginPath();
			ctx.fillStyle = this.objects[i].style;
			ctx.arc(p.x, p.y, this.objects[i].radius * zoomFactor(zoom), 0, 2*Math.PI);
			ctx.fill();
			ctx.closePath();

			ctx.fillStyle = "white";
			ctx.font = `${this.objects[i].radius * zoomFactor(zoom)/3}px mono`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(`${this.objects[i].mass.toFixed(1)} kg`, p.x, p.y);
		}
	}

	drawTrails(ctx, previousPositions, screenMiddle, zoom) {
		for (let i = 0; i < this.objects.length; ++i) {
			let p = this.objects[i].position.transform(worldToScreen(screenMiddle, zoom));
			let o = previousPositions[i].transform(worldToScreen(screenMiddle, zoom));
			ctx.strokeStyle = this.objects[i].style;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(o.x, o.y);
			ctx.lineTo(p.x, p.y);
			ctx.stroke();
			ctx.closePath();
		}
	}

	// Combinated
	tickAndDraw(ctx, trailCtx, dt, screenMiddle, zoom) {
		const previousPositions = this.objects.map(x => x.position);
		this.tick(dt);
		this.drawBalls(ctx, screenMiddle, zoom);
		this.drawTrails(trailCtx, previousPositions, screenMiddle, zoom);
	}
}