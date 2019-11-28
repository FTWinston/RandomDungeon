import * as React from 'react';
import { FunctionComponent } from 'react';
import { RangeInput } from '../common/RangeInput';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';

interface Props {
    goBack: () => void;
    generationSettings: IGenerationSettings;
    setGenerationSettings: (settings: IGenerationSettings) => void;
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