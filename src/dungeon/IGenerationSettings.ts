import { GenerationSteps } from './GenerationSteps';
import { Dungeon } from './model/Dungeon';

export interface IGenerationSettings {
    seed: number;
    nodeCount: number;
    cellsWide: number;
    cellsHigh: number;
    connectivity: number;
    steps: GenerationSteps[];
    animateSteps: GenerationSteps[];
    redraw: (dungeon: Dungeon, step: GenerationSteps, stepComplete: boolean) => void,
}