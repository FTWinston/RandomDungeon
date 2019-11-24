import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { Graph } from '../../lib/model/Graph';
import { Curve } from '../../lib/model/Curve';
import { Hatching } from './Hatching';

export class Dungeon extends Graph<Room, Pathway> {
    backdropPoints: Hatching[] = [];
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