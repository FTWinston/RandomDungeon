import { Dungeon } from '../model/Dungeon';
import { SRandom } from '../../lib/SRandom';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';
import { Pathway } from '../model/Pathway';

export async function filterLinks(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    let selectingFrom: Pathway[];
    let selectFraction: number;
        
    if (settings.connectivity < 50) {
        dungeon.lines = dungeon.minimumSpanningLines.slice();

        selectingFrom = dungeon.relativeNeighbourhoodLines.filter(l => dungeon.lines.indexOf(l) === -1);

        selectFraction = settings.connectivity / 50;
    } else {
        dungeon.lines = dungeon.relativeNeighbourhoodLines.slice();

        selectingFrom = dungeon.gabrielLines.filter(l => dungeon.lines.indexOf(l) === -1);

        selectFraction = (settings.connectivity - 50) / 50;
    }
    
    let random = new SRandom(seed);
    let numToSelect = Math.round(selectingFrom.length * selectFraction);

    for (let i = numToSelect; i > 0; i--) {
        let selectedLink = selectingFrom.splice(random.nextIntInRange(0, selectingFrom.length), 1)[0];
        dungeon.lines.push(selectedLink);
    }
}