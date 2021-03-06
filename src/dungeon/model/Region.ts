import { Coord2D } from '../../lib/model/Coord';
import { Dungeon } from './Dungeon';
import { Pathway } from './Pathway';

export enum RegionType {
    Junction = 0,
    Natural = 1,
    Artificial = 2,

    NUM_VALUES,
    FIRST_VALUE = 0,
}

export class Region extends Coord2D {
    radius: number = 0.75;
    links: Pathway[] = [];

    constructor(
        readonly parent: Dungeon,
        x: number,
        y: number,
        public seed: number,
        public regionType: RegionType,
        public readonly color: string,
        public regionInfluence = 1
    ) {
        super(x, y);
    }
}