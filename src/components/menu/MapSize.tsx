import * as React from 'react';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';
import { RangeInput } from '../common/RangeInput';

interface Props {
    prev?: string;
    next?: string;
    cellsWide: number;
    cellsHigh: number;
    setWidth: (val: number) => void;
    setHeight: (val: number) => void;
}

export const MapSize: FunctionComponent<Props> = props => {
    const prev = props.prev === undefined
        ? undefined
        : <Link to={props.prev}>previous step</Link>

    const next = props.next === undefined
        ? undefined
        : <Link to={props.next}>next step</Link>

    return <div className="menu menu--mapSize">
        {prev}
        {next}
    
        <div className="menu__group">
            <RangeInput
                label="Width"
                min={20}
                max={200}
                value={props.cellsWide}
                onChange={props.setWidth}
            />

            <RangeInput
                label="Height"
                min={20}
                max={200}
                value={props.cellsHigh}
                onChange={props.setHeight}
            />
        </div>
    </div>
}