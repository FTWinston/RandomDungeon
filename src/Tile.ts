import { Room } from './Room';
import { Coord2D } from './generic/Coord';

export class Tile extends Coord2D {
    public room: Room | null = null;
    public isFloor = false;
    public isWall = false;

    constructor(x: number, y: number) {
        super(x, y);
    }

    drawFill(ctx: CanvasRenderingContext2D, scale: number) {
        if (this.isWall && !this.isFloor) {
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
        } else if (this.isFloor) {
            ctx.strokeStyle = 'rgba(200,200,200,0.5)';
            ctx.strokeRect(this.x * scale, this.y * scale, scale, scale);
        } else {
            ctx.fillStyle = '#666';
            ctx.fillRect(this.x * scale, this.y * scale, scale, scale);
        }
    }
}