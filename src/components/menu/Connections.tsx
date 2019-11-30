import * as React from 'react';
import { FunctionComponent, useEffect, useState } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';

interface Props {
    goBack: () => void;
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

enum ConnectionMode {
    AddRemove,
    Doors,
}

export const Connections: FunctionComponent<Props> = props => {
    const { dungeonDisplay, dungeon, redraw, cellSize } = props;
    
    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.FilterLinks, true, props.cellSize),
            regionAlpha: 0.33,
            drawWallsAsFloor: false,
            linkWidth: cellSize * 0.5,
            linkColor: '#0c0',
            graphAlpha: 0.5,
            minimumSpanningWidth: cellSize * 0.5,
            relativeNeighbourhoodWidth: cellSize * 0.25,
            gabrielWidth: cellSize * 0.125,
            delauneyWidth: 1,
        });
    }, []); // eslint-disable-line

    const [mode, setMode] = useState(ConnectionMode.AddRemove);

    // add/remove effect
    useEffect(() => {
        if (dungeonDisplay === undefined) {
            return;
        }

        /*
        let leftClick: (e: MouseEvent) => void;
        let rightClick: (e: MouseEvent) => void;

        switch (mode) {
            case ConnectionMode.AddRemove:
                leftClick = (e: MouseEvent) => {
                    const cellX = e.offsetX / cellSize;
                    const cellY = e.offsetY / cellSize;
        
                    // add new node
                    const seed = Math.random();
                    const regionType = Math.floor(Math.random() * RegionType.NUM_VALUES);
                    dungeon.nodes.push(new Region(dungeon, cellX, cellY, seed, regionType, randomColor()));
                    redraw();
                };

                rightClick = (e: MouseEvent) => {
                    const cellX = e.offsetX / cellSize;
                    const cellY = e.offsetY / cellSize;
        
                    e.preventDefault();
        
                    // remove associated node
                    const cell = dungeon.getTileAt(cellX, cellY);
                    if (cell === undefined || cell.region === null) {
                        return;
                    }
        
                    const node = cell.region;
                    dungeon.nodes = dungeon.nodes.filter(n => n !== node);
        
                    redraw();
                };
                break;
            case ConnectionMode.Reshape:
                leftClick = (e: MouseEvent) => {
                    const cellX = e.offsetX / cellSize;
                    const cellY = e.offsetY / cellSize;
        
                    const cell = dungeon.getTileAt(cellX, cellY);
                    if (cell === undefined || cell.region === null) {
                        return;
                    }
        
                    cell.region.regionInfluence *= 1.2;
                    redraw();
                };
        
                rightClick = (e: MouseEvent) => {
                    const cellX = e.offsetX / cellSize;
                    const cellY = e.offsetY / cellSize;
        
                    e.preventDefault();
        
                    const cell = dungeon.getTileAt(cellX, cellY);
                    if (cell === undefined || cell.region === null) {
                        return;
                    }
        
                    cell.region.regionInfluence /= 1.2;
                    redraw();
                };
                break;
            case ConnectionMode.Doors:
                leftClick = (e: MouseEvent) => {
                    const cellX = e.offsetX / cellSize;
                    const cellY = e.offsetY / cellSize;
        
                    const cell = dungeon.getTileAt(cellX, cellY);
                    if (cell === undefined || cell.region === null) {
                        return;
                    }
        
                    if (++cell.region.regionType >= RegionType.NUM_VALUES) {
                        cell.region.regionType = RegionType.FIRST_VALUE;
                    }
                    redraw();
                };
        
                rightClick = (e: MouseEvent) => {
                    const cellX = e.offsetX / cellSize;
                    const cellY = e.offsetY / cellSize;
        
                    e.preventDefault();
        
                    const cell = dungeon.getTileAt(cellX, cellY);
                    if (cell === undefined || cell.region === null) {
                        return;
                    }

                    cell.region.seed = Math.random();
                    redraw();
                };
                break;
            default:
                return;       
        }

        dungeonDisplay.addEventListener('click', leftClick);
        dungeonDisplay.addEventListener('contextmenu', rightClick);

        return () => {
            dungeonDisplay.removeEventListener('click', leftClick);
            dungeonDisplay.removeEventListener('contextmenu', rightClick);
        };
        */
    }, [dungeonDisplay, dungeon, redraw, cellSize, mode]);

    let text: string | undefined;

    switch (mode) {
        case ConnectionMode.AddRemove:
            text = "Left click the map to toggle a pathway on / off. Right click to regenerate a pathway.";
            break;
        case ConnectionMode.Doors:
            text = "Left click on a pathway to toggle a door. Right click to toggle a secret door.";
            break;
    }

    return <div className="menu menu--regionPlacement">
        <button className="menu__button menu__button--back" onClick={props.goBack}>Go back</button>

        <ul className="menu__choice">
            <li className={mode === ConnectionMode.AddRemove ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(ConnectionMode.AddRemove)}>Add/remove paths</li>
            <li className={mode === ConnectionMode.Doors ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(ConnectionMode.Doors)}>Add/remove doors</li>
        </ul>

        <div className="menu__section">
            {text}
        </div>
    </div>
}