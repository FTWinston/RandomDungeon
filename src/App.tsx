import * as React from 'react';
import { FixedCanvas } from './generic/Canvas';
import { Dungeon, GenerationSteps } from './Dungeon';
import './App.css';

interface State {
    dungeon?: Dungeon;
    animating: boolean;

    cellsWide: number;
    cellsHigh: number;
    cellSize: number;
    nodeCount: number;
    connectivity: number;
}

class App extends React.Component<{}, State> {
    private canvas: FixedCanvas;

    constructor(props: {}) {
        super(props);

        this.state = {
            animating: false,
            cellsWide: 50,
            cellsHigh: 50,
            cellSize: 10,
            nodeCount: 25,
            connectivity: 50,
        };
    }

    render() {
        return (
            <div className="App">
                <div className="App-header">
                    <div className="menu">
                        <label>Width
                            <input
                                type="range"
                                min="20"
                                max="200"
                                value={this.state.cellsWide}
                                onChange={e => this.setState({ cellsWide: parseInt(e.target.value, 10) })}
                                disabled={this.state.animating}
                            />
                        </label>

                        <label>Height
                            <input
                                type="range"
                                min="20"
                                max="200"
                                value={this.state.cellsHigh}
                                onChange={e => this.setState({ cellsHigh: parseInt(e.target.value, 10) })}
                                disabled={this.state.animating}
                            />
                        </label>

                        <label>Scale
                            <input
                                type="range"
                                min="2"
                                max="50"
                                value={this.state.cellSize}
                                onChange={e => this.setState({ cellSize: parseInt(e.target.value, 10) })}
                                disabled={this.state.animating}
                            />
                        </label>

                        <label>Node count
                            <input
                                type="range"
                                min="2"
                                max="100"
                                value={this.state.nodeCount}
                                onChange={e => this.setState({ nodeCount: parseInt(e.target.value, 10) })}
                                disabled={this.state.animating}
                            />
                        </label>

                        <label>Connectivity
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={this.state.connectivity}
                                onChange={e => this.setState({ connectivity: parseInt(e.target.value, 10) })}
                                disabled={this.state.animating}
                            />
                        </label>

                        <input type="button" onClick={() => this.createDungeon(true)} value="Generate slowly" />
                        <input type="button" onClick={() => this.createDungeon(false)} value="Generate quickly" />
                    </div>
                </div>
                <FixedCanvas
                    className="dungeonDisplay"
                    width={this.state.cellSize * this.state.cellsWide}
                    height={this.state.cellSize * this.state.cellsHigh}
                    ref={c => this.canvas = c === null ? this.canvas : c}
                />
            </div>
        );
    }

    componentDidMount() {
        this.createDungeon(false);
    }

    componentDidUpdate(prevProps: {}, prevState: State) {
        let dungeon = this.state.dungeon;
        if (dungeon === undefined) {
            return;
        }

        let regenerateFrom;
        if (prevState.cellsWide !== this.state.cellsWide) {
            dungeon.width = this.state.cellsWide;
            regenerateFrom = GenerationSteps.CreateNodes;
        }

        if (prevState.cellsHigh !== this.state.cellsHigh) {
            dungeon.height = this.state.cellsHigh;
            regenerateFrom = GenerationSteps.CreateNodes;
        }

        if (prevState.cellSize !== this.state.cellSize) {
            dungeon.scale = this.state.cellSize;
            regenerateFrom = GenerationSteps.Render;
        }

        if (prevState.nodeCount !== this.state.nodeCount) {
            dungeon.nodeCount = this.state.nodeCount;
            regenerateFrom = GenerationSteps.CreateNodes;
        }

        if (prevState.connectivity !== this.state.connectivity) {
            dungeon.connectivity = this.state.connectivity;
            regenerateFrom = GenerationSteps.FilterLinks;
        }

        if (regenerateFrom !== undefined) {
            dungeon.generate(regenerateFrom);
        }
    }

    private async createDungeon(animate: boolean) {
        if (this.state.dungeon !== undefined) {
            this.state.dungeon.destroy();
        }

        let dungeon = new Dungeon(animate, this.canvas.ctx, this.state.nodeCount,
                                  this.state.cellsWide, this.state.cellsHigh, this.state.cellSize,
                                  this.state.connectivity);

        this.setState({
            dungeon: dungeon,
            animating: animate,
        });

        await dungeon.generate();
        
        this.setState({
            animating: false,
        });
    }
}

export default App;