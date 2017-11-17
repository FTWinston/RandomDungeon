import { Coord2D } from './generic/Coord';
import { Dungeon } from './Dungeon';
import { Link } from './Link';

export const enum NodeType {
    Room = 1,
    Junction = 2,
}

export class Node extends Coord2D {
    nodeType: NodeType = NodeType.Room;
    radius: number = 0.75;
    links: Link[] = [];
    force?: Coord2D;

    constructor(readonly parent: Dungeon, x: number, y: number, public weight: number = 1) {
        super(x, y);
    }

    calculateForce() {
        let force = new Coord2D(0, 0);
        let forceCutoffDist = 8, nodeRepulsionScale = 1, linkRepulsionForce = 0.3;
        
        // push away from any other node that is too close
        for (let i = 0; i < this.parent.nodes.length; i++) {
            let otherNode = this.parent.nodes[i];
            if (otherNode === this || otherNode.nodeType === NodeType.Junction) {
                continue;
            }
            
            let dist = this.distanceTo(otherNode);
            if (dist > forceCutoffDist) {
                continue;
            }

            let scalarComponent = nodeRepulsionScale * otherNode.weight / dist / dist;
            let componentForce = this.directionTo(otherNode).scale(-scalarComponent);
            force = force.add(componentForce);
        }
        
        // push away from links you don't connect with ... tangentially
        for (let i = 0; i < this.parent.lines.length; i++) {
            let link = this.parent.lines[i];
            
            if (link.from === this || link.to === this) {
                continue;
            }
            
            let dist = this.distanceFromLink(link);
            if (dist > forceCutoffDist || dist === 0) {
                continue;
            }
            
            let scalarComponent = linkRepulsionForce / dist / dist;
            
            let linkDir = link.to.subtract(link.from).toUnitLength();
            let perpDir = new Coord2D(linkDir.y, -linkDir.x);
            
            // is this pointed towards the link? If so, need to reverse it.
            let compareTo = this.subtract(link.from).toUnitLength();
            if (compareTo.x * perpDir.x + compareTo.y * perpDir.y < 0) {
                perpDir.x = -perpDir.x;
                perpDir.y = -perpDir.y;
            }
            
            let componentForce = perpDir.scale(scalarComponent);
            force = force.add(componentForce);
        }
        
        // prevent any enormous accelerations from being created
        let accel = new Coord2D(force.x / this.weight, force.y / this.weight);
        
        let accelLimit = 5;
        if (accel.length() > accelLimit) {
            accel = accel.toUnitLength();
            accel.x *= accelLimit;
            accel.y *= accelLimit;
        }
        
        return accel;
    }
    
    distanceFromLink(link: Link) {
        let A = this.x - link.from.x;
        let B = this.y - link.from.y;
        let C = link.to.x - link.from.x;
        let D = link.to.y - link.from.y;

        let dot = A * C + B * D;
        let lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) { // in case of 0 length line
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = link.from.x;
            yy = link.from.y;
        } else if (param > 1) {
            xx = link.to.x;
            yy = link.to.y;
        } else {
            xx = link.from.x + param * C;
            yy = link.from.y + param * D;
        }

        let dx = this.x - xx;
        let dy = this.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    draw(ctx: CanvasRenderingContext2D, scale: number) {
        if (this.nodeType === NodeType.Junction) {
            return;
        }
        
        ctx.fillStyle = '#c00';
        
        ctx.beginPath();
        ctx.arc(this.x * scale, this.y * scale, scale * this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}