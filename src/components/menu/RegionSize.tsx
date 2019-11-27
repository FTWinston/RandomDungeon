import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dungeon } from '../../dungeon/model/Dungeon';

interface Props {
    prev?: string;
    next?: string;
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    redraw: () => void;
}

export const RegionSize: FunctionComponent<Props> = props => {
    const prev = props.prev === undefined
        ? undefined
        : <Link to={props.prev}>previous step</Link>

    const next = props.next === undefined
        ? undefined
        : <Link to={props.next}>next step</Link>

        const { dungeonDisplay, dungeon, redraw, cellSize } = props;
    
        useEffect(() => {
            if (dungeonDisplay === undefined) {
                return;
            }
    
            const leftClick = (e: MouseEvent) => {
                const cellX = e.offsetX / cellSize;
                const cellY = e.offsetY / cellSize;

                const cell = dungeon.getTileAt(cellX, cellY);
                if (cell === undefined || cell.room === null) {
                    return;
                }

                cell.room.regionInfluence *= 1.2;
                redraw();
            };
    
            const rightClick = (e: MouseEvent) => {
                const cellX = e.offsetX / cellSize;
                const cellY = e.offsetY / cellSize;
    
                e.preventDefault();

                const cell = dungeon.getTileAt(cellX, cellY);
                if (cell === undefined || cell.room === null) {
                    return;
                }

                cell.room.regionInfluence /= 1.2;
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
        {prev}
        {next}
        
        <div className="menu__section">
            Left click on a region to increase its size. Right click to decrease its size.
        </div>
    </div>
}
