import * as React from 'react';
import { Menu, NumericProperty } from './Menu';
import { FixedCanvas } from './Canvas';
import { Dungeon } from '../model/Dungeon';
import './App.css';
import { DungeonDrawer } from '../drawing/DungeonDrawer';
import { DungeonGenerator } from '../generation/DungeonGenerator';
import { GenerationSteps } from '../generation/GenerationSteps';

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
    private drawer: DungeonDrawer;
    private generator: DungeonGenerator;

    constructor(props: {}) {
        super(props);

        this.state = {
            animating: false,
            cellsWide: 100,
            cellsHigh: 70,
            cellSize: 10,
            nodeCount: 25,
            connectivity: 50,
        };
    }

    render() {
        return (
            <div className="App">
                <Menu
                    disabled={this.state.animating}
                    cellsWide={this.state.cellsWide}
                    cellsHigh={this.state.cellsHigh}
                    cellSize={this.state.cellSize}
                    nodeCount={this.state.nodeCount}
                    connectivity={this.state.connectivity}
                    setNumber={(p, v) => this.setParameter(p, v)}

                    seed={this.state.dungeon === undefined ? undefined : this.state.dungeon.seed}
                    generate={(a) => this.createDungeon(a)}
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

        this.generator = new DungeonGenerator(this.state.animating, stepReached, redraw);
        
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

        if (prevState.animating !== this.state.animating) {
            this.generator.animated = this.state.animating;
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
        this.generator.animated = animate;
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
            animating: animate,
        });

        await this.generator.generate(dungeon);
        
        this.setState({
            animating: false,
        });
    }
}

export default App;