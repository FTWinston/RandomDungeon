import * as React from 'react';
import './Menu.css';
import { FunctionComponent } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { AutoGenerate, Props as AutoGenerateProps } from './AutoGenerate';
import { Download } from './Download';
import { RegionPlacement } from './RegionPlacement';
import { RegionSize } from './RegionSize';
import { RegionTypes } from './RegionTypes';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { MapSize } from './MapSize';
import { Dungeon } from '../../dungeon/model/Dungeon';

interface Props extends AutoGenerateProps {
    dungeon: Dungeon;
    canvas?: HTMLCanvasElement;
    cellSize: number;
    redraw: (step: GenerationSteps) => void;
}

export const Menu: FunctionComponent<Props> = props => {
    return (
        <Switch>
            <Route path="/" exact>
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
            <Route path="/download">
                <Download />
            </Route>
            <Route path="/interactive/size">
                <MapSize
                    next="/interactive/regions/place"
                    generationSettings={props.generationSettings}
                    setGenerationSettings={props.setGenerationSettings}
                    redraw={() => props.redraw(GenerationSteps.CreateTiles)}
                />
            </Route>
            <Route path="/interactive/regions/place">
                <RegionPlacement
                    prev="/interactive/size"
                    next="/interactive/regions/size"
                    dungeon={props.dungeon}
                    dungeonDisplay={props.canvas}
                    cellSize={props.cellSize}
                    redraw={() => props.redraw(GenerationSteps.CreateNodes)}
                />
            </Route>
            <Route path="/interactive/regions/size">
                <RegionSize
                    prev="/interactive/regions/place"
                    next="/interactive/regions/types"
                />
            </Route>
            <Route path="/interactive/regions/types">
                <RegionTypes
                    prev="/interactive/regions/size"
                />
            </Route>
            <Route path="/interactive" exact render={() => {
                props.generate(GenerationSteps.FIRST_STEP); // clear the current map
                return <Redirect to="/interactive/size" />
            }} />
            <Route path="/interactive">
                <Redirect to="/interactive/size" />
            </Route>
            <Route>
                <Redirect to="/" />
            </Route>
        </Switch>
    )
};