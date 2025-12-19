export function toRadians(degrees: number) {
	return (degrees * Math.PI) / 180;
}
export function toDegrees(radians: number) {
	return (radians * 180) / Math.PI;
}

export function wrapRange(value: number, max: number) {
	return ((value % max) + max) % max;
};
export function wrapDegrees(degrees: number) {
	return wrapRange(degrees, 360);
}
export function wrapRadians(radians: number) {
	return wrapRange(radians, 2 * Math.PI);
}
