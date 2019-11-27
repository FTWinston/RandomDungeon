import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { Region, RegionType } from '../../dungeon/model/Region';

interface Props {
    prev?: string;
    next?: string;
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    redraw: () => void;
}

export const RegionPlacement: FunctionComponent<Props> = props => {
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

            // add new node
            dungeon.nodes.push(new Region(dungeon, cellX, cellY, RegionType.Artificial));
            redraw();
        };

        const rightClick = (e: MouseEvent) => {
            const cellX = e.offsetX / cellSize;
            const cellY = e.offsetY / cellSize;

            e.preventDefault();

            // remove associated node
            const cell = dungeon.getTileAt(cellX, cellY);
            if (cell === undefined || cell.room === null) {
                return;
            }

            const node = cell.room;
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

    return <div className="menu menu--regionPlacement">
        {prev}
        {next}

        <div className="menu__section">
            Left click the map to place region nodes. Right click to remove a region.
        </div>
    </div>
}