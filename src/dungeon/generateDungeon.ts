import { Dungeon } from './model/Dungeon';
import { GenerationSteps } from './GenerationSteps';
import { SRandom } from '../lib/SRandom';
import { createRegions } from './generation/createRegions';
import { populateLinks } from './generation/populateLinks';
import { filterLinks } from './generation/filterLinks';
import { createRooms } from './generation/createRooms';
import { linkLinesToGrid } from './generation/linkLinesToGrid';
import { detectWalls } from './generation/detectWalls';
import { generateWallCurves } from './generation/generateWallCurves';
import { IGenerationSettings } from './IGenerationSettings';
import { associateTilesWithNodes } from './generation/associateTilesWithNodes';
import { fillBackdrop } from './generation/fillBackdrop';
import { createTiles } from './generation/createTiles';

export enum DelaySize {
    None = 0,
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

    const seedGenerator = new SRandom(settings.seed);
    
    const stepFunctions = new Map<GenerationSteps, GenerationStep>([
        [GenerationSteps.CreateTiles, createTiles],
        [GenerationSteps.CreateNodes, createRegions],
        [GenerationSteps.AssociateTiles, associateTilesWithNodes],
        [GenerationSteps.LinkNodes, populateLinks],
        [GenerationSteps.FilterLinks, filterLinks],
        [GenerationSteps.ExpandLines, linkLinesToGrid],
        [GenerationSteps.CreateRooms, createRooms],
        [GenerationSteps.DetectWalls, detectWalls],
        [GenerationSteps.CurveWalls, generateWallCurves],
        [GenerationSteps.FillBackdrop, fillBackdrop],    
    ]);

    for (const step of settings.steps) {
        const operation = stepFunctions.get(step);
        if (operation === undefined) {
            continue;
        }

        const stepSeed = seedGenerator.next();

        const subStepReached = settings.animateSteps.indexOf(step) !== -1
            ? async (interval: DelaySize) => {
                if (settings.animateSteps.indexOf(step) === -1) {
                    return; // give up on animation
                }

                settings.redraw(dungeon, step, false);
                await delay(interval);
            }
            : undefined;
        
        await operation(dungeon, settings, stepSeed, subStepReached);
        
        if (settings.animateSteps.indexOf(step) !== -1 && step !== GenerationSteps.CreateTiles) {
            settings.redraw(dungeon, step, true);
            await delay(DelaySize.Large);
        }
    }
}

function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), milliseconds);
    });
}