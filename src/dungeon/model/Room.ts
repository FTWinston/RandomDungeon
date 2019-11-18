import { Coord2D } from '../../lib/model/Coord';
import { Dungeon } from './Dungeon';
import { Pathway } from './Pathway';
import { randomColor } from '../../lib/randomColor';

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
        this.color = randomColor();
    }
}