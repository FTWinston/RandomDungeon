import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';
import { getClosest } from '../../lib/graph/getClosest';

export async function associateTilesWithNodes(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    let iCol = 0;
    for (const tile of dungeon.tiles) {
        tile.room = getClosest(tile, dungeon.nodes);

        if (subStepComplete && ++iCol >= dungeon.height) {
            iCol = 0;
            await subStepComplete(DelaySize.Minimal);
        }
    }
}