import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';

interface Props {
    goBack: () => void;
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    redraw: () => void;
}

export const RegionSize: FunctionComponent<Props> = props => {
    const { dungeonDisplay, dungeon, redraw, cellSize } = props;

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

    return <div className="menu menu--regionSize">
        <button className="menu__button menu__button--back" onClick={props.goBack}>Go back</button>
        
        <div className="menu__section">
            Left click on a region to increase its size. Right click to decrease its size.
        </div>
    </div>
}
