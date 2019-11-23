import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { Graph } from '../../lib/model/Graph';
import { Curve } from '../../lib/model/Curve';
import { Cell } from '../../lib/graph/voronoi';
import { Coord2D } from '../../lib/model/Coord';

export class Dungeon extends Graph<Room, Pathway> {
    backdropCells: Cell<Coord2D>[] = []
    delauneyLines: Pathway[] = [];
    gabrielLines: Pathway[] = [];
    relativeNeighbourhoodLines: Pathway[] = [];
    minimumSpanningLines: Pathway[] = [];

    width: number = 0;
    height: number = 0;

    tiles: Tile[] = [];
    tilesByCoordinates: Tile[][] = [];
    walls: Curve[] = [];
}