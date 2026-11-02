import { createCanvas } from "../lib/canvas.js";
import { arrow } from "../lib/canvasShapes.js";
import Vector2 from "../lib/vector2.js";

const DISCRETE_FORCE = 0;
const CONTINUOUS_FORCE = 1;

const SUPPORTED_BEAM = 0;
const EMBEDDED_BEAM = 1;

const beamLength = 500;
const beamHeight = 50;
const supportSize = 50;
const forceHeight = 50;
const forceMargin = 5;
const forceToTextMargin = 10;
const textFontSize = 16;
const textFont = `${textFontSize}px mono`;
const forceUnit = "N";
const lengthUnit = "m";
const marginXLeft = 80;
const marginXRight = 80;
const marginEqLeft = 80;
const marginYTop = 60;
const marginYBottom = 80;
const titleMargin = 60;
const titleFontSize = 32;
const titleFont = `${titleFontSize}px mono`;
const thickness = 5;
const groundHeight = 20; // cannot be greater than supportSize * 2
const lengthCaptionHeight = 20;
const lengthCaptionMarginTop = 20;
const lengthCaptionMarginBottom = 20;
const lengthCaptionMargin = lengthCaptionMarginBottom + lengthCaptionMarginTop;
const sectionMargin = 100;
const graphArrowCutIn = 20;
const graphYUnitMargin = 5;
const graphXUnitMargin = 5;
const equationInterline = textFontSize;

function drawStrokeText(ctx, text, x, y, replaceFont = true) {
	if (replaceFont) ctx.font = textFont;
	const oldStrokeStyle = ctx.strokeStyle;
	ctx.strokeStyle = "white";
	ctx.strokeText(text, x, y);
	ctx.strokeStyle = oldStrokeStyle;
	ctx.fillText(text, x, y);
}

function forceArrow(ctx, from, to, magnitude = null) {
	ctx.lineCap = "round";
	const headSize = arrow(ctx, from, to);
	ctx.lineCap = "butt";
	if (magnitude === null) return;
	ctx.textAlign = "left";
	ctx.textBaseline = "middle";
	const text = `${Math.abs(magnitude)} ${forceUnit}`;
	const x = from.x + forceToTextMargin;
	const y = (from.y + to.y + headSize * Math.sign(magnitude)) / 2;
	drawStrokeText(ctx, text, x, y);
}

class Force {
	type;
	/** @type {number} */
	beginning;
	/** @type {number} */
	end;
	/** @type {number} */
	magnitude;

	constructor(type, beginning, end, magnitude) {
		this.type = type;
		this.beginning = beginning;
		this.end = end;
		this.magnitude = magnitude;
	}

	static discrete(point, magnitude) {
		return new Force(DISCRETE_FORCE, point, point, magnitude);
	}

	static continuous(beginning, end, magnitude) {
		return new Force(CONTINUOUS_FORCE, beginning, end, magnitude);
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw(ctx, leftMargin, topMargin, totalLength) {
		const unit = beamLength / totalLength;
		if (this.type === DISCRETE_FORCE) {
			const position = this.beginning * unit;
			let beginning, end;
			if (this.magnitude < 0) {
				beginning = new Vector2(position + leftMargin, topMargin);
				end = beginning.add(new Vector2(0, forceHeight - thickness / 2 - forceMargin));
			} else {
				beginning = new Vector2(position + leftMargin, topMargin + beamHeight + forceHeight * 2);
				end = beginning.sub(new Vector2(0, forceHeight - thickness / 2 - forceMargin));
			}
			forceArrow(ctx, beginning, end, this.magnitude);
		} else {
			const arrows = (this.end - this.beginning) * 2 + 1;
			for (let i = 0; i < arrows; ++i) {
				const position = (this.beginning + i / 2) * unit;
				let beginning, end;
				if (this.magnitude < 0) {
					beginning = new Vector2(position + leftMargin, topMargin + forceHeight / 2);
					end = beginning.add(new Vector2(0, forceHeight / 2 - thickness / 2 - forceMargin));
				}
				forceArrow(ctx, beginning, end);
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				drawStrokeText(ctx, `${Math.abs(this.magnitude)} ${forceUnit}/${lengthUnit}`, (this.end - this.beginning) / 2 * unit + leftMargin, topMargin);
			}
		}
	}
}

class Beam {
	type;
	/** @type {string} */
	title;
	/** @type {number} */
	length;
	/** @type {Force[]} */
	forces;

