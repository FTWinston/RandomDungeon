import * as React from 'react';
import { FunctionComponent, useMemo } from 'react';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { Link } from 'react-router-dom';
import { RangeInput } from '../common/RangeInput';

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
    const settings = props.generationSettings;

    const generateNew = useMemo(() => (() => generate(GenerationSteps.Render)), [generate]);
    const animate = useMemo(() => (() => regenerate(true, GenerationSteps.FIRST_STEP, GenerationSteps.Render)), [regenerate]);

    const regenerateFromStart = useMemo(() => (() => regenerate(false, GenerationSteps.FIRST_STEP, GenerationSteps.Render)), [regenerate]);
    const regenerateFromConnectivity = useMemo(() => (() => regenerate(false, GenerationSteps.FilterLinks, GenerationSteps.Render)), [regenerate]);

    const setWidth = (val: number) => {
        props.setGenerationSettings({
            ...settings,
            cellsWide: val,
        });
    };

    const setHeight = (val: number) => {
        props.setGenerationSettings({
            ...settings,
            cellsHigh: val,
        });
    };

    const setNodeCount = (val: number) => {
        props.setGenerationSettings({
            ...settings,
            nodeCount: val,
        });
    };

    const setConnectivity = (val: number) => {
        props.setGenerationSettings({
            ...settings,
            connectivity: val,
        });
    };

    const generateOrSkip = props.isGenerating
        ? <button className="menu__button">Skip step</button>
        : <button className="menu__button" onClick={generateNew}>Generate new</button>

    const animateOrFinish = props.isGenerating
        ? <button className="menu__button">Finish</button>
        : <button className="menu__button" onClick={animate}>Animate generation</button>

    return <div className="menu menu--autoGenerate">
        <Link className="menu__link" to="/interactive">Interactive generation</Link>

        {generateOrSkip}
        {animateOrFinish}

        <div className="menu__group">
            <RangeInput
                label="Width"
                min={20}
                max={200}
                value={settings.cellsWide}
                onChange={setWidth}
                onChangeComplete={regenerateFromStart}
                disabled={props.isGenerating}
            />

            <RangeInput
                label="Height"
                min={20}
                max={200}
                value={settings.cellsHigh}
                onChange={setHeight}
                onChangeComplete={regenerateFromStart}
                disabled={props.isGenerating}
            />

            <RangeInput
                label="Node count"
                min={2}
                max={100}
                value={settings.nodeCount}
                onChange={setNodeCount}
                onChangeComplete={regenerateFromStart}
                disabled={props.isGenerating}
            />

            <RangeInput
                label="Connectivity"
                min={0}
                max={100}
                value={settings.connectivity}
                onChange={setConnectivity}
                onChangeComplete={regenerateFromConnectivity}
                disabled={props.isGenerating}
            />
        </div>

        <Link className="menu__link" to="/interactive/details">Edit manually</Link>
        <Link className="menu__link" to="/download">Download</Link>
    </div>
}