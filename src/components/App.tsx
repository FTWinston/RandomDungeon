import * as React from 'react';
import { FunctionComponent, useState, useEffect } from 'react';
import { Menu } from './menu/Menu';
import { FixedCanvas } from './Canvas';
import { Dungeon } from '../dungeon/model/Dungeon';
import './App.css';
import { renderDungeon } from '../dungeon/renderDungeon';
import { generateDungeon, regenerateDungeon } from '../dungeon/generateDungeon';
import { GenerationSteps } from '../dungeon/GenerationSteps';
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

        if (canvas.current !== null) {
            renderDungeon(dungeon, canvas.current.ctx!, renderSettings);
        }
    }

    const regenerate = async (animate: boolean, regenerateFrom: GenerationSteps, generateTo: GenerationSteps) => {
        // clear the grid if regenerating
        if (regenerateFrom !== GenerationSteps.FIRST_STEP) {
            await regenerateDungeon(dungeon, {
                ...generationSettings,
                animateFrom: GenerationSteps.Render,
                generateFrom: GenerationSteps.CreateTiles,
                generateTo: GenerationSteps.CreateTiles,
            });
        }

        setGenerating(true);

        await regenerateDungeon(dungeon, {
            ...generationSettings,
            animateFrom: animate
                ? regenerateFrom
                : GenerationSteps.Render,
            generateFrom: regenerateFrom,
            generateTo,
        });

        setGenerating(false);

        if (canvas.current !== null) {
            renderDungeon(dungeon, canvas.current.ctx!, renderSettings);
        }
    }

    const skip = () => generationSettings.animateFrom++;
    const finish = () => generationSettings.animateFrom = GenerationSteps.Render;

    useEffect(() => { generate(GenerationSteps.Render) }, []); // eslint-disable-line

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