	constructor(type, title, length, forces) {
		this.type = type;
		this.title = title;
		this.length = length;
		this.forces = forces;
	}

	static supported(title, length, ...forces) {
		return new Beam(SUPPORTED_BEAM, title, length, forces);
	}

	static embedded(title, length, ...forces) {
		return new Beam(EMBEDDED_BEAM, title, length, forces);
	}

	portions() {
		const portions = [];
		for (let i = 0; i < this.forces.length; ++i) {
			if (this.forces[i].type === DISCRETE_FORCE) {
				portions.push(this.forces[i].beginning);
			} else {
				portions.push(this.forces[i].beginning);
				portions.push(this.forces[i].end);
			}
		}
		portions.push(0);
		portions.push(this.length);
		return [...new Set(portions)].sort((a, b) => a - b);
	}

	maxPortionFor(x) {
		const portions = this.portions();
		let lastGoodIndex = 0;
		for (let i = 0; i < portions.length; ++i) {
			if (portions[i] > x) break;
			lastGoodIndex = i;
		}
		return portions[lastGoodIndex];
	}

	calculateReactions() {
		// if the beam is embedded, there are no reactions, so setting them to 0 is the best way to calculate this beam
		if (this.type === EMBEDDED_BEAM) return [0, 0];
		// sum of applied forces = c
		// sum of Fy = 0 => Ra + Rb + c = 0 => Ra + Rb = -c => Ra = -Rb - c
		const c = this.forces.map(x => (x.type === DISCRETE_FORCE) ? (x.magnitude) : (x.magnitude * (x.end - x.beginning))).reduce((a, b) => a + b);
		// sum of Mx = 0 => Ra * 0 + forces * beginning + Rb * length = 0 => Rb = 1/length * (-1) * (forces*beginning)
		const m = this.forces.map(x => (x.type === DISCRETE_FORCE) ? (x.magnitude * x.beginning) : (x.magnitude * Math.pow(x.end - x.beginning, 2) / 2)).reduce((a, b) => a + b);
		const rB = -m / this.length;
		const rA = -rB - c;
		return [rA, rB];
	}

	calculateStress(x) {
		const maxPortion = this.maxPortionFor(x);
		const forcesAtPlay = this.forces.filter(x => x.beginning <= maxPortion);
		const rA = this.calculateReactions()[0];
		// rA - F1 - F2 - ... - Fn - Fx = 0 => Fx = rA - F1 - F2 - ... - Fn
		let stress = rA;
		for (let i = 0; i < forcesAtPlay.length; ++i) {
			const force = forcesAtPlay[i];
			if (force.type === DISCRETE_FORCE) {
				stress += force.magnitude;
			} else {
				if (force.end <= maxPortion) {
					stress += force.magnitude * (force.end - force.beginning);
				} else {
					stress += force.magnitude * (x - force.beginning);
				}
			}
		}
		return stress;
	}

	stressEquations() {
		const portions = this.portions();
		const equations = [];
		for (let i = 1; i < portions.length; ++i) {
			const fromPortion = portions[i - 1];
			const forcesAtPlay = this.forces.filter(x => x.beginning <= fromPortion);
			const toPortion = portions[i];
			let independentTerms = this.calculateReactions()[0];
			let xTerms = 0;
			for (const force of forcesAtPlay) {
				if (force.type === DISCRETE_FORCE) {
					independentTerms += force.magnitude;
				} else {
					if (force.end <= fromPortion) {
						independentTerms += force.magnitude * (force.end - force.beginning);
					} else {
						xTerms += force.magnitude;
						independentTerms -= force.magnitude * force.beginning;
					}
				}
			}
			const originalEquation = `${fromPortion} <= x <= ${toPortion} -> Fx = `;
			let equation = originalEquation;
			if (xTerms !== 0) {
				equation += `${xTerms}x`;
				if (independentTerms !== 0) equation += independentTerms < 0 ? " - " : " + ";
			}
			if (independentTerms !== 0 || equation === originalEquation) {
				if (xTerms !== 0) equation += `${Math.abs(independentTerms)}`;
				else equation += `${independentTerms}`;
			}
			equations.push(equation);
		}
		return equations;
	}

