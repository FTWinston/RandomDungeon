import { Dungeon } from '../model/Dungeon';
import { SRandom } from '../../lib/SRandom';
import { DelaySize } from '../DungeonGenerator';

export async function filterLinks(
    dungeon: Dungeon,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    
    let selectingFrom, selectFraction;
        
    if (dungeon.connectivity < 50) {
        dungeon.lines = dungeon.minimumSpanningLines.slice();
        selectingFrom = [];
        for (let line of dungeon.relativeNeighbourhoodLines) {
            if (dungeon.lines.indexOf(line) === -1) {
                selectingFrom.push(line);
            }
        }
        selectFraction = dungeon.connectivity / 50;
    } else {
        selectingFrom = [];
        for (let line of dungeon.gabrielLines) {
            if (dungeon.relativeNeighbourhoodLines.indexOf(line) === -1) {
                selectingFrom.push(line);
            }
        }
        selectFraction = (dungeon.connectivity - 50) / 50;
        dungeon.lines = dungeon.relativeNeighbourhoodLines.slice();
    }
    
    let random = new SRandom(seed);
    let numToSelect = Math.round(selectingFrom.length * selectFraction);

    for (let i = numToSelect; i > 0; i--) {
        let selectedLink = selectingFrom.splice(random.nextIntInRange(0, selectingFrom.length), 1)[0];
        dungeon.lines.push(selectedLink);
    }
}