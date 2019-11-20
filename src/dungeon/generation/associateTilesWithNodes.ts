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
    for (const col of dungeon.grid) {
        for (const tile of col) {
            tile.room = getClosest(tile, dungeon.nodes);
        }

        if (subStepComplete) {
            await subStepComplete(DelaySize.Minimal);
        }
    }
}