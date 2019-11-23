import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { Graph } from '../../lib/model/Graph';
import { Curve } from '../../lib/model/Curve';
import { Coord2D } from '../../lib/model/Coord';

export class Dungeon extends Graph<Room, Pathway> {
    backdropPoints: Coord2D[] = [];
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