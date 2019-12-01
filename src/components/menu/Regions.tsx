import * as React from 'react';
import { FunctionComponent,  useState } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { IRenderSettings } from '../../dungeon/IRenderSettings';
import { AddRegions } from './AddRegions';
import { ResizeRegions } from './ResizeRegions';
import { RegionTypes } from './RegionTypes';
import { Connections } from './Connections';
import { GenerationSteps, allSteps } from '../../dungeon/GenerationSteps';

interface Props {
    goBack: () => void;
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    regenerate: (steps: GenerationSteps[]) => void;
}

enum RegionMode {
    AddRemove,
    Resize,
    ChangeType,
    Connections,
}

export const Regions: FunctionComponent<Props> = props => {
    const [mode, setMode] = useState(RegionMode.AddRemove);

    let subMenu: JSX.Element | undefined;

    switch (mode) {
        case RegionMode.AddRemove:
            subMenu = <AddRegions
                cellSize={props.cellSize}
                dungeon={props.dungeon}
                dungeonDisplay={props.dungeonDisplay}
                setRenderSettings={props.setRenderSettings}
                redraw={() => props.regenerate([GenerationSteps.CreateTiles, ...allSteps.slice(2)])} // skip CreateTiles and CreateNodes
            />
            break;
        case RegionMode.Resize:
            subMenu = <ResizeRegions
                cellSize={props.cellSize}
                dungeon={props.dungeon}
                dungeonDisplay={props.dungeonDisplay}
                setRenderSettings={props.setRenderSettings}
                redraw={() => props.regenerate([GenerationSteps.CreateTiles, ...allSteps.slice(2)])} // skip CreateTiles and CreateNodes
            />
            break;
        case RegionMode.ChangeType:
            subMenu = <RegionTypes
                cellSize={props.cellSize}
                dungeon={props.dungeon}
                dungeonDisplay={props.dungeonDisplay}
                setRenderSettings={props.setRenderSettings}
                redraw={() => props.regenerate([GenerationSteps.CreateTiles, ...allSteps.slice(2)])} // skip CreateTiles and CreateNodes
            />
            break;
        case RegionMode.Connections:
            subMenu = <Connections
                cellSize={props.cellSize}
                dungeon={props.dungeon}
                dungeonDisplay={props.dungeonDisplay}
                setRenderSettings={props.setRenderSettings}
                redraw={() => props.regenerate([GenerationSteps.CreateTiles, GenerationSteps.AssociateTiles, ...allSteps.slice(5)])} // jump to ExpandLines
            />
            break;
    }

    return <div className="menu menu--regionPlacement">
        <button className="menu__button menu__button--back" onClick={props.goBack}>Go back</button>

        <ul className="menu__choice">
            <li className={mode === RegionMode.AddRemove ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.AddRemove)}>Add/remove regions</li>
            <li className={mode === RegionMode.Resize ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.Resize)}>Resize regions</li>
            <li className={mode === RegionMode.ChangeType ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.ChangeType)}>Change region types</li>
            <li className={mode === RegionMode.Connections ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.Connections)}>Add/remove paths</li>
        </ul>

        {subMenu}
    </div>
}