export function constructArray(length, f) {
	return [...new Array(length)].map(f);
}

/**
 * Transforms a number to a 2-digit hex number
 * @param {number} n The number (must be non-negative and less than 256)
 */
export function numberToHex(n) {
	const number = n.toString(16);
	return number.length === 2 ? number : `0${number}`;
}