	calculateMoment(x) {
		const maxPortion = this.maxPortionFor(x);
		const forcesAtPlay = this.forces.filter(x => x.beginning <= maxPortion);
		const rA = this.calculateReactions()[0];
		// rA * x - F1 * x1 - F2 * x2 - ... - Fn * xn - Mx = 0 => Mx = rA * x - F1 * x1 - F2 * x2 - ... - Fn * xn
		let stress = rA * x;
		for (let i = 0; i < forcesAtPlay.length; ++i) {
			const force = forcesAtPlay[i];
			if (force.type === DISCRETE_FORCE) {
				stress += force.magnitude * (x - force.beginning);
			} else {
				if (force.end <= maxPortion) {
					// why does this even work ??
					stress += force.magnitude * (force.end - force.beginning) * (x - force.end + 1);
				} else {
					stress += force.magnitude * Math.pow(x - force.beginning, 2) / 2;
				}
			}
		}
		return stress;
		// // approximation method
		// let total = 0;
		// for (let i = 0; i <= x; i += 0.01) total += this.calculateStress(i) * 0.01;
		// return total;
	}

	momentEquations() {
		const portions = this.portions();
		const equations = [];
		for (let i = 1; i < portions.length; ++i) {
			const fromPortion = portions[i - 1];
			const forcesAtPlay = this.forces.filter(x => x.beginning <= fromPortion);
			const toPortion = portions[i];
			let independentTerms = 0;
			let xTerms = this.calculateReactions()[0];
			let xSquaredTerms = 0;
			for (const force of forcesAtPlay) {
				if (force.type === DISCRETE_FORCE) {
					xTerms += force.magnitude;
					independentTerms -= force.magnitude * force.beginning;
				} else {
					if (force.end <= fromPortion) {
						const k = force.magnitude * (force.end - force.beginning);
						xTerms += k;
						independentTerms += (1 - force.end) * k;
					} else {
						// force.magnitude/2 * (x - beg)²
						// k * (x - beg)² = kx^2 - 2*k*begx + k*beg^2
						const k = force.magnitude / 2;
						xSquaredTerms += k;
						xTerms -= 2 * force.beginning * k;
						independentTerms += k * Math.pow(force.beginning, 2);
					}
				}
			}
			const originalEquation = `${fromPortion} <= x <= ${toPortion} -> Fx = `;
			let equation = originalEquation;
			if (xSquaredTerms !== 0) {
				equation += `${xSquaredTerms}x^2`;
				if (independentTerms !== 0 || xTerms !== 0) equation += " + ";
			}
			if (xTerms !== 0) {
				equation += `${xTerms}x`;
				if (independentTerms !== 0) equation += " + ";
			}
			if (independentTerms !== 0 || equation === originalEquation) equation += `${independentTerms}`;
			equations.push(equation);
		}
		return equations;
	}

