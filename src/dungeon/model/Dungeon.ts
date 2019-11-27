import { Pathway } from './Pathway';
import { Room } from './Room';
import { Tile } from './Tile';
import { IGraph } from '../../lib/model/Graph';
import { Curve } from '../../lib/model/Curve';
import { Hatching } from './Hatching';

export class Dungeon implements IGraph<Room, Pathway> {
    nodes: Room[] = [];
    lines: Pathway[] = [];
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

    public getTileAt(x: number, y: number) {
        const col = this.tilesByCoordinates[Math.floor(x)];

        if (col === undefined) {
            return;
        }

        return col[Math.floor(y)];
    }
}