import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { RegionType } from '../../dungeon/model/Region';

interface Props {
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

export const RegionTypes: FunctionComponent<Props> = props => {
    const { dungeonDisplay, dungeon, redraw, cellSize } = props;
    
    useEffect(() => {
        props.setRenderSettings({
            ...determineRenderSettings(GenerationSteps.DetectWalls, true, props.cellSize),
            regionAlpha: 0.5,
            nodeAlpha: 1.0,
            drawWallsAsFloor: false,
        });
    }, []); // eslint-disable-line

    // add/remove effect
    useEffect(() => {
        if (dungeonDisplay === undefined) {
            return;
        }

        const leftClick = (e: MouseEvent) => {
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

        const rightClick = (e: MouseEvent) => {
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

        dungeonDisplay.addEventListener('click', leftClick);
        dungeonDisplay.addEventListener('contextmenu', rightClick);

        return () => {
            dungeonDisplay.removeEventListener('click', leftClick);
            dungeonDisplay.removeEventListener('contextmenu', rightClick);
        };
    }, [dungeonDisplay, dungeon, redraw, cellSize]);

    return <div className="menu__section">
        Left click a region to change its type. Right click to regenerate it with the same type.
    </div>
}