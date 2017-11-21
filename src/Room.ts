import { Coord2D } from './generic/Coord';
import { Dungeon } from './Dungeon';
import { Pathway } from './Pathway';

export const enum NodeType {
    Room = 1,
    Junction = 2,
}

export class Room extends Coord2D {
    nodeType: NodeType = NodeType.Room;
    radius: number = 0.75;
    links: Pathway[] = [];
    force?: Coord2D;
    readonly color: string;

    constructor(readonly parent: Dungeon, x: number, y: number, public weight: number = 1) {
        super(x, y);
        let chars = ['a', 'b', 'c', 'd', 'e', 'f'];
        this.color = `#${chars[Math.floor(Math.random() * 6)]}${chars[Math.floor(Math.random() * 6)]}${chars[Math.floor(Math.random() * 6)]}`;
    }
    
    drawNode(ctx: CanvasRenderingContext2D, scale: number) {
        if (this.nodeType === NodeType.Junction) {
            return;
        }
        
        ctx.fillStyle = '#c00';
        
        ctx.beginPath();
        ctx.arc(this.x * scale, this.y * scale, scale * this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}