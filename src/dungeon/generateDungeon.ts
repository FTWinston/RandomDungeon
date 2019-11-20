import { Dungeon } from './model/Dungeon';
import { GenerationSteps } from './GenerationSteps';
import { SRandom } from '../lib/SRandom';
import { populateNodes } from './generation/populateNodes';
import { populateLinks } from './generation/populateLinks';
import { filterLinks } from './generation/filterLinks';
import { createRooms } from './generation/createRooms';
import { linkLinesToGrid } from './generation/linkLinesToGrid';
import { detectWalls } from './generation/detectWalls';
import { generateWallCurves } from './generation/generateWallCurves';
import { IGenerationSettings } from './IGenerationSettings';
import { associateTilesWithNodes } from './generation/associateTilesWithNodes';
import { Tile } from './model/Tile';

export enum DelaySize {
    Minimal = 10,
    Tiny = 50,
    Small = 100,
    Medium = 500,
    Large = 1500,
}

type GenerationStep = (
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepReached?: (interval: DelaySize) => Promise<void>
) => Promise<void>;

export async function generateDungeon(
    settings: IGenerationSettings,
) {
    const dungeon = new Dungeon();
    await regenerateDungeon(dungeon, settings);
    return dungeon;
}

export async function regenerateDungeon(
    dungeon: Dungeon,
    settings: IGenerationSettings,
) {
    dungeon.width = settings.cellsWide;
    dungeon.height = settings.cellsHigh;

    createTiles(dungeon);

    const seedGenerator = new SRandom(settings.seed);
    
    const steps: Array<[GenerationSteps, GenerationStep]> = [
        [GenerationSteps.CreateNodes, populateNodes],
        [GenerationSteps.AssociateTiles, associateTilesWithNodes],
        [GenerationSteps.LinkNodes, populateLinks],
        [GenerationSteps.FilterLinks, filterLinks],
        [GenerationSteps.ExpandLines, linkLinesToGrid],
        [GenerationSteps.CreateRooms, createRooms],
        [GenerationSteps.DetectWalls, detectWalls],
        [GenerationSteps.CurveWalls, generateWallCurves],
    ];

    for (const [step, operation] of steps) {
        const stepSeed = seedGenerator.next();

        if (settings.generateFrom > step) {
            continue;
        }

        const subStepReached = settings.animateFrom <= step
            ? async (interval: DelaySize) => {
                if (settings.animateFrom > step) {
                    return; // give up on animation
                }

                settings.redraw(dungeon, step, false);
                await delay(interval);
            }
            : undefined;
        
        await operation(dungeon, settings, stepSeed, subStepReached);
        
        if (settings.animateFrom <= step) {
            settings.redraw(dungeon, step, true);
            await delay(DelaySize.Large);
        }
    }

    settings.redraw(dungeon, GenerationSteps.Render, true);
}

function createTiles(dungeon: Dungeon) {
    dungeon.grid = [];
    for (let x = 0; x < dungeon.width; x++) {
        let col = new Array<Tile>(dungeon.height);
        dungeon.grid[x] = col;

        for (let y = 0; y < dungeon.height; y++) {
            col[y] = new Tile(x, y);
        }
    }
}

function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), milliseconds);
    });
}