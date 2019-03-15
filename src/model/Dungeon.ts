import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { Graph } from './generic/Graph';
import { Curve } from './generic/Curve';

export class Dungeon extends Graph<Room, Pathway> {
    seed: number;
    delauneyLines: Pathway[];
    gabrielLines: Pathway[];
    relativeNeighbourhoodLines: Pathway[];
    minimumSpanningLines: Pathway[];

    grid: Tile[][];
    walls: Curve[];
    
    constructor(public nodeCount: number,
                public width: number,
                public height: number,
                public connectivity: number
        ) {
        super();
        this.seed = Math.random();
    }
}