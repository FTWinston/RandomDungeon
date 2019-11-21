import { Room } from './Room';
import { Coord2D } from '../../lib/model/Coord';

export class Tile extends Coord2D {
    public room: Room | null = null;

    constructor(public readonly x: number, public readonly y: number, public isFloor: boolean = false, public isWall: boolean = false) {
        super(x, y);
    }
}