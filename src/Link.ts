import { Coord2D } from './generic/Coord';
import { Line } from './generic/Line';
import { Node } from './Node';
import { allEqual } from './generic/Calc';

export class Link extends Line<Node> {
    constructor(from: Node, to: Node, length?: number) {
		super(from, to);

        this.restLength = length === undefined ? Math.random() * 10 + 5 : length;
        this.springConstant = 0.1;
        
        from.links.push(this);
        to.links.push(this);
    }

    restLength: number;
    springConstant: number;

	getDistanceFromRest() {
		return this.from.distanceTo(this.to) - this.restLength;
    }
    
	intersectsLine(pos1: Coord2D, pos2: Coord2D) {
		let r = this.to.subtract(this.from);
		let s = pos2.subtract(pos1);

		let uNumerator = pos1.subtract(this.from).crossProduct(r);
		let denominator = r.crossProduct(s);

		if (uNumerator == 0 && denominator == 0) {
			// They are colinear
			
			// Do they touch? (Are any of the points equal?)
			if (this.from.equals(pos1) || this.from.equals(pos2) || this.to.equals(pos1) || this.to.equals(pos2)) {
				return true;
			}
			
			// Do they overlap? (Are all the point differences in either direction the same sign)
			return !allEqual([
					(pos1.x - this.from.x < 0),
					(pos1.x - this.to.x < 0),
					(pos2.x - this.from.x < 0),
					(pos2.x - this.to.x < 0)]
				) || !allEqual([
					(pos1.y - this.from.y < 0),
					(pos1.y - this.to.y < 0),
					(pos2.y - this.from.y < 0),
					(pos2.y - this.to.y < 0)
				]);
		}

		if (denominator == 0) {
			// lines are parallel
			return false;
		}

		let u = uNumerator / denominator;
		let t = pos1.subtract(this.from).crossProduct(s) / denominator;
		return t > 0 && t < 1 && u > 0 && u < 1;
    }
    
	draw(ctx: CanvasRenderingContext2D, scale: number) {
		ctx.beginPath();
		ctx.moveTo(this.from.x * scale, this.from.y * scale);
		ctx.lineTo(this.to.x * scale, this.to.y * scale);
		ctx.stroke();
	}
}