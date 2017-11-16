export function lerp(val1: number, val2: number, fraction: number) {
  return (1-fraction)*val1 + fraction*val2;
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