	drawGraphs(ctx, marginTop, beamLeft, beamRight) {
		const unit = beamLength / this.length;
		const graphHeight = (ctx.canvas.height - marginTop - sectionMargin * 2 - marginYBottom) / 2;
		const pointsToDraw = [];
		for (let i = 0; i <= this.length; i += 0.01) {
			pointsToDraw.push(i);
		}
		const portions = this.portions();
		for (const portion of portions) {
			if (portion !== 0) pointsToDraw.push(portion - 0.0001);
			if (portion !== this.length) pointsToDraw.push(portion + 0.0001);
		}
		pointsToDraw.sort((a, b) => a - b);

		function drawGraph(fn, topMargin, xUnit, yUnit) {
			const leftMargin = beamLeft;
			const rightMargin = beamRight;
			const points = pointsToDraw.map(x => fn(x));
			const maxPoint = Math.max(...points);
			const minPoint = Math.min(...points);
			const maxInGraph = maxPoint < 0 ? 0 : maxPoint;
			const minInGraph = minPoint > 0 ? 0 : minPoint;
			const totalSize = maxInGraph - minInGraph;
			const screenUnit = graphHeight / totalSize;
			const xInScreen = (totalSize + minInGraph) * screenUnit;

			// draw axes
			const graphBottom = new Vector2(leftMargin, topMargin + graphHeight + graphArrowCutIn);
			const graphTop = graphBottom.sub(new Vector2(0, graphHeight + graphArrowCutIn * 2));
			const graphLeft = new Vector2(leftMargin - graphArrowCutIn, topMargin + xInScreen);
			const graphRight = graphLeft.add(new Vector2(rightMargin - leftMargin + graphArrowCutIn * 2, 0));
			arrow(ctx, graphBottom, graphTop);
			arrow(ctx, graphLeft, graphRight);
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			drawStrokeText(ctx, yUnit, graphTop.x, graphTop.y - graphYUnitMargin);
			ctx.textAlign = "left";
			ctx.textBaseline = "middle";
			drawStrokeText(ctx, xUnit, graphRight.x + graphXUnitMargin, graphRight.y);

			// draw points
			ctx.fillStyle = "#00000044";
			ctx.beginPath();
			ctx.moveTo(leftMargin, topMargin + xInScreen);
			for (let i = 0; i < pointsToDraw.length; ++i) {
				ctx.lineTo(leftMargin + pointsToDraw[i] * unit, topMargin + xInScreen - points[i] * screenUnit);
			}
			ctx.lineTo(rightMargin, topMargin + xInScreen);
			ctx.stroke();
			ctx.fill();
			ctx.closePath();
			// TODO: graduate the graph
		}

		drawGraph(x => this.calculateStress(x), marginTop + sectionMargin                  , `x (${lengthUnit})`, `F (${forceUnit})`             );
		drawGraph(x => this.calculateMoment(x), marginTop + sectionMargin * 2 + graphHeight, `x (${lengthUnit})`, `M (${forceUnit + lengthUnit})`);
	}

	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	draw(ctx) {
		// TODO: reorganize
		ctx.strokeStyle = "black";
		ctx.fillStyle = "black";
		ctx.lineWidth = thickness;

		const beamLeft = marginXLeft + supportSize;
		const beamRight = marginXLeft + supportSize + beamLength;
		const unit = beamLength / this.length;
		const portions = this.portions();

		// draw title
		{
			const centerX = beamLeft + beamLength / 2;
			ctx.font = titleFont;
			ctx.textAlign = "center";
			ctx.textBaseline = "top";
			drawStrokeText(ctx, this.title, centerX, marginYTop, false);
		}

		// draw length caption
		{
			const topMargin = marginYTop + titleMargin + lengthCaptionMarginTop;
			ctx.beginPath();
			ctx.moveTo(beamLeft, topMargin + lengthCaptionHeight / 2);
			ctx.lineTo(beamRight, topMargin + lengthCaptionHeight / 2);
			ctx.moveTo(beamLeft, topMargin);
			ctx.lineTo(beamLeft, topMargin + lengthCaptionHeight);
			ctx.moveTo(beamRight, topMargin);
			ctx.lineTo(beamRight, topMargin + lengthCaptionHeight);
			ctx.stroke();
			ctx.closePath();

			ctx.lineWidth = thickness / 2;
			ctx.beginPath();
			for (let i = 0; i < portions.length; ++i) {
				const portion = portions[i];
				const x = portion * unit;
				ctx.moveTo(beamLeft + x - lengthCaptionHeight / 2, topMargin + lengthCaptionHeight);
				ctx.lineTo(beamLeft + x + lengthCaptionHeight / 2, topMargin);
			}
			ctx.stroke();
			ctx.closePath();
			ctx.lineWidth = thickness;

			for (let i = 0; i < portions.length - 1; ++i) {
				const portionA = portions[i];
				const portionB = portions[i + 1];
				ctx.textAlign = "center";
				ctx.textBaseline = "top";
				const x = ((portionA + portionB) / 2) * unit + beamLeft;
				const y = marginYTop + titleMargin;
				const text = `${portionB - portionA}${lengthUnit}`;
				drawStrokeText(ctx, text, x, y);
			}
		}

		const beamTop = marginYTop + titleMargin + forceHeight + lengthCaptionMargin + lengthCaptionHeight;
		if (this.type === SUPPORTED_BEAM) {
			// draw beam
			ctx.strokeRect(beamLeft, beamTop, beamLength, beamHeight);

			// draw left support
			{
				const k = supportSize / Math.sqrt(3);
				const centerX = beamLeft;
				const topY = beamTop + beamHeight;
				ctx.beginPath();
				ctx.moveTo(centerX,     topY              );
				ctx.lineTo(centerX + k, topY + supportSize);
				ctx.lineTo(centerX - k, topY + supportSize);
				ctx.lineTo(centerX,     topY              );
				ctx.stroke();
				ctx.closePath();
			}

			// draw right support
			{
				const centerX = beamRight;
				const topY = beamTop + beamHeight;
				const radius = supportSize / 2;
				const centerY = topY + radius;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
				ctx.stroke();
				ctx.closePath();
			}

			// draw grounds
			function drawGround(center) {
				ctx.strokeStyle = "black";
				const topY = beamTop + beamHeight + supportSize;
				const leftmost = center - supportSize;
				const rightmost = center + supportSize;
				ctx.beginPath();
				ctx.moveTo(leftmost, topY);
				ctx.lineTo(rightmost, topY);
				ctx.stroke();
				ctx.closePath();

				ctx.fillStyle = "#00000066";
				ctx.fillRect(leftmost, topY, supportSize * 2, groundHeight);

				ctx.strokeStyle = "black";
			}

			drawGround(beamLeft);
			drawGround(beamRight);

			// draw reaction forces
			{
				const left = beamLeft;
				const right = left + beamLength;
				const top = beamTop + beamHeight + supportSize + groundHeight;
				const bottom = top + forceHeight;
				const fromA = new Vector2(left, bottom);
				const toA = new Vector2(left, top + forceMargin);
				const fromB = new Vector2(right, bottom);
				const toB = new Vector2(right, top + forceMargin);
				const reactions = this.calculateReactions();
				forceArrow(ctx, fromA, toA, reactions[0]);
				forceArrow(ctx, fromB, toB, reactions[1]);
			}
		} else {
			// draw beam
			ctx.strokeRect(beamLeft, beamTop, beamLength + supportSize + marginXRight, beamHeight);
		}

		// draw forces
		this.forces.forEach(x => x.draw(ctx, beamLeft, beamTop - forceHeight, this.length));

		// draw graphs
		if (this.type === SUPPORTED_BEAM) {
			const topMarginNextSection = beamTop + beamHeight + supportSize + groundHeight + forceHeight;
			this.drawGraphs(ctx, topMarginNextSection, beamLeft, beamRight);
		} else {
			this.drawGraphs(ctx, beamTop + beamHeight, beamLeft, beamRight);
		}

		ctx.fillStyle = "black";

		// draw dividing line
		ctx.beginPath();
		ctx.moveTo(beamRight + supportSize + marginXRight, 0);
		ctx.lineTo(beamRight + supportSize + marginXRight, ctx.canvas.height);
		ctx.stroke();
		ctx.closePath();

		// draw equations
		const stressEquations = "Ecuaciones de esfuerzo cortante:\n\n" + this.stressEquations().map(x => `    ${x}`).join('\n');
		const momentEquations = "Ecuaciones de momento flector:\n\n" + this.momentEquations().map(x => `    ${x}`).join('\n');
		const equations = `${stressEquations}\n\n\n${momentEquations}`.split('\n');
		ctx.textAlign = "left";
		ctx.textBaseline = "top";
		ctx.font = textFont;
		for (let i = 0; i < equations.length; ++i) {
			const addedMargin = equationInterline * i;
			ctx.fillText(equations[i], beamRight + supportSize + marginXRight + marginEqLeft, marginYTop + addedMargin);
		}
	}

