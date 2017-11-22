import { Coord2D } from './generic/Coord';
import { Dungeon } from './Dungeon';
import { Pathway } from './Pathway';

export const enum RoomType {
    Natural = 0,
    Artificial = 1,
    Hybrid = 2,

    NUM_VALUES,
}

export class Room extends Coord2D {
    radius: number = 0.75;
    links: Pathway[] = [];
    force?: Coord2D;
    readonly color: string;

    constructor(readonly parent: Dungeon, x: number, y: number, public roomType: RoomType) {
        super(x, y);
        let chars = ['a', 'b', 'c', 'd', 'e', 'f'];
        this.color = `#${chars[Math.floor(Math.random() * 6)]}${chars[Math.floor(Math.random() * 6)]}${chars[Math.floor(Math.random() * 6)]}`;
    }
    
    drawNode(ctx: CanvasRenderingContext2D, scale: number) {
        ctx.fillStyle = '#c00';
        
        ctx.beginPath();
        ctx.arc(this.x * scale, this.y * scale, scale * this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }
}