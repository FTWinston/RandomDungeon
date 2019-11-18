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

export enum DelaySize {
    Minimal = 10,
    Tiny = 50,
    Small = 100,
    Medium = 500,
    Large = 1500,
}

type GenerationStep = (
    dungeon: Dungeon,
    seed: number,
    subStepReached?: (interval: DelaySize) => Promise<void>
) => Promise<void>;

export class DungeonGenerator {
    constructor(
        public animateFrom = GenerationSteps.Render,
        readonly stepReached: (step: GenerationSteps, startOfStep: boolean) => void,
        readonly redraw: () => void
    ) {

    }

    async generate(dungeon: Dungeon, startStep: GenerationSteps = GenerationSteps.CreateNodes) {
        const seedGenerator = new SRandom(dungeon.seed);
        
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

            const subStepReached = this.animateFrom <= step
                ? async (interval: DelaySize) => {
                    this.redraw();
                    await this.delay(interval);
                }
                : undefined;

            if (startStep <= step) {
                this.stepReached(step, true);
                operation(dungeon, stepSeed, subStepReached);
                this.stepReached(step, false);
    
                if (subStepReached) {
                    subStepReached(DelaySize.Large);
                }
            }
        }
        
        this.stepReached(GenerationSteps.Render, true);
        this.animateFrom = GenerationSteps.Render; // don't animate when regenerating so the user can quickly see the results of changes
        this.redraw();
    }

    private delay(milliseconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }
}