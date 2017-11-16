export abstract class Coord<TCoord extends Coord<TCoord>> {
	abstract length(): number;

	abstract equals(other: Coord<TCoord>): boolean;
	
	abstract subtract(other: Coord<TCoord>): Coord<TCoord>;

	abstract subtract(other: Coord<TCoord>): Coord<TCoord>;

	abstract toUnitLength(): Coord<TCoord>;

	abstract distanceTo(other: Coord<TCoord>): number;
	
	abstract distanceSqTo(other: Coord<TCoord>): number;

	abstract directionTo(other: Coord<TCoord>): Coord<TCoord>;

	abstract halfwayTo(other: Coord<TCoord>): Coord<TCoord>;

	abstract scale(scale: number): Coord<TCoord>;
	
	abstract crossProduct(other: Coord<TCoord>): number;

	abstract circumCircle(b: Coord<TCoord>, c: Coord<TCoord>): [Coord<TCoord>, number];
}

export class Coord2D extends Coord<Coord2D> {
	constructor(public x: number, public y: number) {
		super();
	}

	private magnitude(dx: number, dy: number) {
		return Math.sqrt(this.magnitudeSq(dx, dy));
	}

	private magnitudeSq(dx: number, dy: number) {
		return dx * dx + dy * dy;
	}

	length() {
		return this.magnitude(this.x, this.y);
	}

	equals(other: Coord2D) {
		return this.x === other.x && this.y === other.y;
	}

	add(other: Coord2D) {
		return new Coord2D(this.x + other.x, this.y + other.y);
	}

	subtract(other: Coord2D) {
		return new Coord2D(this.x - other.x, this.y - other.y);
	}

	toUnitLength() {
		let length = this.length();
		return new Coord2D(this.x / length, this.y / length);
	}
	
	distanceTo(other: Coord2D) {
		return this.magnitude(this.x - other.x, this.y - other.y);
	}

	distanceSqTo(other: Coord2D) {
		return this.magnitudeSq(this.x - other.x, this.y - other.y);
	}

	directionTo(other: Coord2D) {
		let dx = other.x - this.x;
		let dy = other.y - this.y;
		
		let length = this.magnitude(dx, dy);
		return new Coord2D(dx / length, dy / length);
	}

	halfwayTo(other: Coord2D) {
		return new Coord2D((this.x + other.x) / 2, (this.y + other.y) / 2);
	}

	scale(scale: number) {
		return new Coord2D(this.x * scale, this.y * scale);
	}

	crossProduct(other: Coord2D) {
		return this.x * other.y - this.y * other.x;
	}

	circumCircle(b: Coord2D, c: Coord2D) {
		let a = this;
		let d = (a.x - c.x) * (b.y - c.y) - (b.x - c.x) * (a.y - c.y);
		
		let x = (((a.x - c.x) * (a.x + c.x) + (a.y - c.y) * (a.y + c.y)) / 2 * (b.y - c.y) 
			 -  ((b.x - c.x) * (b.x + c.x) + (b.y - c.y) * (b.y + c.y)) / 2 * (a.y - c.y))
		/ d;

		let y = (((b.x - c.x) * (b.x + c.x) + (b.y - c.y) * (b.y + c.y)) / 2 * (a.x - c.x)
			-  ((a.x - c.x) * (a.x + c.x) + (a.y - c.y) * (a.y + c.y)) / 2 * (b.x - c.x))
		/ d;

		let center = new Coord2D(x, y);

		let rSquared = (c.x - center.x) * (c.x - center.x) + (c.y - center.y) * (c.y - center.y);

		let retVal: [Coord2D, number] = [
			center,
			rSquared
		];

		return retVal;
	}
}