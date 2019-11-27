import * as React from 'react';
import { FunctionComponent, useState, useEffect } from 'react';
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

    const [dungeon, setDungeon] = useState<Dungeon>(new Dungeon());
    const [generating, setGenerating] = useState(false);

    const cellSize = 10;

    const [generationSettings, setGenerationSettings] = useState<IGenerationSettings>({
        seed: 0,
        generateFrom: GenerationSteps.FIRST_STEP,
        generateTo: GenerationSteps.Render,
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

    const generate = async (generateTo: GenerationSteps) => {
        const settings = {
            ...generationSettings,
            seed: Math.random(),
            animateFrom: GenerationSteps.Render,
            generateFrom: GenerationSteps.FIRST_STEP,
            generateTo,
        };

        setGenerationSettings(settings);
        setGenerating(true);

        const dungeon = await generateDungeon(settings);

        setDungeon(dungeon);
        setGenerating(false);
    }

    const regenerate = async (animate: boolean, regenerateFrom: GenerationSteps, generateTo: GenerationSteps) => {
        const settings = {
            ...generationSettings,
            animateFrom: animate
                ? regenerateFrom
                : GenerationSteps.Render,
            generateFrom: regenerateFrom,
            generateTo,
        };

        
        setGenerating(true);

        await regenerateDungeon(dungeon!, settings);

        setGenerationSettings({
            ...settings,
            animateFrom: GenerationSteps.Render,
        });

        setDungeon(dungeon);
        setGenerating(false);
    }

    const skip = () => generationSettings.animateFrom++;
    const finish = () => generationSettings.animateFrom = GenerationSteps.Render;

    useEffect(() => { generate(GenerationSteps.Render) }, []); // eslint-disable-line

    const redrawDungeon = (step: GenerationSteps) => {
        if (canvas.current === null) {
            return;
        }

        // TODO: this doesn't seem to do anything
        renderDungeon(dungeon, canvas.current.ctx!, determineRenderSettings(step, true, cellSize));
    }

    return (    
        <Router>
            <div className="App">
                <Menu
                    dungeon={dungeon}
                    canvas={canvas.current === null ? undefined : canvas.current.canvas}
                    cellSize={cellSize}
                    redraw={redrawDungeon}
                    isGenerating={generating}
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