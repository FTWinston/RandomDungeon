import { Dungeon } from '../model/Dungeon';
import { RoomType } from '../model/Room';
import { DelaySize } from '../generateDungeon';
import { Tile } from '../model/Tile';
import { IGenerationSettings } from '../IGenerationSettings';

export async function detectWalls(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    for (const col of dungeon.grid) {
        for (const tile of col) {
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

            if (tile.isFloor) {
                continue;
            }

            // artificial rooms should have "corner" wall nodes filled in
            // TODO: wall curves still "cut the corner" and then a new loop is added to fill the cut corner in.
            // That needs to change if these go in.
            toTest = getAdjacent(dungeon, tile, false, true);
            for (let test of toTest) {
                if (test.isFloor && test.room !== null && test.room.roomType === RoomType.Artificial) {
                    tile.isWall = true;
                    tile.room = test.room;
                    break;
                }
            }
        }

        if (subStepComplete) {
            await subStepComplete(DelaySize.Tiny);
        }
    }
}

export function getAdjacent(dungeon: Dungeon, from: Tile, orthogonal: boolean = true, diagonal: boolean = false) {
    let results = [];

    if (orthogonal) {
        if (from.x > 0) {
            results.push(dungeon.grid[from.x - 1][from.y]);
        }
        if (from.x < dungeon.width - 1) {
            results.push(dungeon.grid[from.x + 1][from.y]);
        }
        if (from.y > 0) {
            results.push(dungeon.grid[from.x][from.y - 1]);
        }
        if (from.y < dungeon.height - 1) {
            results.push(dungeon.grid[from.x][from.y + 1]);
        }
    }
    
    if (diagonal) {
        if (from.x > 0) {
            if (from.y > 0) {
                results.push(dungeon.grid[from.x - 1][from.y - 1]);
            }
            if (from.y < dungeon.height - 1) {
                results.push(dungeon.grid[from.x - 1][from.y + 1]);
            }
        }
        if (from.x < dungeon.width - 1) {
            if (from.y > 0) {
                results.push(dungeon.grid[from.x + 1][from.y - 1]);
            }
            if (from.y < dungeon.height - 1) {
                results.push(dungeon.grid[from.x + 1][from.y + 1]);
            }
        }
    }

    return results;
}
