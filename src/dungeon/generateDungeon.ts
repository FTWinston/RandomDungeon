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
    const seedGenerator = new SRandom(settings.seed);
    
    const steps: Array<[GenerationSteps, GenerationStep]> = [
        [GenerationSteps.CreateNodes, populateNodes],
        [GenerationSteps.LinkNodes, populateLinks],
        [GenerationSteps.FilterLinks, filterLinks],
        [GenerationSteps.CreateRooms, createRooms],
        [GenerationSteps.ExpandLines, linkLinesToGrid],
        [GenerationSteps.DetectWalls, detectWalls],
        [GenerationSteps.CurveWalls, generateWallCurves],
    ];

    for (const [step, operation] of steps) {
        const stepSeed = seedGenerator.next();

        if (settings.generateFrom > step) {
            continue;
        }

        const animateThisStep = settings.animateFrom <= step;

        const subStepReached = animateThisStep
            ? async (interval: DelaySize) => {
                settings.redraw(dungeon, step, false);
                await delay(interval);
            }
            : undefined;
        
        await operation(dungeon, settings, stepSeed, subStepReached);
        
        if (animateThisStep) {
            settings.redraw(dungeon, step, true);
            await delay(DelaySize.Large);
        }
    }

    settings.redraw(dungeon, GenerationSteps.Render, true);
}

function delay(milliseconds: number): Promise<void> {
    return new Promise<void>(resolve => {
        setTimeout(() => resolve(), milliseconds);
    });
}