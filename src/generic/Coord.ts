import { randomInt } from './Calc';

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

	createAdjacent() {
		let pick = randomInt(8);
		let dx: number, dy: number;
		
		switch (pick) {
			case 0:
			case 3:
			case 5:
				dx = -2; break;
			case 1:
			case 6:
				dx = 0; break;
			case 2:
			case 4:
			case 7:
				dx = 2; break;
			default:
				dx = 0; break;
		}
		
		switch (pick) {
			case 0:
			case 1:
			case 2:
				dy = -2; break;
			case 3:
			case 4:
				dy = 0; break;
			case 5:
			case 6:
			case 7:
				dy = 2; break;
			default:
				dy = 0; break;
		}
		
		return new Coord(this.x + dx, this.y + dy);
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