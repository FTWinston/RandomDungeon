import { Dungeon } from '../model/Dungeon';
import { SRandom } from '../../lib/SRandom';
import { DelaySize } from '../generateDungeon';
import { Tile } from '../model/Tile';
import { Curve } from '../../lib/model/Curve';
import { getAdjacent } from './detectWalls';
import { IGenerationSettings } from '../IGenerationSettings';

export async function generateWallCurves(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    const random = new SRandom(seed);
    dungeon.walls = [];

    for (let x = 0; x < dungeon.width; x++) {
        for (let y = 0; y < dungeon.height; y++) {
            let tile = dungeon.grid[x][y];
            if (tile.isWall && !tile.isFloor) {
                await generateWallCurve(dungeon, tile, random, subStepComplete);

                if (subStepComplete) {
                    await subStepComplete(DelaySize.Small);
                }
            }
        }
    }
}

async function generateWallCurve(dungeon: Dungeon, firstTile: Tile, random: SRandom, subStepComplete?: (interval: DelaySize) => Promise<void>) {
    const mainCurve = await generateSingleWallCurve(dungeon, firstTile, random, subStepComplete);

    while (true) {
        // See if we could have taken a different path at any point.
        const newStartPoint = backtrackToNewStartPoint(dungeon, mainCurve);
        if (newStartPoint === undefined) {
            checkForCurveLoops(dungeon, mainCurve);

            mainCurve.updateRenderPoints();
            return mainCurve;
        }

        if (subStepComplete) {
            await subStepComplete(DelaySize.Large);
        }

        // See if the different path is longer.
        const branchIndex = mainCurve.keyPoints.indexOf(newStartPoint);
        
        const newCurve = await generateWallCurve(dungeon, newStartPoint, random, subStepComplete);

        if (newCurve.keyPoints.length <= mainCurve.keyPoints.length - branchIndex || newStartPoint === firstTile) {
            continue;
        }

        // Swap the paths around so that this path is as long as possible.

        let newBranch = newCurve.keyPoints.slice(1);
        let oldBranch = mainCurve.keyPoints.splice(branchIndex + 1);
        oldBranch.unshift(newStartPoint);

        newCurve.keyPoints = oldBranch;
        mainCurve.keyPoints = mainCurve.keyPoints.concat(newBranch);
        
        checkForCurveLoops(dungeon, newCurve);

        newCurve.updateRenderPoints();
    }
}

function backtrackToNewStartPoint(dungeon: Dungeon, curve: Curve) {
    // iterate backwards round this curve, trying to find somewhere to branch off a new curve from
    for (let i = curve.keyPoints.length - 1; i >= 0; i--) {
        let curveTile = curve.keyPoints[i] as Tile;

        let viableTile = pickBestAdjacentWallTile(dungeon, curveTile, true, true, t => !t.isFloor && t.isWall);
        if (viableTile !== undefined) {
            return curveTile;
        }
    }

    return undefined;
}

function checkForCurveLoops(dungeon: Dungeon, mainCurve: Curve) {
    // detect simple loops, as well as "p" and "b" loops that need split into two parts
    const firstPoint = mainCurve.keyPoints[0];
    const lastPoint = mainCurve.keyPoints[mainCurve.keyPoints.length - 1];
    
    if (firstPoint === lastPoint) {
        mainCurve.isLoop = true;
    } else {
        let splitPos = mainCurve.keyPoints.lastIndexOf(firstPoint);
        if (splitPos > 0) {
            // p shape, loop at the start
            const splitCurve = new Curve();
            splitCurve.keyPoints = mainCurve.keyPoints.splice(splitPos + 1);
            splitCurve.keyPoints.unshift(mainCurve.keyPoints[splitPos]);
            splitCurve.updateRenderPoints();
            dungeon.walls.push(splitCurve);
            
            mainCurve.isLoop = true;
            // console.log('found a P, splitting linear end bit into its own curve');
        }
        
        splitPos = mainCurve.keyPoints.indexOf(lastPoint);
        if (splitPos < mainCurve.keyPoints.length - 1) {
            // b shape, loop at the end
            /*
            console.log(`loop found in curve ${dungeon.walls.indexOf(mainCurve)} at index ${splitPos} ... 0-${splitPos} will separate off linearly, keeping from ${splitPos}-${mainCurve.keyPoints.length - 1} as a loop`);
            console.log(`index ${0} is ${mainCurve.keyPoints[0].x}, ${mainCurve.keyPoints[0].y}`);
            console.log(`index ${splitPos} is ${mainCurve.keyPoints[splitPos].x}, ${mainCurve.keyPoints[splitPos].y}`);
            console.log(`index ${mainCurve.keyPoints.length - 1} is ${mainCurve.keyPoints[mainCurve.keyPoints.length - 1].x}, ${mainCurve.keyPoints[mainCurve.keyPoints.length - 1].y}`);
            */
            const splitCurve = new Curve();
            const splitPoint = mainCurve.keyPoints[splitPos];
            splitCurve.keyPoints = mainCurve.keyPoints.splice(0, splitPos - 1);
            splitCurve.keyPoints.push(splitPoint);
            splitCurve.updateRenderPoints();
            dungeon.walls.push(splitCurve);

            mainCurve.isLoop = true;
            // console.log('found a B, splitting linear start bit into its own curve');

            /*
            console.log(`after splitting, main curve is ${mainCurve.keyPoints.length} long`);
            console.log(`split curve is ${splitCurve.keyPoints.length} long`);
            */
        }
    }
}

