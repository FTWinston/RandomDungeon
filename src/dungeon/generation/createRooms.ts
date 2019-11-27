import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { SRandom } from '../../lib/SRandom';
import { IGenerationSettings } from '../IGenerationSettings';

export async function createRooms(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    await growRooms(dungeon, seed, subStepComplete);
}

async function growRooms(
    dungeon: Dungeon,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>
) {
    let random = new SRandom(seed);
    for (let node of dungeon.nodes) {
        let nodeX = Math.floor(node.x);
        let nodeY = Math.floor(node.y);
        let minX: number, minY: number, maxX: number, maxY: number;
        switch (random.nextIntInRange(0, 6)) {
            case 0:
                // junction
                minX = nodeX - 1;
                maxX = nodeX + 1;
                minY = nodeY - 1;
                maxY = nodeY + 1;
                break;
            case 1:
            case 2: {
                // small room
                let halfWidth = random.nextIntInRange(1, 4);
                let halfHeight = random.nextIntInRange(1, 4);
                minX = nodeX - halfWidth;
                maxX = nodeX + halfWidth;
                minY = nodeY - halfHeight;
                maxY = nodeY + halfHeight;
                break;
            }
            case 3: {
                // large room
                let halfWidth = random.nextIntInRange(3, 8);
                let halfHeight = random.nextIntInRange(3, 8);
                let xOffset = random.nextIntInRange(-3, 4);
                let yOffset = random.nextIntInRange(-3, 4);
                minX = nodeX - halfWidth + xOffset;
                maxX = nodeX + halfWidth + xOffset;
                minY = nodeY - halfHeight + yOffset;
                maxY = nodeY + halfHeight + yOffset;
                break;
            }
            case 4: {
                // long room
                let halfWidth = random.nextIntInRange(7, 12);
                let halfHeight = random.nextIntInRange(2, 5);
                let xOffset = random.nextIntInRange(-6, 7);
                minX = nodeX - halfWidth + xOffset;
                maxX = nodeX + halfWidth + xOffset;
                minY = nodeY - halfHeight;
                maxY = nodeY + halfHeight;
                break;
            }
            case 5: {
                // tall room
                let halfWidth = random.nextIntInRange(2, 5);
                let halfHeight = random.nextIntInRange(7, 12);
                let yOffset = random.nextIntInRange(-6, 7);
                minX = nodeX - halfWidth;
                maxX = nodeX + halfWidth;
                minY = nodeY - halfHeight + yOffset;
                maxY = nodeY + halfHeight + yOffset;
                break;
            }
            default:
                continue;
        }
        let isRound = random.next() < 0.5;
        let filter;
        if (isRound) {
            maxX += 2;
            maxY += 2;
            minX -= 2;
            minY -= 2;
            filter = (x: number, y: number) => {
                let a = maxX - nodeX;
                let b = maxY - nodeY;
                x -= nodeX;
                y -= nodeY;
                return (x * x) / (a * a) + (y * y) / (b * b) <= 1;
            };
        }
        minX = Math.max(3, minX);
        maxX = Math.min(dungeon.width - 4, maxX);
        minY = Math.max(3, minY);
        maxY = Math.min(dungeon.height - 4, maxY);
        for (let x = minX; x <= maxX; x++) {
            for (let y = minY; y <= maxY; y++) {
                let tile = dungeon.tilesByCoordinates[x][y];
                if (filter === undefined || filter(x, y)) {
                    tile.isFloor = true;
                    tile.region = node;
                }
            }
        }

        if (subStepComplete) {
            await subStepComplete(DelaySize.Small);
        }
    }
}