import * as React from 'react';
import { FunctionComponent, useMemo } from 'react';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { Link } from 'react-router-dom';

export interface Props {
    isGenerating: boolean;
    generationSettings: Readonly<IGenerationSettings>;
    setGenerationSettings: (settings: IGenerationSettings) => void;
    generate: (generateTo: GenerationSteps) => Promise<void>;
    regenerate: (animate: boolean, generateFrom: GenerationSteps, generateTo: GenerationSteps) => Promise<void>;
    skip: () => void;
    finish: () => void;
}

export const AutoGenerate: FunctionComponent<Props> = props => {
    const { generate, regenerate } = props;
    const generateNew = useMemo(() => (() => generate(GenerationSteps.Render)), [generate]);
    const animate = useMemo(() => (() => regenerate(true, GenerationSteps.FIRST_STEP, GenerationSteps.Render)), [regenerate]);

    const generateOrSkip = props.isGenerating
        ? <button>Skip step</button>
        : <button onClick={generateNew}>Generate new</button>

    const animateOrFinish = props.isGenerating
        ? <button>Finish</button>
        : <button onClick={animate}>Animate generation</button>

    return <div className="menu menu--autoGenerate">
        <Link to="/interactive">Interactive generation</Link>

        {generateOrSkip}
        {animateOrFinish}

        <Link to="/interactive/details">Edit manually</Link>
        <Link to="/download">Download</Link>
    </div>
}

/*
    // TODO: see GenerateMenu.tsx

        let regenerateFrom;
        if (prevState.settings.cellsWide !== this.state.settings.cellsWide) {
            regenerateFrom = GenerationSteps.FIRST_STEP;
        }

        if (prevState.settings.cellsHigh !== this.state.settings.cellsHigh) {
            regenerateFrom = GenerationSteps.FIRST_STEP;
        }

        if (prevState.cellSize !== this.state.cellSize) {
            regenerateFrom = GenerationSteps.Render;
        }

        if (prevState.settings.nodeCount !== this.state.settings.nodeCount) {
            regenerateFrom = GenerationSteps.FIRST_STEP;
        }

        if (prevState.settings.connectivity !== this.state.settings.connectivity) {
            regenerateFrom = GenerationSteps.FilterLinks;
        }

        if (regenerateFrom !== undefined) {
            this.updateDungeon(regenerateFrom);
        }
*/