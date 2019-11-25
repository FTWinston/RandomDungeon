import * as React from 'react';
import { FunctionComponent } from 'react';

enum NumericProperty {
    CellsWide,
    CellsHigh,
    CellSize,
    NodeCount,
    Connectivity,
}

interface Props {
    disabled: boolean;

    cellsWide: number;
    cellsHigh: number;
    cellSize: number;
    nodeCount: number;
    connectivity: number;

    seed?: number;
    preserveSeed: boolean;
    setSeed: (val: number) => void;
    setPreserveSeed: (val: boolean) => void;

    setNumber: (property: NumericProperty, value: number) => void;
    generate: (animate: boolean) => void;
    skip: () => void;
    finish: () => void;
}

export const GenerateMenu: FunctionComponent<Props> = props => {
    const width = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.CellsWide, parseInt(e.target.value, 10));
    const height = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.CellsHigh, parseInt(e.target.value, 10));
    const scale = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.CellSize, parseInt(e.target.value, 10));
    const nodes = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.NodeCount, parseInt(e.target.value, 10));
    const connectivity = (e: React.ChangeEvent<HTMLInputElement>) => props.setNumber(NumericProperty.Connectivity, parseInt(e.target.value, 10));
    
    const slow =  () => props.generate(true);
    const quick = () => props.generate(false);

    const button1 = props.disabled
        ? (
            <input
                type="button"
                onClick={props.skip}
                value="Skip step"
            />
        )
        : (
            <input
                type="button"
                onClick={slow}
                value="Generate slowly"
            />    
        );

    const button2 = props.disabled
        ? (
            <input
                type="button"
                onClick={props.finish}
                value="Finish!"
            />
        )
        : (
            <input
                type="button"
                onClick={quick}
                value="Generate quickly"
            />
        );

    const changeSeed = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value !== '') {
            props.setSeed(e.currentTarget.valueAsNumber);
        }
    };

    const changePreserve = (e: React.ChangeEvent<HTMLInputElement>) => {
        props.setPreserveSeed(e.target.checked);
    };

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

            {button1}
            {button2}
            
            <input type="number" value={props.seed} placeholder="Seed" onChange={changeSeed} />
            <label>
                <input type="checkbox" checked={props.preserveSeed} onChange={changePreserve} />
                Preserve seed
            </label>
        </div>
    );
}
