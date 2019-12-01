import * as React from 'react';
import { FunctionComponent, useEffect } from 'react';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { IRenderSettings, determineRenderSettings } from '../../dungeon/IRenderSettings';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { Pathway } from '../../dungeon/model/Pathway';
import { getTouchedTiles } from '../../dungeon/generation/linkLinesToGrid';
import { Tile } from '../../dungeon/model/Tile';

interface Props {
    dungeon: Dungeon;
    dungeonDisplay?: HTMLElement;
    cellSize: number;
    setRenderSettings: (settings: IRenderSettings) => void;
    redraw: () => void;
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

    const linesByTile = getLinesByTile(dungeon); // I tried to memoise this, but it didn't work

    // add/remove effect
    useEffect(() => {
        if (dungeonDisplay === undefined) {
            return;
        }

        const leftClick = (e: MouseEvent) => {
            const cellX = e.offsetX / cellSize;
            const cellY = e.offsetY / cellSize;

            const cell = dungeon.getTileAt(cellX, cellY);
            if (cell === undefined) {
                return;
            }

            const line = linesByTile.get(cell);
            if (line === undefined) {
                return;
            }

            // add or remove this line
            const index = dungeon.lines.indexOf(line);
            if (index !== -1) {
                dungeon.lines = [
                    ...dungeon.lines.slice(0, index),
                    ...dungeon.lines.slice(index + 1),
                ];
            }
            else {
                dungeon.lines = [
                    ...dungeon.lines,
                    line
                ];
            }
            redraw();
        };

        dungeonDisplay.addEventListener('click', leftClick);

        return () => {
            dungeonDisplay.removeEventListener('click', leftClick);
        };
    }, [dungeonDisplay, dungeon, dungeon.lines, linesByTile, redraw, cellSize]);

    return <div className="menu__section">
        Left click the map to toggle a pathway on / off.
    </div>
}

function getLinesByTile(dungeon: Dungeon) {
    const allLines = new Map<Tile, Pathway[]>();
    for (const line of dungeon.delauneyLines) {
        const tiles = getTouchedTiles(line, dungeon);
        for (const tile of tiles) {
            let tileLines = allLines.get(tile);
            if (tileLines === undefined) {
                tileLines = [];
                allLines.set(tile, tileLines);
            }

            tileLines.push(line);
        }
    }

    const singleLineTiles = new Map<Tile, Pathway>();
    for (const [tile, paths] of allLines) {
        if (paths.length === 1) {
            singleLineTiles.set(tile, paths[0]);
        }
    }

    return singleLineTiles;
}