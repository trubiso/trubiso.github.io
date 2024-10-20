import { randomColor } from "../lib/random.js";
import Vector2 from "../lib/vector2.js";

/** The gravitational constant G */
export const G = 0.1; // in real life, 6.67 * Math.pow(10, -11), here, 0.1
/** The minimum distance at which gravitational forces stop being computed to avoid running into the asymptote at r = 0 */
const MIN_DISTANCE = 0.1;

export class PhysicsObject {
	mass;
	radius;
	position;
	velocity;
	acceleration;
	elasticity;
	style;

	/**
	 * @param {number} mass The object's mass
	 * @param {number} radius The radius of the circle representing the object's shape
	 * @param {Vector2} position The object's initial position
	 * @param {Vector2} velocity The object's initial velocity
	 * @param {string} style The object's color
	 * @param {number} elasticity The object's elasticity constant, used in collisions
	 */
	constructor(mass = 1, radius = 1, position = Vector2.zero, velocity = Vector2.zero, style = randomColor(), elasticity = 1) {
		this.mass = mass;
		this.radius = radius;
		this.position = position;
		this.velocity = velocity;
		this.style = style;
		this.acceleration = Vector2.zero;
		this.elasticity = elasticity;
	}

	get inverseMass() {
		return 1 / this.mass;
	}

	get area() {
		return Math.PI * Math.pow(this.radius, 2);
	}

	get density() {
		return this.area / this.mass;
	}

	get momentum() {
		return this.velocity.mul(this.mass);
	}

	get kinematicEnergy() {
		return Math.pow(this.velocity.length, 2) * this.mass / 2;
	}

	/**
	 * Calculates the gravitational field caused by the object.
	 * @param {Vector2} point The point at which to calculate the field
	 * @returns The gravitational field caused by the object at the specified point
	 */
	gravitationalField(point) {
		const dx = this.position.sub(point);
		const r = dx.length;
		const direction = dx.normalized();
		const magnitude = G * this.mass / Math.max(Math.pow(r, 2), MIN_DISTANCE);
		return direction.mul(magnitude);
	}

	/**
	 * Calculates the potential energy caused by the forces caused by the object.
	 * @param {Vector2} point The point at which to calculate the potential energy
	 * @returns The potential energy caused by the object at the specified point
	 */
	gravitationalPotentialEnergy(point) {
		const dx = this.position.sub(point);
		const r = dx.length;
		return -G * this.mass / Math.max(r, MIN_DISTANCE);
	}

	/**
	 * Applies Euler's ODE solver to the current acceleration, velocity and position.
	 * @param {number} dt An ideally infinitesimally small fraction of time
	 */
	tick(dt) {
		this.velocity = this.velocity.add(this.acceleration.mul(dt));
		this.position = this.position.add(this.velocity.mul(dt));
	}

	/**
	 * Calculates the distance, not between the centers of two objects, but between their visual shapes.
	 * @param {PhysicsObject} other The object to calculate the distance to
	 * @returns The minimum distance between the visual shapes of both objects, can be negative
	 */
	distanceTo(other) {
		const distanceBetweenCenters = this.position.sub(other.position).length;
		const distanceBetweenObjects = distanceBetweenCenters - this.radius - other.radius;
		return distanceBetweenObjects;
	}

	/**
	 * Calculates a unit vector pointing from the current object to the provided one.
	 * @param {PhysicsObject} other The object to calculate the direction to
	 * @returns The unit vector pointing from this object to the other
	 */
	directionTowards(other) {
		return other.position.sub(this.position).normalized();
	}
}