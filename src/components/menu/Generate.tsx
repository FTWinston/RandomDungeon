import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';

export interface Props {
    isGenerating: boolean;
    generate: () => Promise<void>;
    animate: () => Promise<void>;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    skip: () => void;
    finish: () => void;

    showSize: () => void;
    showRegions: () => void;
    showRenders: () => void;
}

export const Generate: FunctionComponent<Props> = props => {
    const generateOrSkip = props.isGenerating
        ? <button className="menu__button">Skip step</button>
        : <button className="menu__button" onClick={props.generate}>Generate new</button>

    const animateOrFinish = props.isGenerating
        ? <button className="menu__button">Finish</button>
        : <button className="menu__button" onClick={props.animate}>Animate generation</button>

    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.Render, true, props.cellSize),
        });
    }, []); // eslint-disable-line
    
    return <div className="menu menu--autoGenerate">
        <button className="menu__link" onClick={props.showSize}>Map size</button>
        <button className="menu__link" onClick={props.showRegions}>Edit regions</button>
        <button className="menu__link" onClick={props.showRenders}>Renders</button>

        <div className="menu__spacer" />

        {generateOrSkip}
        {animateOrFinish}
    </div>
}