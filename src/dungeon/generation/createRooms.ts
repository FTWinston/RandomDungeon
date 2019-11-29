import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
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
    for (const region of dungeon.nodes) {
        switch (region.regionType) {
            case RegionType.Natural:
                await populateCaveRegion(dungeon, region, subStepComplete);
                break;
            case RegionType.Artificial:
                await populateRoomRegion(dungeon, region, subStepComplete);
                break;
            default:
                continue;
        }
        
        if (subStepComplete) {
            await subStepComplete(DelaySize.Medium);
        }
    }
}