import { Coord } from './Coord';

export function lerp(val1: number, val2: number, fraction: number) {
  return (1-fraction)*val1 + fraction*val2;
}

export function crossProduct2D(pos1: Coord, pos2: Coord) {
	return pos1.x * pos2.y - pos1.y * pos2.x;
}

export function allEqual(args: any[]) {
	var firstValue = args[0];
	for (var i = 1; i < args.length; i += 1) {
		if (args[i] != firstValue) {
			return false;
		}
	}
	return true;
}
