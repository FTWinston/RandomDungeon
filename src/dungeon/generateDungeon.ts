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
    
    const steps: Array<[GenerationSteps, GenerationStep, DelaySize]> = [
        [GenerationSteps.CreateTiles, createTiles, DelaySize.None],
        [GenerationSteps.CreateNodes, createRegions, DelaySize.Large],
        [GenerationSteps.AssociateTiles, associateTilesWithNodes, DelaySize.Large],
        [GenerationSteps.LinkNodes, populateLinks, DelaySize.Large],
        [GenerationSteps.FilterLinks, filterLinks, DelaySize.Large],
        [GenerationSteps.ExpandLines, linkLinesToGrid, DelaySize.Large],
        [GenerationSteps.CreateRooms, createRooms, DelaySize.Large],
        [GenerationSteps.DetectWalls, detectWalls, DelaySize.Large],
        [GenerationSteps.CurveWalls, generateWallCurves, DelaySize.Large],
        [GenerationSteps.FillBackdrop, fillBackdrop, DelaySize.Large],
    ];

    for (const [step, operation, endDelay] of steps) {
        const stepSeed = seedGenerator.next();

        if (settings.generateFrom > step) {
            continue;
        }

        if (settings.generateTo < step) {
            break;
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
        
        if (settings.animateFrom <= step && endDelay > DelaySize.None) {
            settings.redraw(dungeon, step, true);
            await delay(endDelay);
        }
    }
}

function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), milliseconds);
    });
}