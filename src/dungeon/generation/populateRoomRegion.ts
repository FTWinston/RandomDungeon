import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { SRandom } from '../../lib/SRandom';
import { Region } from '../model/Region';

export async function populateRoomRegion(
    dungeon: Dungeon,
    region: Region,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    const random = new SRandom(region.seed);
    const nodeX = Math.floor(region.x);
    const nodeY = Math.floor(region.y);

    const { minX, minY, maxX, maxY } = determineBounds(dungeon, region, nodeX, nodeY, random);

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            let tile = dungeon.tilesByCoordinates[x][y];
            if (tile.region !== region) {
                continue;
            }

            tile.isFloor = true;
            tile.region = region;
        }
    }
}

function determineBounds(dungeon: Dungeon, region: Region, nodeX: number, nodeY: number, random: SRandom) {
    // determine the biggest possible size this room could be
    let minX = nodeX, maxX = nodeX, minY = nodeY, maxY = nodeY;

    if (random.next() < 0.5) {
        [minX, minY] = growUpLeft(dungeon, region, random, minX, minY, maxX, maxY);
        [maxX, maxY] = growDownRight(dungeon, region, random, minX, minY, maxX, maxY);
    }
    else {
        [maxX, maxY] = growDownRight(dungeon, region, random, minX, minY, maxX, maxY);
        [minX, minY] = growUpLeft(dungeon, region, random, minX, minY, maxX, maxY);
    }

    // now possibly shrink from the maximum possible size
    if (random.next() < 0.75) {
        minX = random.nextIntInRange(minX, nodeX);
        maxX = random.nextIntInRange(nodeX + 1, maxX + 1);
        minY = random.nextIntInRange(minY, nodeY);
        maxY = random.nextIntInRange(nodeY + 1, maxY + 1);    
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
    };
}

function growUpLeft(dungeon: Dungeon, region: Region, random: SRandom, minX: number, minY: number, maxX: number, maxY: number) {
    let canLeft = true, canUp = true;

    while (canLeft || canUp) {
        if (canUp && random.next() < 0.5) {
            canUp = isRowInRegion(dungeon, region, minY - 1, minX, maxX)
                && --minY > 2;
        }
        else if (canLeft) {
            canLeft = isColInRegion(dungeon, region, minX - 1, minY, maxY)
                && --minX > 2;
        }
    }

    return [minX, minY];
}


function growDownRight(dungeon: Dungeon, region: Region, random: SRandom, minX: number, minY: number, maxX: number, maxY: number) {
    let canRight = true, canDown = true;

    while (canRight || canDown) {
        if (canDown && random.next() < 0.5) {
            canDown = isRowInRegion(dungeon, region, maxY + 1, minX, maxX)
                && ++maxY < dungeon.height - 3;
        }
        else if (canRight) {
            canRight = isColInRegion(dungeon, region, maxX + 1, minY, maxY)
                && ++maxX < dungeon.width - 3;
        }
    }

    return [maxX, maxY];
}

function isColInRegion(dungeon: Dungeon, region: Region, x: number, y1: number, y2: number) {
    const col = dungeon.tilesByCoordinates[x];

    for (let y = y1; y <= y2; y++) {
        if (col[y].region !== region) {
            return false;
        }
    }

    return true;
}

function isRowInRegion(dungeon: Dungeon, region: Region, y: number, x1: number, x2: number) {
    for (let x = x1; x <= x2; x++) {
        if (dungeon.tilesByCoordinates[x][y].region !== region) {
            return false;
        }
    }

    return true;
}