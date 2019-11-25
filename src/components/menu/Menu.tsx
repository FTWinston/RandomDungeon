import * as React from 'react';
import './Menu.css';
import { FunctionComponent } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { AutoGenerate, Props as AutoGenerateProps } from './AutoGenerate';
import { Download } from './Download';
import { RegionPlacement } from './RegionPlacement';
import { RegionSize } from './RegionSize';
import { RegionTypes } from './RegionTypes';

interface Props extends AutoGenerateProps {
    
}

export const Menu: FunctionComponent<Props> = props => {
    return (
        <Switch>
            <Route path="" exact>
                <AutoGenerate
                    isGenerating={props.isGenerating}
                    generationSettings={props.generationSettings}
                    setGenerationSettings={props.setGenerationSettings}
                    generate={props.generate}
                    regenerate={props.regenerate}
                    skip={props.skip}
                    finish={props.finish}
                />
            </Route>
            <Route path="download">
                <Download />
            </Route>
            <Route path="interactive/regions/place">
                <RegionPlacement
                    next="interactive/regions/size"
                />
            </Route>
            <Route path="interactive/regions/size">
                <RegionSize
                    prev="interactive/regions/place"
                    next="interactive/regions/types"
                />
            </Route>
            <Route path="interactive/regions/types">
                <RegionTypes
                    prev="interactive/regions/size"
                />
            </Route>
            <Route>
                <Redirect to="/" />
            </Route>
        </Switch>
    )
};