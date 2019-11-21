import * as React from 'react';
import { Menu, NumericProperty } from './Menu';
import { FixedCanvas } from './Canvas';
import { Dungeon } from '../dungeon/model/Dungeon';
import './App.css';
import { renderDungeon } from '../dungeon/renderDungeon';
import { generateDungeon, regenerateDungeon } from '../dungeon/generateDungeon';
import { GenerationSteps } from '../dungeon/GenerationSteps';
import { determineRenderSettings } from '../dungeon/IRenderSettings';
import { IGenerationSettings } from '../dungeon/IGenerationSettings';

interface State {
    dungeon?: Dungeon;
    cellSize: number;
    settings: IGenerationSettings;
    generating: boolean;
    preserveSeed: boolean;
}

class App extends React.Component<{}, State> {
    private canvas: FixedCanvas;

    constructor(props: {}) {
        super(props);

        this.state = {
            cellSize: 10,
            generating: true,
            preserveSeed: false,
            settings: {
                seed: 0,
                generateFrom: GenerationSteps.CreateNodes,
                animateFrom: GenerationSteps.Render,
                cellsWide: 100,
                cellsHigh: 70,
                nodeCount: 25,
                connectivity: 50,
                redraw: (dungeon: Dungeon, stage: GenerationSteps, stageComplete: boolean) => { 
                    if (this.canvas !== undefined) {
                        renderDungeon(dungeon, this.canvas.ctx, this.state.cellSize, determineRenderSettings(stage, stageComplete))
                    }   
                },
            }
        };
    }

    render() {
        const setNumber = (prop: NumericProperty, val: number) => this.setParameter(prop, val)
        const generate = (animate: boolean) => this.createDungeon(animate);
        const skip = () => this.state.settings.animateFrom++;
        const finish = () => this.state.settings.animateFrom = GenerationSteps.Render;

        const setSeed = (val: number) => { this.state.settings.seed = val; this.setState({}); };
        const setPreserveSeed = (val: boolean) => this.setState({ preserveSeed: val });

        return (
            <div className="App">
                <Menu
                    disabled={this.state.generating}
                    cellsWide={this.state.settings.cellsWide}
                    cellsHigh={this.state.settings.cellsHigh}
                    cellSize={this.state.cellSize}
                    nodeCount={this.state.settings.nodeCount}
                    connectivity={this.state.settings.connectivity}
                    setNumber={setNumber}

                    seed={this.state.settings.seed === 0 ? undefined : this.state.settings.seed}
                    preserveSeed={this.state.preserveSeed}
                    setSeed={setSeed}
                    setPreserveSeed={setPreserveSeed}

                    generate={generate}
                    skip={skip}
                    finish={finish}
                />
                <FixedCanvas
                    className="dungeonDisplay"
                    width={this.state.cellSize * this.state.settings.cellsWide}
                    height={this.state.cellSize * this.state.settings.cellsHigh}
                    ref={c => this.canvas = c === null ? this.canvas : c}
                />
            </div>
        );
    }

    componentDidMount() {
        this.createDungeon(false);
    }

    componentDidUpdate(prevProps: {}, prevState: State) {
        const dungeon = this.state.dungeon;
        if (dungeon === undefined) {
            return;
        }

        let regenerateFrom;
        if (prevState.settings.cellsWide !== this.state.settings.cellsWide) {
            regenerateFrom = GenerationSteps.CreateNodes;
        }

        if (prevState.settings.cellsHigh !== this.state.settings.cellsHigh) {
            regenerateFrom = GenerationSteps.CreateNodes;
        }

        if (prevState.cellSize !== this.state.cellSize) {
            regenerateFrom = GenerationSteps.Render;
        }

        if (prevState.settings.nodeCount !== this.state.settings.nodeCount) {
            regenerateFrom = GenerationSteps.CreateNodes;
        }

        if (prevState.settings.connectivity !== this.state.settings.connectivity) {
            regenerateFrom = GenerationSteps.FilterLinks;
        }

        if (regenerateFrom !== undefined) {
            this.updateDungeon(regenerateFrom);
        }
    }

    private async updateDungeon(regenerateFrom: GenerationSteps) {
        const settings: IGenerationSettings = {
            ...this.state.settings,
            animateFrom: GenerationSteps.Render,
            generateFrom: regenerateFrom,
        };

        this.setState({
            generating: true,
        });

        await regenerateDungeon(this.state.dungeon!, settings);

        this.setState({
            generating: false,
        });
    }

    private setParameter(property: NumericProperty, value: number) {
        switch (property) {
            case NumericProperty.CellsWide:
                this.setState({
                    settings: {
                        ...this.state.settings,
                        cellsWide: value,
                    },
                });
                break;
            case NumericProperty.CellsHigh:
                this.setState({
                    settings: {
                        ...this.state.settings,
                        cellsHigh: value,
                    },
                });
                break;
            case NumericProperty.CellSize:
                this.setState({
                    cellSize: value,
                });
                break;
            case NumericProperty.NodeCount:
                this.setState({
                    settings: {
                        ...this.state.settings,
                        nodeCount: value,
                    },
                });
                break;
            case NumericProperty.Connectivity:
                this.setState({
                    settings: {
                        ...this.state.settings,
                        connectivity: value,
                    },
                });
                break;
            default:
                break;
        }
    }

    private async createDungeon(animate: boolean) {
        const animateFrom = animate
            ? GenerationSteps.CreateNodes
            : GenerationSteps.Render;

        const seed = this.state.preserveSeed
            ? this.state.settings.seed
            : Math.random();

        const settings: IGenerationSettings = {
            ...this.state.settings,
            animateFrom,
            generateFrom: GenerationSteps.CreateNodes,
            seed,
        };

        this.state.settings.animateFrom = GenerationSteps.Render;

        this.setState({
            settings,
            dungeon: undefined,
            generating: true,
        });

        const dungeon = await generateDungeon(settings);

        this.setState({
            dungeon,
            generating: false,
        });
    }
}

export default App;