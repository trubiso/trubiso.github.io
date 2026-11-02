import { worldToScreen, zoomFactor } from "./coords.js";
import Vector2 from "./vector2.js";

export function arrow(ctx, from, to, zoom = 1, style = "black") {
	let thickness = 5 * Math.sqrt(zoom);
	let headSize = 10 * Math.sqrt(zoom);

	// head calculations
	let arrowDir = to.sub(from).normalized();
	let headDir = arrowDir.perpendicular().mul(headSize);
	const newTo = to.sub(arrowDir.mul(headSize));

	let headPoint1 = newTo.add(headDir);
	let headPoint2 = newTo.sub(headDir);
	let headPoint3 = newTo.add(arrowDir.mul(headSize));

	ctx.lineWidth = thickness;
	ctx.fillStyle = style;
	ctx.strokeStyle = style;

	ctx.beginPath();

	// line
	ctx.moveTo(from.x, from.y);
	ctx.lineTo(newTo.x, newTo.y);
	ctx.stroke();

	// head
	ctx.moveTo(headPoint3.x, headPoint3.y);
	ctx.lineTo(headPoint1.x, headPoint1.y);
	ctx.lineTo(headPoint2.x, headPoint2.y);
	ctx.lineTo(headPoint3.x, headPoint3.y);
	ctx.fill();

	ctx.closePath();

	return headSize;
}

export function grid(ctx, screenSize, zoom, thickness = 2, drawExtraLines = true) {
	ctx.lineWidth = thickness;

	const horizontalLines = Math.floor(screenSize.x / zoomFactor(zoom)) / 2;
	const verticalLines = Math.floor(screenSize.y / zoomFactor(zoom)) / 2;
	ctx.strokeStyle = "#00000055";

	const screenMiddle = screenSize.div(2);

	if (drawExtraLines) {
		for (let i = 1; i <= horizontalLines; ++i) {
			let x1 = worldToScreen(screenMiddle, zoom)(new Vector2(+i, 0)).x;
			let x2 = worldToScreen(screenMiddle, zoom)(new Vector2(-i, 0)).x;
			ctx.beginPath();
			ctx.moveTo(x1, 0);
			ctx.lineTo(x1, screenSize.y);
			ctx.moveTo(x2, 0);
			ctx.lineTo(x2, screenSize.y);
			ctx.stroke();
			ctx.closePath();
		}

		for (let i = 1; i <= verticalLines; ++i) {
			let y1 = worldToScreen(screenMiddle, zoom)(new Vector2(0, +i)).y;
			let y2 = worldToScreen(screenMiddle, zoom)(new Vector2(0, -i)).y;
			ctx.beginPath();
			ctx.moveTo(0, y1);
			ctx.lineTo(screenSize.x, y1);
			ctx.moveTo(0, y2);
			ctx.lineTo(screenSize.x, y2);
			ctx.stroke();
			ctx.closePath();
		}
	}

	ctx.strokeStyle = "#000000bb";
	ctx.beginPath();
	ctx.moveTo(0, screenMiddle.y);
	ctx.lineTo(screenSize.x, screenMiddle.y);
	ctx.moveTo(screenMiddle.x, 0);
	ctx.lineTo(screenMiddle.x, screenSize.y);
	ctx.stroke();
	ctx.closePath();
}