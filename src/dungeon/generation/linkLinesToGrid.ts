import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';

export async function linkLinesToGrid(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    // associate each tile of the grid with all of the links that overlap or touch it
    // this is Xiaolin Wi's algorithm, without the antialiasing.
    for (let link of dungeon.lines) {
        let x0 = Math.floor(link.from.x);
        let x1 = Math.floor(link.to.x);
        let y0 = Math.floor(link.from.y);
        let y1 = Math.floor(link.to.y);

        const col0 = dungeon.tilesByCoordinates[x0];
        if (col0 !== undefined) {
            const cell0 = col0[y0];
            if (cell0 !== undefined) {
                cell0.isFloor = true;
            }
        }
        
        const col1 = dungeon.tilesByCoordinates[x1];
        if (col1 !== undefined) {
            const cell1 = col1[y1];
            if (cell1 !== undefined) {
                cell1.isFloor = true;
            }
        }

        let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
        if (steep) { // swap x & y, ensure not steep
            let tmp = y0;
            y0 = x0;
            x0 = tmp;
            
            tmp = y1;
            y1 = x1;
            x1 = tmp;
        }
        if (x0 > x1) { // swap 0 & 1, ensure moving rightwards
            let tmp = x1;
            x1 = x0;
            x0 = tmp;
            
            tmp = y1;
            y1 = y0;
            y0 = tmp;
        }
        
        let gradient = (y1 - y0) / (x1 - x0);
        let y = y0 + gradient * 0.5; // move to the "middle" of the cell
        
        for (let x = x0; x < x1; x++) {
            let iY = Math.round(y - 0.5); // round to the nearest i+0.5, then truncate to int
            let closestSideStep = iY + 0.5 > y ? -1 : 1;
            let almostInteger = Math.abs(y - iY) < 0.10;
            
            if (steep) {
                dungeon.tilesByCoordinates[iY + closestSideStep][x].isFloor = true;
                dungeon.tilesByCoordinates[iY][x].isFloor = true;
                if (!almostInteger) {
                    dungeon.tilesByCoordinates[iY - closestSideStep][x].isFloor = true;
                }
            } else {
                dungeon.tilesByCoordinates[x][iY + closestSideStep].isFloor = true;
                dungeon.tilesByCoordinates[x][iY].isFloor = true;
                if (!almostInteger) {
                    dungeon.tilesByCoordinates[x][iY - closestSideStep].isFloor = true;
                }
            }
            
            y += gradient;
        }
    }
}