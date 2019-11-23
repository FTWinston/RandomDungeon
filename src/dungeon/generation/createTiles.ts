import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';
import { Tile } from '../model/Tile';

export async function createTiles(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    dungeon.tiles = [];
    dungeon.tilesByCoordinates = [];

    for (let x = 0; x < dungeon.width; x++) {
        let col = new Array<Tile>(dungeon.height);
        dungeon.tilesByCoordinates[x] = col;

        for (let y = 0; y < dungeon.height; y++) {
            const tile = new Tile(x, y);
            col[y] = tile;
            dungeon.tiles.push(tile);
        }
    }

    const maxX = dungeon.width - 1;
    const maxY = dungeon.height - 1;

    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            const tile = dungeon.tilesByCoordinates[x][y];

            if (x > 0) {
                if (y > 0) {
                    tile.adjacentTiles.push(dungeon.tilesByCoordinates[x-1][y-1]);
                }

                tile.adjacentTiles.push(dungeon.tilesByCoordinates[x-1][y]);

                if (y < maxY) {
                    tile.adjacentTiles.push(dungeon.tilesByCoordinates[x-1][y+1]);
                }
            }

            if (y > 0) {
                tile.adjacentTiles.push(dungeon.tilesByCoordinates[x][y-1]);
            }

            if (y < maxY) {
                tile.adjacentTiles.push(dungeon.tilesByCoordinates[x][y+1]);
            }
            
            if (x < maxX) {
                if (y > 0) {
                    tile.adjacentTiles.push(dungeon.tilesByCoordinates[x+1][y-1]);
                }

                tile.adjacentTiles.push(dungeon.tilesByCoordinates[x+1][y]);

                if (y < maxY) {
                    tile.adjacentTiles.push(dungeon.tilesByCoordinates[x+1][y+1]);
                }
            }
        }
    }
}