import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { Graph } from '../../lib/model/Graph';
import { Curve } from '../../lib/model/Curve';

export class Dungeon extends Graph<Room, Pathway> {
    delauneyLines: Pathway[] = [];
    gabrielLines: Pathway[] = [];
    relativeNeighbourhoodLines: Pathway[] = [];
    minimumSpanningLines: Pathway[] = [];

    width: number;
    height: number;

    grid: Tile[][] = [];
    walls: Curve[] = [];
}