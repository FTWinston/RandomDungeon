import * as React from 'react';
import { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

interface Props {
    prev?: string;
    next?: string;
}

export const RegionPlacement: FunctionComponent<Props> = props => {
    const prev = props.prev === undefined
        ? undefined
        : <Link to={props.prev}>previous step</Link>

    const next = props.next === undefined
        ? undefined
        : <Link to={props.next}>next step</Link>

    return <div className="menu menu--regionPlacement">
        TODO

        {prev}
        {next}
    </div>
}
