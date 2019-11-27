import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';
import { getClosest } from '../../lib/graph/getClosest';
import { Region } from '../model/Region';
import { Coord } from '../../lib/model/Coord';

export async function associateTilesWithNodes(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    let iCol = 0;

    const distance = (room: Region, point: Coord<Region>) => point.distanceSqTo(room) / room.regionInfluence;

    for (const tile of dungeon.tiles) {
        tile.region = getClosest(tile, dungeon.nodes, distance);

        if (subStepComplete && ++iCol >= dungeon.height) {
            iCol = 0;
            await subStepComplete(DelaySize.Minimal);
        }
    }
}