import * as React from 'react';
import { Canvas } from './generic/Canvas';
import { Dungeon } from './Dungeon';
import './App.css';

interface State {
  dungeon?: Dungeon;
}

class App extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {};
  }

  display: Canvas;

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className="menu">
            <label>Size
              <input type="range" id="numSteps" value="8" min="5" max="30" />
            </label>
            
            <label>Insert chance
              <input type="range" id="chanceInsert" value="30" min="0" max="100" />
            </label>

            <label>Join chance
              <input type="range" id="chanceJoin" value="45" min="0" max="100" />
            </label>

            <label>Append chance
              <input type="range" id="chanceAppend" value="50" min="0" max="100" />
            </label>

            <label>Branch chance
              <input type="range" id="chanceBranch" value="30" min="0" max="100" />
            </label>

            <label>Room variation
              <input type="range" id="weightVariation" value="40" min="0" max="100" />
            </label>
            <input type="button" onClick={() => this.createDungeon(true)} value="Generate slowly" />
            <input type="button" onClick={() => this.createDungeon(false)} value="Generate quickly" />
          </div>
        </div>
        <Canvas ref={d => this.display = d === null ? this.display : d} />
      </div>
    );
  }

  private createDungeon(animate: boolean) {
    if (this.state.dungeon !== undefined) {
      this.state.dungeon.destroy();
    }
    
    let getInfo = () => { return {
      ctx: this.display.ctx,
      width: this.display.state.width,
      height: this.display.state.height,
    }};

    this.setState({
      dungeon: new Dungeon(animate, getInfo),
    });
  }
}

export default App;