import * as React from 'react';
import { FunctionComponent, useMemo, useEffect } from 'react';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';

export interface Props {
    isGenerating: boolean;
    generate: (generateTo: GenerationSteps) => Promise<void>;
    regenerate: (animate: boolean, generateFrom: GenerationSteps, generateTo: GenerationSteps) => Promise<void>;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    skip: () => void;
    finish: () => void;

    showSize: () => void;
    showAddRegions: () => void;
    showResizeRegions: () => void;
    showRegionTypes: () => void;
    showConnections: () => void;
    showRenders: () => void;
}

export const Generate: FunctionComponent<Props> = props => {
    const { generate, regenerate } = props;

    const generateNew = useMemo(() => (() => generate(GenerationSteps.Render)), [generate]);
    const animate = useMemo(() => (() => regenerate(true, GenerationSteps.FIRST_STEP, GenerationSteps.Render)), [regenerate]);

    const generateOrSkip = props.isGenerating
        ? <button className="menu__button">Skip step</button>
        : <button className="menu__button" onClick={generateNew}>Generate new</button>

    const animateOrFinish = props.isGenerating
        ? <button className="menu__button">Finish</button>
        : <button className="menu__button" onClick={animate}>Animate generation</button>


    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.Render, true, props.cellSize),
        });
    }, []); // eslint-disable-line
    
    return <div className="menu menu--autoGenerate">
        <button className="menu__link" onClick={props.showSize}>Map size</button>
        <button className="menu__link" onClick={props.showAddRegions}>Add/remove regions</button>
        <button className="menu__link" onClick={props.showResizeRegions}>Resize regions</button>
        <button className="menu__link" onClick={props.showRegionTypes}>Change region types</button>
        <button className="menu__link" onClick={props.showConnections}>Regions connections</button>
        <button className="menu__link" onClick={props.showRenders}>Renders</button>

        {generateOrSkip}
        {animateOrFinish}
    </div>
}