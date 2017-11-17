import { Link } from './Link';
import { Node } from './Node';

export class Tile {
    public node: Node | null = null;
    public links: Link[] = [];

    constructor(readonly x: number, readonly y: number) {
        this.links = [];
    }

    drawFill(ctx: CanvasRenderingContext2D, scale: number) {
        if (this.node != null) {
            ctx.fillStyle = '#c00';
        } else if (this.links.length > 0) {
            ctx.fillStyle = '#fff';
        } else {
            return;
        }
        
        ctx.fillRect(this.x * scale, this.y * scale, scale, scale);        
    }
    
    drawEdges(ctx: CanvasRenderingContext2D, scale: number) {
        // to-do: don't fill in tiles, just draw the edges.
    }
}