import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { Room, RoomType } from '../../dungeon/model/Room';

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

        const listener = (e: MouseEvent) => {
            const cellX = e.offsetX / cellSize;
            const cellY = e.offsetY / cellSize;

            if (e.button === 0) {
                // add new node
                dungeon.nodes.push(new Room(dungeon, cellX, cellY, RoomType.Artificial));
            }
            else {
                e.preventDefault(); // TODO: this is never called

                // remove associated node
                const cell = getTileAt(dungeon, cellX, cellY);
                if (cell === undefined || cell.room === undefined) {
                    return;
                }

                const node = cell.room;
                dungeon.nodes = dungeon.nodes.filter(n => n !== node);
            }

            // TODO: need to regenerate this step
            redraw();
        };

        dungeonDisplay.addEventListener('click', listener);
        return () => dungeonDisplay.removeEventListener('click', listener);
    }, [dungeonDisplay, dungeon, redraw, cellSize])

    return <div className="menu menu--regionPlacement">
        {prev}
        {next}

        <div className="menu__section">
            Click the map to place region nodes. It will automatically calculate the region each cell belongs to. Right click to remove a region.
        </div>
    </div>
}

function getTileAt(dungeon: Dungeon, x: number, y: number) {
    const col = dungeon.tilesByCoordinates[Math.floor(x)];

    if (col === undefined) {
        return;
    }

    return col[Math.floor(y)];
}