	/**
	 * @param {string} code
	 */
	static fromCode(code) {
		// format: {length}{type}{n of forces}(;{Force})*;{title (base64)}
		// {length}: number
		// {type}: S: supported, W: embedded (wall)
		// {n of forces}: number
		// {Force}: force
		// force format: {magnitude}{type}{beginning}(,{end})
		// {type}: D: discrete, C: continuous
		const parts = code.split(';');
		const title = atob(parts[parts.length - 1]);
		const head = parts[0];
		const type = head.includes('W') ? EMBEDDED_BEAM : SUPPORTED_BEAM;
		const splitHead = head.split(type === EMBEDDED_BEAM ? 'W' : 'S');
		const length = parseFloat(splitHead[0]);
		const nForces = parseInt(splitHead[1]);
		const forces = [];
		for (let i = 0; i < nForces; ++i) {
			const forceDescriptor = parts[i + 1];
			const forceType = forceDescriptor.includes('D') ? DISCRETE_FORCE : CONTINUOUS_FORCE;
			const splitDescriptor = forceDescriptor.split(forceType === DISCRETE_FORCE ? 'D' : 'C');
			const magnitude = parseFloat(splitDescriptor[0]);
			if (forceType === DISCRETE_FORCE) {
				const point = parseFloat(splitDescriptor[1]);
				forces.push(Force.discrete(point, magnitude));
			} else {
				const points = splitDescriptor[1].split(',').map(parseFloat);
				forces.push(Force.continuous(points[0], points[1], magnitude));
			}
		}
		return new Beam(type, title, length, forces);
	}

