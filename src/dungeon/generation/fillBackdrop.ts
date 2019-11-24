import { Dungeon } from '../model/Dungeon';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';
import { Coord2D } from '../../lib/model/Coord';
import { Tile } from '../model/Tile';

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
        .map(tile => 
            // new Coord2D(tile.x + 0.5, tile.y + 0.5) // no randomness
            // new Coord2D(tile.x - 0.25 + Math.random() * 0.5, tile.y - 0.25 + Math.random() * 0.5) // too-small randomness
            new Coord2D(tile.x - 0.35 + Math.random() * 0.65, tile.y - 0.35 + Math.random() * 0.65) // just-right randomness
            // new Coord2D(tile.x - 0.5 + Math.random(), tile.y - 0.5 + Math.random()) // too-big randomness
        );
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
