export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
export const toDegrees = (radians: number) => (radians * 180) / Math.PI;

export const wrapRange = (value: number, max: number) => {
	return ((value % max) + max) % max;
};
export const wrapDegrees = (degrees: number) => wrapRange(degrees, 360);
export const wrapRadians = (radians: number) => wrapRange(radians, 2 * Math.PI);
