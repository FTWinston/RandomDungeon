import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { Region, RegionType } from '../../dungeon/model/Region';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { randomColor } from '../../lib/randomColor';

interface Props {
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

export const AddRegions: FunctionComponent<Props> = props => {
    const { dungeonDisplay, dungeon, redraw, cellSize } = props;
    
    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.DetectWalls, true, props.cellSize),
            regionAlpha: 0.5,
            nodeAlpha: 1.0,
            drawWallsAsFloor: false,
        });
    }, []); // eslint-disable-line

    useEffect(() => {
        if (dungeonDisplay === undefined) {
            return;
        }

        const leftClick = (e: MouseEvent) => {
                const cellX = e.offsetX / cellSize;
                const cellY = e.offsetY / cellSize;
    
                // add new node
                const seed = Math.random();
                const regionType = Math.floor(Math.random() * RegionType.NUM_VALUES);
                dungeon.nodes.push(new Region(dungeon, cellX, cellY, seed, regionType, randomColor()));
                redraw();
            };

        const rightClick = (e: MouseEvent) => {
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

        dungeonDisplay.addEventListener('click', leftClick);
        dungeonDisplay.addEventListener('contextmenu', rightClick);

        return () => {
            dungeonDisplay.removeEventListener('click', leftClick);
            dungeonDisplay.removeEventListener('contextmenu', rightClick);
        };
    }, [dungeonDisplay, dungeon, redraw, cellSize]);

    return <div className="menu__section">
        Left click the map to place region nodes. Right click to remove a region.
    </div>
}