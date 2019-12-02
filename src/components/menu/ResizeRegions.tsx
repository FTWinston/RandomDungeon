import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';

interface Props {
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
}

export const ResizeRegions: FunctionComponent<Props> = props => {
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

            cell.region.regionInfluence *= 1.2;
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

            cell.region.regionInfluence /= 1.2;
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
        Left click a region to grow it, right click a region to shrink it.
    </div>
}