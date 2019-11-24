import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';
import { Tile } from '../model/Tile';
import { Hatching } from '../model/Hatching';

export async function fillBackdrop(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    const wallTiles = dungeon.tiles.filter(t => t.isWall);

    const backdropTiles = new Set<Tile>();
    addAdjacentNonFloorTiles(wallTiles, backdropTiles);
    addAdjacentNonFloorTiles([...backdropTiles], backdropTiles);
    addAdjacentNonFloorTiles([...backdropTiles], backdropTiles);

    dungeon.backdropPoints = [...backdropTiles]
        .filter(tile => (tile.x + tile.y) % 2 !== 0)
        .map(tile => new Hatching(tile.x, tile.y, seed));
}

function addAdjacentNonFloorTiles(wallTiles: Tile[], backdropTiles: Set<Tile>) {
    for (const tile of wallTiles) {
        for (const adjacent of tile.adjacentTiles) {
            if (!adjacent.isFloor) {
                backdropTiles.add(adjacent);
            }
        }
    }
}
