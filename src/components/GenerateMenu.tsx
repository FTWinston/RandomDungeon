import * as React from 'react';
import { NumericProperty } from './Menu';
import { FunctionComponent } from 'react';

interface Props {
    disabled: boolean;

    cellsWide: number;
    cellsHigh: number;
    cellSize: number;
    nodeCount: number;
    connectivity: number;
    seed?: number;

    setNumber: (property: NumericProperty, value: number) => void;
    generate: (animate: boolean) => void;
    finish: () => void;
}

export const GenerateMenu: FunctionComponent<Props> = props => {
    const width = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.CellsWide, parseInt(e.target.value, 10));
    const height = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.CellsHigh, parseInt(e.target.value, 10));
    const scale = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.CellSize, parseInt(e.target.value, 10));
    const nodes = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.NodeCount, parseInt(e.target.value, 10));
    const connectivity = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.Connectivity, parseInt(e.target.value, 10));

    const slow = () => props.generate(true);
    const quick = () => props.generate(false);

    return (
        <div className="menu__subMenu">
            <label>Width
                <input
                    type="range"
                    min="20"
                    max="200"
                    value={props.cellsWide}
                    onChange={width}
                    disabled={props.disabled}
                />
            </label>

            <label>Height
                <input
                    type="range"
                    min="20"
                    max="200"
                    value={props.cellsHigh}
                    onChange={height}
                    disabled={props.disabled}
                />
            </label>

            <label>Scale
                <input
                    type="range"
                    min="2"
                    max="50"
                    value={props.cellSize}
                    onChange={scale}
                    disabled={props.disabled}
                />
            </label>

            <label>Node count
                <input
                    type="range"
                    min="2"
                    max="100"
                    value={props.nodeCount}
                    onChange={nodes}
                    disabled={props.disabled}
                />
            </label>

            <label>Connectivity
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={props.connectivity}
                    onChange={connectivity}
                    disabled={props.disabled}
                />
            </label>

            <input
                type="button"
                onClick={slow}
                value="Generate slowly"
                disabled={props.disabled}
            />
            <input
                type="button"
                onClick={quick}
                value="Generate quickly"
                disabled={props.disabled}
            />
            <input
                type="button"
                onClick={props.finish}
                value="Finish!"
                disabled={!props.disabled}
            />
        </div>
    );
}
