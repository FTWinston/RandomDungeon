import * as React from 'react';
import { FunctionComponent, useState, useEffect } from 'react';
import { Menu } from './menu/Menu';
import { FixedCanvas } from './Canvas';
import { Dungeon } from '../dungeon/model/Dungeon';
import './App.css';
import { renderDungeon } from '../dungeon/renderDungeon';
import { generateDungeon, regenerateDungeon } from '../dungeon/generateDungeon';
import { GenerationSteps, allSteps } from '../dungeon/GenerationSteps';
import { determineRenderSettings, IRenderSettings } from '../dungeon/IRenderSettings';
import { IGenerationSettings } from '../dungeon/IGenerationSettings';

export const App: FunctionComponent = () => {
    const canvas = React.useRef<FixedCanvas>(null);

    const [dungeon, setDungeon] = useState<Dungeon>(new Dungeon());
    const [generating, setGenerating] = useState(false);

    const cellSize = 10;

    const [renderSettings, setRenderSettings] = useState<IRenderSettings>(determineRenderSettings(GenerationSteps.Render, true, cellSize));
    
    const [generationSettings, setGenerationSettings] = useState<IGenerationSettings>({
        seed: 0,
        steps: allSteps,
        animateSteps: [],
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
        const settings: IGenerationSettings = {
            ...generationSettings,
            seed: Math.random(),
            steps: allSteps,
            animateSteps: [],
        };

        setGenerationSettings(settings);
        setGenerating(true);

        const dungeon = await generateDungeon(settings);

        setDungeon(dungeon);
        setGenerating(false);

        if (canvas.current !== null) {
            renderDungeon(dungeon, canvas.current.ctx!, renderSettings);
        }
    }

    const regenerate = async (animate: boolean, steps: GenerationSteps[]) => {
        setGenerating(true);

        await regenerateDungeon(dungeon, {
            ...generationSettings,
            steps,
            animateSteps: animate ? steps.slice() : [],
        });

        setGenerating(false);

        if (canvas.current !== null) {
            renderDungeon(dungeon, canvas.current.ctx!, renderSettings);
        }
    }

    const skip = () => generationSettings.animateSteps.splice(0, 1); // TODO: these weren't working
    const finish = () => generationSettings.animateSteps = [];

    useEffect(() => { generate(); }, []); // eslint-disable-line

    const setRenderSettingsAndRender = (renderSettings: IRenderSettings) => {
        setRenderSettings(renderSettings);

        if (canvas.current !== null) {
            renderDungeon(dungeon, canvas.current.ctx!, renderSettings);
        }
    }

    return (    
        <div className="App">
            <Menu
                dungeon={dungeon}
                canvas={canvas.current === null ? undefined : canvas.current.canvas}
                cellSize={cellSize}
                isGenerating={generating}
                generationSettings={generationSettings}
                setGenerationSettings={setGenerationSettings}
                setRenderSettings={setRenderSettingsAndRender}
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
    );
}