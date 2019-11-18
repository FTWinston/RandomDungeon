import { Dungeon } from '../model/Dungeon';
import { GenerationSteps } from './GenerationSteps';
import { SRandom } from './SRandom';
import { populateNodes } from './steps/populateNodes';
import { populateLinks } from './steps/populateLinks';
import { filterLinks } from './steps/filterLinks';
import { createRooms } from './steps/createRooms';
import { linkLinesToGrid } from './steps/linkLinesToGrid';
import { detectWalls } from './steps/detectWalls';
import { generateWallCurves } from './steps/generateWallCurves';

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
        public animated: boolean,
        readonly stepReached: (step: GenerationSteps, startOfStep: boolean) => void,
        readonly redraw: () => void
    ) {

    }

    async generate(dungeon: Dungeon, startStep: GenerationSteps = GenerationSteps.CreateNodes) {
        const seedGenerator = new SRandom(dungeon.seed);

        const subStepReached = this.animated
            ? async (interval: DelaySize) => {
                this.redraw();
                await this.delay(interval);
            }
            : undefined;
        
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
        this.animated = false; // don't animate when regenerating so the user can quickly see the results of changes
        this.redraw();
    }

    private delay(milliseconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }
}