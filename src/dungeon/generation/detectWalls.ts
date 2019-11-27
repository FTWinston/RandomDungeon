import { Dungeon } from '../model/Dungeon';
import { RegionType } from '../model/Region';
import { DelaySize } from '../generateDungeon';
import { Tile } from '../model/Tile';
import { IGenerationSettings } from '../IGenerationSettings';

export async function detectWalls(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    let iCol = 0;
    for (const tile of dungeon.tiles) {
        if (tile.isFloor) {
            continue;
        }

        let toTest = getAdjacent(dungeon, tile, true, false);
        for (let test of toTest) {
            if (test.isFloor) {
                tile.isWall = true;
                tile.room = test.room;
                break;
            }
        }

        // artificial rooms should have "corner" wall nodes filled in
        for (let test of tile.adjacentTiles) {
            if (test.isFloor && test.room !== null && test.room.roomType === RegionType.Artificial) {
                tile.isWall = true;
                tile.room = test.room;
                break;
            }
        }

        if (subStepComplete && ++iCol >= dungeon.height) {
            iCol = 0;
            await subStepComplete(DelaySize.Tiny);
        }
    }
}

export function getAdjacent(dungeon: Dungeon, from: Tile, orthogonal: boolean = true, diagonal: boolean = false) {
    let results = [];

    if (orthogonal) {
        if (from.x > 0) {
            results.push(dungeon.tilesByCoordinates[from.x - 1][from.y]);
        }
        if (from.x < dungeon.width - 1) {
            results.push(dungeon.tilesByCoordinates[from.x + 1][from.y]);
        }
        if (from.y > 0) {
            results.push(dungeon.tilesByCoordinates[from.x][from.y - 1]);
        }
        if (from.y < dungeon.height - 1) {
            results.push(dungeon.tilesByCoordinates[from.x][from.y + 1]);
        }
    }
    
    if (diagonal) {
        if (from.x > 0) {
            if (from.y > 0) {
                results.push(dungeon.tilesByCoordinates[from.x - 1][from.y - 1]);
            }
            if (from.y < dungeon.height - 1) {
                results.push(dungeon.tilesByCoordinates[from.x - 1][from.y + 1]);
            }
        }
        if (from.x < dungeon.width - 1) {
            if (from.y > 0) {
                results.push(dungeon.tilesByCoordinates[from.x + 1][from.y - 1]);
            }
            if (from.y < dungeon.height - 1) {
                results.push(dungeon.tilesByCoordinates[from.x + 1][from.y + 1]);
            }
        }
    }

    return results;
}
