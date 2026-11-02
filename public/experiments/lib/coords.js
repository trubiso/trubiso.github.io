export const pixelsPerUnit = 64;

export function worldToScreen(screenMiddle, zoom = 1) {
	return coordinates => coordinates.flipY().mul(pixelsPerUnit * zoom).add(screenMiddle);
}

export function screenToWorld(screenMiddle, zoom = 1) {
	return coordinates => coordinates.sub(screenMiddle).div(pixelsPerUnit * zoom).flipY();
}

export function zoomFactor(zoom) {
	return pixelsPerUnit * zoom;
}