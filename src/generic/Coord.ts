export class Coord {
	constructor(public x: number, public y: number) {

	}

	private magnitudeOf(dx: number, dy: number) {
		return Math.sqrt(dx * dx + dy * dy);
	}

	length() {
		return this.magnitudeOf(this.x, this.y);
	}

	equals(other: Coord) {
		return this.x == other.x && this.y == other.y;
	}

	subtract(other: Coord) {
		return new Coord(this.x - other.x, this.y - other.y);
	}

	toUnitLength() {
		let length = this.length();
		return new Coord(this.x / length, this.y / length);
	}

	distanceTo(other: Coord) {
		return this.magnitudeOf(this.x - other.x, this.y - other.y);
	}

	directionTo(other: Coord) {
		let dx = other.x - this.x;
		let dy = other.y - this.y;
		
		let length = this.magnitudeOf(dx, dy);
		return new Coord(dx / length, dy / length);
	}

	halfwayTo(other: Coord) {
		return new Coord((this.x + other.x) / 2, (this.y + other.y) / 2);
	}

	applyOffset(other: Coord) {
		this.x += other.x;
		this.y += other.y;
		return this;
	}

	scale(scale: number) {
		this.x *= scale;
		this.y *= scale;
		return this;
	}
}