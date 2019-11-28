import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { SRandom } from '../../lib/SRandom';
import { IGenerationSettings } from '../IGenerationSettings';
import { RegionType } from '../model/Region';
import { populateCaveRegion } from './populateCaveRegion';
import { populateRoomRegion } from './populateRoomRegion';

export async function createRooms(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    const random = new SRandom(seed);
    for (const region of dungeon.nodes) {
        switch (region.regionType) {
            case RegionType.Natural:
                await populateCaveRegion(dungeon, region, random.next(), subStepComplete);
                break;
            case RegionType.Artificial:
                await populateRoomRegion(dungeon, region, random.next(), subStepComplete);
                break;
            default:
                continue;
        }
        
        if (subStepComplete) {
            await subStepComplete(DelaySize.Medium);
        }
    }
}