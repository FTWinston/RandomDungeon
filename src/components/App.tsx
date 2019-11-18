import * as React from 'react';
import { Menu, NumericProperty } from './Menu';
import { FixedCanvas } from './Canvas';
import { Dungeon } from '../dungeon/model/Dungeon';
import './App.css';
import { DungeonDrawer } from '../dungeon/DungeonDrawer';
import { DungeonGenerator } from '../dungeon/DungeonGenerator';
import { GenerationSteps } from '../dungeon/GenerationSteps';

interface State {
    dungeon?: Dungeon;
    animateFrom: GenerationSteps;

    cellsWide: number;
    cellsHigh: number;
    cellSize: number;
    nodeCount: number;
    connectivity: number;
}

class App extends React.Component<{}, State> {
    private canvas: FixedCanvas;
    private drawer: DungeonDrawer;
    private generator: DungeonGenerator;

    constructor(props: {}) {
        super(props);

        this.state = {
            animateFrom: GenerationSteps.Render,
            cellsWide: 100,
            cellsHigh: 70,
            cellSize: 10,
            nodeCount: 25,
            connectivity: 50,
        };
    }

    render() {
        const setNumber = (p: NumericProperty, v: number) => this.setParameter(p, v)
        const generate = (a: boolean) => this.createDungeon(a);

        return (
            <div className="App">
                <Menu
                    disabled={this.state.animateFrom !== GenerationSteps.Render}
                    cellsWide={this.state.cellsWide}
                    cellsHigh={this.state.cellsHigh}
                    cellSize={this.state.cellSize}
                    nodeCount={this.state.nodeCount}
                    connectivity={this.state.connectivity}
                    setNumber={setNumber}

                    seed={this.state.dungeon === undefined ? undefined : this.state.dungeon.seed}
                    generate={generate}
                />
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
        this.drawer = new DungeonDrawer(this.canvas.ctx, this.state.cellSize);

        const redraw = () => this.drawer.redraw();

        const stepReached = (
            step: GenerationSteps,
            startOfStep: boolean
        ) => this.drawer.setAnimationStage(step, startOfStep);

        this.generator = new DungeonGenerator(this.state.animateFrom, stepReached, redraw);
        
        this.createDungeon(false);
    }

    componentDidUpdate(prevProps: {}, prevState: State) {
        const dungeon = this.state.dungeon;
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
            this.drawer.scale = this.state.cellSize;
            regenerateFrom = GenerationSteps.Render;
        }

        if (prevState.animateFrom !== this.state.animateFrom) {
            this.generator.animateFrom = this.state.animateFrom;
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
            this.generator.generate(dungeon, regenerateFrom);
        }
    }

    private setParameter(property: NumericProperty, value: number) {
        switch (property) {
            case NumericProperty.CellsWide:
                this.setState({
                    cellsWide: value,
                });
                break;
            case NumericProperty.CellsHigh:
                this.setState({
                    cellsHigh: value,
                });
                break;
            case NumericProperty.CellSize:
                this.setState({
                    cellSize: value,
                });
                break;
            case NumericProperty.NodeCount:
                this.setState({
                    nodeCount: value,
                });
                break;
            case NumericProperty.Connectivity:
                this.setState({
                    connectivity: value,
                });
                break;
            default:
                break;
        }
    }

    private async createDungeon(animate: boolean) {
        this.generator.animateFrom = animate
            ? GenerationSteps.CreateNodes
            : GenerationSteps.Render;

        this.drawer.scale = this.state.cellSize;

        const dungeon = new Dungeon(
            this.state.nodeCount,
            this.state.cellsWide,
            this.state.cellsHigh,
            this.state.connectivity
        );

        this.drawer.dungeon = dungeon;

        this.setState({
            dungeon: dungeon,
            animateFrom: this.generator.animateFrom,
        });

        await this.generator.generate(dungeon);
        
        this.setState({
            animateFrom: this.generator.animateFrom,
        });
    }
}

export default App;