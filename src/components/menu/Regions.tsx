import * as React from 'react';
import { FunctionComponent, useEffect, useState } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { Region, RegionType } from '../../dungeon/model/Region';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { randomColor } from '../../lib/randomColor';

interface Props {
    goBack: () => void;
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

enum RegionMode {
    AddRemove,
    Resize,
    ChangeType,
}

export const Regions: FunctionComponent<Props> = props => {
    const { dungeonDisplay, dungeon, redraw, cellSize } = props;
    
    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.DetectWalls, true, props.cellSize),
            regionAlpha: 0.5,
            nodeAlpha: 1.0,
            drawWallsAsFloor: false,
        });
    }, []); // eslint-disable-line

    const [mode, setMode] = useState(RegionMode.AddRemove);

    // add/remove effect
    useEffect(() => {
        if (dungeonDisplay === undefined) {
            return;
        }

        let leftClick: (e: MouseEvent) => void;
        let rightClick: (e: MouseEvent) => void;

        switch (mode) {
            case RegionMode.AddRemove:
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
            case RegionMode.Resize:
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
            case RegionMode.ChangeType:
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
    }, [dungeonDisplay, dungeon, redraw, cellSize, mode]);

    let text: string | undefined;

    switch (mode) {
        case RegionMode.AddRemove:
            text = "Left click the map to place region nodes. Right click to remove a region.";
            break;
        case RegionMode.Resize:
            text = "Left click the a region to grow it, right click a region to shrink it.";
            break;
        case RegionMode.ChangeType:
            text = "Left click a region to change its type. Right click to regenerate it with the same type.";
            break;
    }

    return <div className="menu menu--regionPlacement">
        <button className="menu__button menu__button--back" onClick={props.goBack}>Go back</button>

        <ul className="menu__choice">
            <li className={mode === RegionMode.AddRemove ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.AddRemove)}>Add/remove regions</li>
            <li className={mode === RegionMode.Resize ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.Resize)}>Resize regions</li>
            <li className={mode === RegionMode.ChangeType ? 'menu__selector menu__selector--active' : 'menu__selector'} onClick={() => setMode(RegionMode.ChangeType)}>Change region types</li>
        </ul>

        <div className="menu__section">
            {text}
        </div>
    </div>
}