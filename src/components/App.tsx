import * as React from 'react';
import { FunctionComponent, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Menu } from './menu/Menu';
import { FixedCanvas } from './Canvas';
import { Dungeon } from '../dungeon/model/Dungeon';
import './App.css';
import { renderDungeon } from '../dungeon/renderDungeon';
import { generateDungeon, regenerateDungeon } from '../dungeon/generateDungeon';
import { GenerationSteps } from '../dungeon/GenerationSteps';
import { determineRenderSettings } from '../dungeon/IRenderSettings';
import { IGenerationSettings } from '../dungeon/IGenerationSettings';

export const App: FunctionComponent = () => {
    const canvas = React.useRef<FixedCanvas>(null);

    const [dungeon, setDungeon] = useState<Dungeon>();

    const cellSize = 10;

    const [generationSettings, setGenerationSettings] = useState<IGenerationSettings>({
        seed: 0,
        generateFrom: GenerationSteps.FIRST_STEP,
        animateFrom: GenerationSteps.Render,
        cellsWide: 100,
        cellsHigh: 70,
        nodeCount: 25,
        connectivity: 50,
        redraw: (dungeon: Dungeon, stage: GenerationSteps, stageComplete: boolean) => { 
            if (canvas.current !== null) {
                renderDungeon(dungeon, canvas.current.ctx!, determineRenderSettings(stage, stageComplete, cellSize));
            }
        },
    });

    const generate = async () => {
        const settings = {
            ...generationSettings,
            seed: Math.random(),
            animateFrom: GenerationSteps.Render,
            generateFrom: GenerationSteps.FIRST_STEP,
        };

        setGenerationSettings(settings);
        setDungeon(undefined);

        const dungeon = await generateDungeon(generationSettings);

        setDungeon(dungeon);

        setGenerationSettings({
            ...settings,
            animateFrom: GenerationSteps.Render,
        });
    }

    const regenerate = async (animate: boolean, regenerateFrom: GenerationSteps) => {
        const settings = {
            ...generationSettings,
            animateFrom: animate
                ? regenerateFrom
                : GenerationSteps.Render,
            generateFrom: regenerateFrom,
        };

        setDungeon(undefined);

        await regenerateDungeon(dungeon!, settings);

        setDungeon(dungeon);
    }

    const skip = () => generationSettings.animateFrom++;
    const finish = () => generationSettings.animateFrom = GenerationSteps.Render;

    return (    
        <Router>
            <div className="App">
                <Menu
                    isGenerating={dungeon === undefined}
                    generationSettings={generationSettings}
                    setGenerationSettings={setGenerationSettings}
                    generate={generate}
                    regenerate={regenerate}
                    skip={skip}
                    finish={finish}
                />
                <FixedCanvas
                    className="dungeonDisplay"
                    width={cellSize * generationSettings.cellsWide}
                    height={cellSize * generationSettings.cellsHigh}
                    ref={canvas}
                />
            </div>
        </Router>
    );
}