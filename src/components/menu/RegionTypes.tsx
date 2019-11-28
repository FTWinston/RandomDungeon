import * as React from 'react';
import { FunctionComponent } from 'react';

interface Props {
    goBack: () => void;
}

export const RegionTypes: FunctionComponent<Props> = props => {
    return <div className="menu menu--regionTypes">
        <button className="menu__button menu__button--back" onClick={props.goBack}>Go back</button>

        TODO
    </div>
}
