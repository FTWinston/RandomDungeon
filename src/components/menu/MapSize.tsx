import * as React from 'react';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { RangeInput } from '../common/RangeInput';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';

interface Props {
    prev?: string;
    next?: string;
    generationSettings: IGenerationSettings;
    setGenerationSettings: (settings: IGenerationSettings) => void;
    redraw: () => void;
}

export const MapSize: FunctionComponent<Props> = props => {
    const prev = props.prev === undefined
        ? undefined
        : <Link to={props.prev}>previous step</Link>

    const next = props.next === undefined
        ? undefined
        : <Link to={props.next}>next step</Link>

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
        {prev}
        {next}
    
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