async function generateSingleWallCurve(dungeon: Dungeon, firstTile: Tile, random: SRandom, subStepComplete?: (interval: DelaySize) => Promise<void>) {
    const curve = new Curve();
    dungeon.walls.push(curve);

    // If there's an adjacent tile that's already part of a wall curve, start from that instead.
    const actualFirstTile = getAdjacent(dungeon, firstTile, true, true)
        .find(t => t.isWall && t.isFloor);
    if (actualFirstTile !== undefined) {
        curve.keyPoints.push(actualFirstTile);
    }

    curve.keyPoints.push(firstTile);
    firstTile.isFloor = true;

    // Pick next tile, keep looping. When there isn't a next one, stop. Initially, only look orthogonally.
    let tile = pickBestAdjacentWallTileOrthogonalThenDiagonal(
        dungeon,
        firstTile,
        t => !t.isFloor && t.isWall
    );

    if (tile === undefined) {
        // Do the same check agains, but don't ignore tiles that are part of walls. This will be the last one.
        tile = pickBestAdjacentWallTileOrthogonalThenDiagonal(
            dungeon,
            firstTile,
            t => t.isWall
        );
    }
    
    let prevTile = firstTile;
    while (tile !== undefined) {
        // TODO: caves should be more likely to add mid-vertices and get squiggly shapes
        // if (tile.room !== null || tile === firstTile || random.nextInRange(0, 1) < 0.2) {
        curve.keyPoints.push(tile);
        // }
        
        // if the next one is the first one, note that this is a loop and stop.
        if (tile === firstTile) {
            curve.isLoop = true;
            break;
        }
        
        if (tile.isFloor) {
            break; // intersected a(nother) curve, so end this one
        }
        tile.isFloor = true;
        
        let next = pickBestAdjacentWallTileOrthogonalThenDiagonal(
            dungeon,
            tile,
            t => !t.isFloor && t.isWall && t !== prevTile
        );
        if (next === undefined) {
            // do the same check again, but don't ignore tiles that are part of walls. This will be the last one.
            next = pickBestAdjacentWallTileOrthogonalThenDiagonal(
                dungeon,
                tile,
                t => t.isWall && t !== prevTile
            );
        }
        prevTile = tile;
        tile = next;

        if (subStepComplete) {
            curve.updateRenderPoints();
            await subStepComplete(DelaySize.Minimal);
        }
    }

    curve.updateRenderPoints();

    if (subStepComplete) {
        await subStepComplete(DelaySize.Medium);
    }

    return curve;
}

export function pickBestAdjacentWallTileOrthogonalThenDiagonal(
    dungeon: Dungeon,
    from: Tile,
    filter: (tile: Tile) => boolean
) {
    const ortho = pickBestAdjacentWallTile(dungeon, from, true, false, filter);
    return ortho !== undefined
        ? ortho
        : pickBestAdjacentWallTile(dungeon, from, false, true, filter);
}

function pickBestAdjacentWallTile(
    dungeon: Dungeon,
    from: Tile,
    orthogonal: boolean,
    diagonal: boolean,
    filter: (tile: Tile) => boolean
) {
    let bestTile: Tile | undefined;
    let bestNumAdjacentNonWallTiles = 0;

    let toTest = getAdjacent(dungeon, from, orthogonal, diagonal);
    for (let tile of toTest) {
        if (!filter(tile)) {
            continue;
        }

        let numAdjacentNonWallTiles = 0;
        let allAdjacent = getAdjacent(dungeon, tile, true, true);

        for (let adjacent of allAdjacent) {
            if (!adjacent.isWall) {
                numAdjacentNonWallTiles++;
            }
        }

        if (numAdjacentNonWallTiles > bestNumAdjacentNonWallTiles) {
            bestNumAdjacentNonWallTiles = numAdjacentNonWallTiles;
            bestTile = tile;
        }
    }
    
    return bestTile;
}