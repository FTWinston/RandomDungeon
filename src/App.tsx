import * as React from 'react';
import { Dungeon } from './Dungeon';
import './App.css';

class App extends React.Component {
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
            <input type="button" onClick={() => createDungeon(true)} value="Generate slowly" />
            <input type="button" onClick={() => createDungeon(false)} value="Generate quickly" />
          </div>
        </div>
        <div id="mapRoot"></div>
      </div>
    );
  }
}

var dungeon: Dungeon | null = null;
function createDungeon(animated: boolean) {
	if (dungeon != null)
		dungeon.destroy();
		
	dungeon = new Dungeon(document.getElementById('mapRoot') as HTMLElement, animated);
}

export default App;