	toCode() {
		let code = `${this.length}${this.type === EMBEDDED_BEAM ? 'W' : 'S'}${this.forces.length}`;
		for (const force of this.forces) {
			if (force.type === DISCRETE_FORCE) {
				code += `;${force.magnitude}D${force.beginning}`;
			} else {
				code += `;${force.magnitude}C${force.beginning},${force.end}`;
			}
		}
		code += `;${btoa(this.title)}`;
		return code;
	}
}

export function main() {
	const windowWidth = window.innerWidth;
	const windowHeight = window.innerHeight;
	const width = Math.max(windowWidth, marginXLeft + supportSize + beamLength + supportSize + marginXRight + marginEqLeft + textFontSize * 50);
	const height = Math.max(windowHeight, marginYTop + titleMargin + forceHeight + lengthCaptionMargin + lengthCaptionHeight + beamHeight + supportSize + groundHeight + forceHeight + sectionMargin * 2 + 300 + marginYBottom);
	const [canvas, ctx] = createCanvas(width, height);
	

	if (location.search) {
		const query = location.search;
		const code = query.split('=')[1];
		Beam.fromCode(decodeURIComponent(code)).draw(ctx);
		return;
	}

	const example1 = Beam.supported("Ejemplo 1", 6, Force.discrete(3, -5000));
	const example2 = Beam.supported("Ejemplo 2", 6, Force.discrete(4, -9000));
	const example3 = Beam.supported("Ejemplo 3", 8, Force.continuous(0, 8, -200));
	const example4 = Beam.embedded ("Ejemplo 4", 7, Force.discrete(0, -6000));
	const example5 = Beam.embedded ("Ejemplo 5", 5, Force.continuous(0, 5, -8000));
	const collection1exercise1 = Beam.supported("Reto 1: Ejercicio 1", 4.0, Force.discrete(1, -500000));
	const collection1exercise2 = Beam.embedded ("Reto 1: Ejercicio 2", 6.0, Force.discrete(0, -2000), Force.discrete(2, -4000), Force.discrete(4.5, -8000));
	const collection2exercise1 = Beam.supported("Reto 2: Ejercicio 1", 5.5, Force.discrete(1, -1000), Force.discrete(2, -750), Force.discrete(3.5, -1250));
	const collection2exercise2 = Beam.embedded ("Reto 2: Ejercicio 2", 2.0, Force.discrete(0, -225));
	const collection3exercise1 = Beam.fromCode("4S2;1000D1;-5000D3;" + btoa("Reto 3: Ejercicio 1"));
	const collection3exercise2 = Beam.fromCode("5W2;-5000C0,2;-5000D3;" + btoa("Reto 3: Ejercicio 2"));

	const beams = [example1, example2, example3, example4, example5, collection1exercise1, collection1exercise2, collection2exercise1, collection2exercise2, collection3exercise1, collection3exercise2];
	console.log(beams.map(x => x.toCode()).join('\n'));
	for (let i = 0; i < beams.length; ++i) {
		setTimeout(() => {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
			beams[i].draw(ctx);
		}, i * 2000);
	}
}

main();