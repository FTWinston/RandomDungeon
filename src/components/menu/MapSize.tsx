import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { RangeInput } from '../common/RangeInput';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { Dungeon } from '../../dungeon/model/Dungeon';

interface Props {
    goBack: () => void;
    dungeon: Dungeon;
    generationSettings: IGenerationSettings;
    setGenerationSettings: (settings: IGenerationSettings) => void;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

export const MapSize: FunctionComponent<Props> = props => {
    const setWidth = (val: number) => {
        const scale = val / props.generationSettings.cellsWide;
        for (const node of props.dungeon.nodes) {
            node.x *= scale;
        }

        props.setGenerationSettings({
            ...props.generationSettings,
            cellsWide: val,
        });
    }

    const setHeight = (val: number) => {
        const scale = val / props.generationSettings.cellsHigh;
        for (const node of props.dungeon.nodes) {
            node.y *= scale;
        }
        
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