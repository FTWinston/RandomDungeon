import { Room } from './Room';
import { Coord2D } from '../../lib/model/Coord';

export class Tile extends Coord2D {
    public room: Room | null = null;
    public isFloor = false;
    public isWall = false;

    constructor(x: number, y: number) {
        super(x, y);
    }
}