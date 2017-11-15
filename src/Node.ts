import { Coord } from './Coord';
import { Dungeon } from './Dungeon';
import { Link } from './Link';

export const enum NodeType {
    Room = 1,
    Junction = 2,
}

export class Node {
    constructor(readonly parent: Dungeon, public pos: Coord, public weight: number = 1) {

    }

    nodeType: NodeType = NodeType.Room;
    radius: number = 1.5;
    links: Link[] = [];
    force?: Coord;

	calculateForce() {
		let force = new Coord(0, 0);
		let forceCutoffDist = 8, nodeRepulsionScale = 1, linkRepulsionForce = 0.3;
		
		// push away from any other node that is too close
		for (let i=0; i<this.parent.nodes.length; i++) {
			let otherNode = this.parent.nodes[i];
			if (otherNode == this || otherNode.nodeType == NodeType.Junction)
				continue;
			
			let dist = this.pos.distanceTo(otherNode.pos);
			if (dist > forceCutoffDist)
				continue;

			let scalarComponent = nodeRepulsionScale * otherNode.weight / dist / dist;
			let componentForce = this.pos.directionTo(otherNode.pos).scale(-scalarComponent);
			
			force.applyOffset(componentForce);
		}
		
		// push away from links you don't connect with ... tangentially
		for (let i=0; i<this.parent.links.length; i++) {
			let link = this.parent.links[i];
			
			if (link.fromNode == this || link.toNode == this)
				continue;
			
			let dist = this.distanceFromLink(link);
			if (dist > forceCutoffDist || dist == 0)
				continue;
			
			let scalarComponent = linkRepulsionForce / dist / dist;
			
			let linkDir = link.toNode.pos.subtract(link.fromNode.pos).toUnitLength();
			let perpDir = new Coord(linkDir.y, -linkDir.x);
			
			// is this pointed towards the link? If so, need to reverse it.
			let compareTo = this.pos.subtract(link.fromNode.pos).toUnitLength();
			if (compareTo.x * perpDir.x + compareTo.y * perpDir.y < 0) {
				perpDir.x = -perpDir.x;
				perpDir.y = -perpDir.y;
			}
			
			let componentForce = perpDir.scale(scalarComponent);
			force.applyOffset(componentForce);
		}
		
		// prevent any enormous accelerations from being created
		let accel = new Coord(force.x / this.weight, force.y / this.weight);
		
		let accelLimit = 5;
		if (accel.length() > accelLimit) {
			accel = accel.toUnitLength();
			accel.x *= accelLimit;
			accel.y *= accelLimit;
		}
		
		return accel;
    }
    
	distanceFromLink(link: Link) {
		let A = this.pos.x - link.fromNode.pos.x;
		let B = this.pos.y - link.fromNode.pos.y;
		let C = link.toNode.pos.x - link.fromNode.pos.x;
		let D = link.toNode.pos.y - link.fromNode.pos.y;

		let dot = A * C + B * D;
		let len_sq = C * C + D * D;
		let param = -1;
		if (len_sq != 0) //in case of 0 length line
			param = dot / len_sq;

		let xx, yy;

		if (param < 0) {
			xx = link.fromNode.pos.x;
			yy = link.fromNode.pos.y;
		}
		else if (param > 1) {
			xx = link.toNode.pos.x;
			yy = link.toNode.pos.y;
		}
		else {
			xx = link.fromNode.pos.x + param * C;
			yy = link.fromNode.pos.y + param * D;
		}

		let dx = this.pos.x - xx;
		let dy = this.pos.y - yy;
		return Math.sqrt(dx * dx + dy * dy);
    }
    
	draw(ctx: CanvasRenderingContext2D, scale: number) {
		if (this.nodeType == NodeType.Junction)
			return;
		
		ctx.fillStyle = '#c00';
		
		ctx.beginPath();
		ctx.arc(this.pos.x * scale, this.pos.y * scale, scale * this.radius, 0, 2*Math.PI);
		ctx.fill();
	}
};