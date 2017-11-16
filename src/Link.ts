import { Coord } from './generic/Coord';
import { Node } from './Node';
import { crossProduct2D, allEqual } from './generic/Calc';

export class Link {
    constructor(public fromNode: Node, public toNode: Node, length?: number) {
        this.restLength = length === undefined ? Math.random() * 10 + 5 : length;
        this.springConstant = 0.1;
        
        fromNode.links.push(this);
        toNode.links.push(this);
    }

    restLength: number;
    springConstant: number;


	getDistanceFromRest() {
		return this.fromNode.pos.distanceTo(this.toNode.pos) - this.restLength;
    }
    
	intersectsLine(pos1: Coord, pos2: Coord) {
		let r = this.toNode.pos.subtract(this.fromNode.pos);
		let s = pos2.subtract(pos1);

		let uNumerator = crossProduct2D(pos1.subtract(this.fromNode.pos), r);
		let denominator = crossProduct2D(r, s);

		if (uNumerator == 0 && denominator == 0) {
			// They are colinear
			
			// Do they touch? (Are any of the points equal?)
			if (this.fromNode.pos.equals(pos1) || this.fromNode.pos.equals(pos2) || this.toNode.pos.equals(pos1) || this.toNode.pos.equals(pos2)) {
				return true;
			}
			
			// Do they overlap? (Are all the point differences in either direction the same sign)
			return !allEqual([
					(pos1.x - this.fromNode.pos.x < 0),
					(pos1.x - this.toNode.pos.x < 0),
					(pos2.x - this.fromNode.pos.x < 0),
					(pos2.x - this.toNode.pos.x < 0)]
				) || !allEqual([
					(pos1.y - this.fromNode.pos.y < 0),
					(pos1.y - this.toNode.pos.y < 0),
					(pos2.y - this.fromNode.pos.y < 0),
					(pos2.y - this.toNode.pos.y < 0)
				]);
		}

		if (denominator == 0) {
			// lines are parallel
			return false;
		}

		let u = uNumerator / denominator;
		let t = crossProduct2D(pos1.subtract(this.fromNode.pos), s) / denominator;
		return t > 0 && t < 1 && u > 0 && u < 1;
    }
    
	draw(ctx: CanvasRenderingContext2D, scale: number) {
		ctx.strokeStyle = '#000';
		
		ctx.beginPath();
		ctx.moveTo(this.fromNode.pos.x * scale, this.fromNode.pos.y * scale);
		ctx.lineTo(this.toNode.pos.x * scale, this.toNode.pos.y * scale);
		ctx.stroke();
	}
}