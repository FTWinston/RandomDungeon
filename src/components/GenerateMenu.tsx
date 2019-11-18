import * as React from 'react';
import { NumericProperty } from './Menu';

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
}

interface State {
    
}

export class GenerateMenu extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            
        };
    }

    render() {
        const width = (e: React.ChangeEvent<HTMLInputElement>) => this.props.setNumber(NumericProperty.CellsWide, parseInt(e.target.value, 10));
        const height = (e: React.ChangeEvent<HTMLInputElement>) => this.props.setNumber(NumericProperty.CellsHigh, parseInt(e.target.value, 10));
        const scale = (e: React.ChangeEvent<HTMLInputElement>) => this.props.setNumber(NumericProperty.CellSize, parseInt(e.target.value, 10));
        const nodes = (e: React.ChangeEvent<HTMLInputElement>) => this.props.setNumber(NumericProperty.NodeCount, parseInt(e.target.value, 10));
        const connectivity = (e: React.ChangeEvent<HTMLInputElement>) => this.props.setNumber(NumericProperty.Connectivity, parseInt(e.target.value, 10));

        const slow = () => this.props.generate(true);
        const quick = () => this.props.generate(false);

        return (
            <div className="menu__subMenu">
                <label>Width
                    <input
                        type="range"
                        min="20"
                        max="200"
                        value={this.props.cellsWide}
                        onChange={width}
                        disabled={this.props.disabled}
                    />
                </label>

                <label>Height
                    <input
                        type="range"
                        min="20"
                        max="200"
                        value={this.props.cellsHigh}
                        onChange={height}
                        disabled={this.props.disabled}
                    />
                </label>

                <label>Scale
                    <input
                        type="range"
                        min="2"
                        max="50"
                        value={this.props.cellSize}
                        onChange={scale}
                        disabled={this.props.disabled}
                    />
                </label>

                <label>Node count
                    <input
                        type="range"
                        min="2"
                        max="100"
                        value={this.props.nodeCount}
                        onChange={nodes}
                        disabled={this.props.disabled}
                    />
                </label>

                <label>Connectivity
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={this.props.connectivity}
                        onChange={connectivity}
                        disabled={this.props.disabled}
                    />
                </label>

                <input
                    type="button"
                    onClick={slow}
                    value="Generate slowly"
                    disabled={this.props.disabled}
                />
                <input
                    type="button"
                    onClick={quick}
                    value="Generate quickly"
                    disabled={this.props.disabled}
                />
            </div>
        );
    }
}
