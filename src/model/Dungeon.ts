import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { Graph } from './generic/Graph';
import { Curve } from './generic/Curve';
import { Polygon } from './generic/Polygon';
import { Coord2D } from './generic/Coord';

export class Dungeon extends Graph<Room, Pathway> {
    seed: number;
    delauneyLines: Pathway[];
    gabrielLines: Pathway[];
    relativeNeighbourhoodLines: Pathway[];
    minimumSpanningLines: Pathway[];

    grid: Tile[][];
    walls: Curve[];
    backdropCells: Polygon<Coord2D>[];
    
    constructor(public nodeCount: number,
                public width: number,
                public height: number,
                public connectivity: number
        ) {
        super();
        this.seed = Math.random();
    }
}