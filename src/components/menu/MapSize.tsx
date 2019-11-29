import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { RangeInput } from '../common/RangeInput';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';

interface Props {
    goBack: () => void;
    generationSettings: IGenerationSettings;
    setGenerationSettings: (settings: IGenerationSettings) => void;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

export const MapSize: FunctionComponent<Props> = props => {
    const setWidth = (val: number) => {
        props.setGenerationSettings({
            ...props.generationSettings,
            cellsWide: val,
        });
    }

    const setHeight = (val: number) => {
        props.setGenerationSettings({
            ...props.generationSettings,
            cellsHigh: val,
        });
    }

    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.DetectWalls, true, props.cellSize),
            drawWallsAsFloor: false,
        });
    }, []); // eslint-disable-line

    return <div className="menu menu--mapSize">
        <button className="menu__button menu__button--back" onClick={props.goBack}>Go back</button>
    
        <div className="menu__group">
            <RangeInput
                label="Width"
                min={20}
                max={200}
                value={props.generationSettings.cellsWide}
                onChange={setWidth}
                onChangeComplete={props.redraw}
            />

            <RangeInput
                label="Height"
                min={20}
                max={200}
                value={props.generationSettings.cellsHigh}
                onChange={setHeight}
                onChangeComplete={props.redraw}
            />
        </div>
    </div>
}