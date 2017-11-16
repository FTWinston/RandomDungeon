import * as React from 'react';
import { FixedCanvas } from './generic/Canvas';
import { Dungeon } from './Dungeon';
import './App.css';

interface State {
  dungeon?: Dungeon;

  cellsWide: number;
  cellsHigh: number;
  cellSize: number;
  nodeCount: number;
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      cellsWide: 50,
      cellsHigh: 50,
      cellSize: 10,
      nodeCount: 25,
    };
  }

  canvas: FixedCanvas;

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="menu">
            <label>Width
              <input type="range" min="20" max="200" value={this.state.cellsWide} onChange={e => this.setState({ cellsWide: parseInt(e.target.value) })} />
            </label>
            
            <label>Height
              <input type="range" min="20" max="200" value={this.state.cellsHigh} onChange={e => this.setState({ cellsHigh: parseInt(e.target.value) })} />
            </label>
            
            <label>Scale
              <input type="range" min="2" max="50" value={this.state.cellSize} onChange={e => this.setState({ cellSize: parseInt(e.target.value) })} />
            </label>

            <label>Node count
              <input type="range" min="2" max="100" value={this.state.nodeCount} onChange={e => this.setState({ nodeCount: parseInt(e.target.value) })} />
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

    let redraw = false, regenerate = false;
    if (prevState.cellsWide != this.state.cellsWide) {
        dungeon.width = this.state.cellsWide;
        regenerate = true;
    }

    if (prevState.cellsHigh != this.state.cellsHigh) {
        dungeon.height = this.state.cellsHigh;
        regenerate = true;
    }

    if (prevState.cellSize !== this.state.cellSize) {
      dungeon.scale = this.state.cellSize;
      redraw = true;
    }

    if (prevState.nodeCount !== this.state.nodeCount) {
      dungeon.nodeCount = this.state.nodeCount;
      regenerate = true;
    }

    dungeon.ctx = this.canvas.ctx;

    if (regenerate) {
      dungeon.generate();
    }
    else if (redraw) {
      dungeon.redraw();
    }
  }

  private createDungeon(animate: boolean) {
    if (this.state.dungeon !== undefined) {
      this.state.dungeon.destroy();
    }

    let dungeon = new Dungeon(animate, this.canvas.ctx, this.state.nodeCount, this.state.cellsWide, this.state.cellsHigh, this.state.cellSize);

    this.setState({
      dungeon: dungeon,
    });
  }
}

export default App;