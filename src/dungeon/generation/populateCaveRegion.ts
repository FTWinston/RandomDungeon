import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { SRandom } from '../../lib/SRandom';
import { Region } from '../model/Region';
import { Tile } from '../model/Tile';

export async function populateCaveRegion(
    dungeon: Dungeon,
    region: Region,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    const random = new SRandom(region.seed);
    
    const regionTiles = dungeon.tiles.filter(t => t.region === region);
    const nonEdgeTiles = regionTiles.filter(t => t.adjacentTiles.length === 8 && !t.adjacentTiles.some(a => a.region !== region));
    
    const mutableTiles = nonEdgeTiles.filter(t => !t.isFloor);

    // make half the non-edge cells "alive"
    for (const tile of nonEdgeTiles) {
        if (random.next() < 0.5) {
            tile.isFloor = true;
        }
    }

    for (let i = 0; i < 8; i++) {
        runCellularAutomataStep(mutableTiles);
        
        if (subStepComplete) {
            await subStepComplete(DelaySize.Small);
        }
    }

    removeUnconnectedFloorTiles(dungeon, region, nonEdgeTiles);
}

function runCellularAutomataStep(cells: Tile[]) {
    const results = new Map<Tile, boolean>();

    for (const cell of cells) {
        // alive becomes dead if < 4 alive around it
        // dead becomes alive if > 4 alive around it

        const wasAlive = cell.isFloor;
        const numAdjacentLiving = cell.adjacentTiles.filter(t => t.isFloor).length;

        const shouldLive = wasAlive
            ? numAdjacentLiving >= 4
            : numAdjacentLiving > 4

        results.set(cell, shouldLive);
    }

    for (const [cell, result] of results) {
        cell.isFloor = result;
    }
}

function removeUnconnectedFloorTiles(dungeon: Dungeon, region: Region, regionTiles: Tile[]) {    
    const rootTile = dungeon.tilesByCoordinates[Math.floor(region.x)][Math.floor(region.y)];
    
    const connectedTiles = new Set([rootTile]);
    let tilesToTest = [...rootTile.adjacentTiles];

    while (true) {
        const tile = tilesToTest.pop();

        if (tile === undefined) {
            break;
        }

        if (!tile.isFloor || tile.region !== region || connectedTiles.has(tile)) {
            continue;
        }

        connectedTiles.add(tile);

        tilesToTest = [
            ...tilesToTest,
            ...tile.adjacentTiles,
        ];
    }

    for (const tile of regionTiles) {
        if (tile.isFloor && !connectedTiles.has(tile)) {
            tile.isFloor = false;
        }
    }
}