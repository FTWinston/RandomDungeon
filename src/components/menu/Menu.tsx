import * as React from 'react';
import './Menu.css';
import { FunctionComponent, useState, useMemo } from 'react';
import { Generate } from './Generate';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { MapSize } from './MapSize';
import { GenerationSteps, allSteps } from '../../dungeon/GenerationSteps';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';
import { Regions } from './Regions';
import { IRenderSettings } from '../../dungeon/IRenderSettings';
import { Connections } from './Connections';

interface Props {
    isGenerating: boolean;
    dungeon: Dungeon;
    canvas?: HTMLCanvasElement;
    cellSize: number;
    generationSettings: Readonly<IGenerationSettings>;
    setGenerationSettings: (settings: IGenerationSettings) => void;
    setRenderSettings: (settings: IRenderSettings) => void;
    generate: () => Promise<void>;
    regenerate: (animate: boolean, steps: GenerationSteps[]) => Promise<void>;
    skip: () => void;
    finish: () => void;
}

enum MenuPage {
    Main,
    Size,
    Regions,
    Connections,
    Renders,
}

export const Menu: FunctionComponent<Props> = props => {
    const [currentPage, setCurrentPage] = useState(MenuPage.Main);

    const switchToMain = useMemo(() => () => setCurrentPage(MenuPage.Main), []);
    const switchToSize = useMemo(() => () => setCurrentPage(MenuPage.Size), []);
    const switchToRegions = useMemo(() => () => setCurrentPage(MenuPage.Regions), []);
    const switchToConnections = useMemo(() => () => setCurrentPage(MenuPage.Connections), []);
    const switchToRenders = useMemo(() => () => setCurrentPage(MenuPage.Renders), []);
    
    const { regenerate } = props;

    const animate = useMemo(() => (() => regenerate(true, [GenerationSteps.CreateTiles, ...allSteps.slice(2)])), [regenerate]);

    switch (currentPage) {
        case MenuPage.Size:
            return (
                <MapSize
                    goBack={switchToMain}
                    dungeon={props.dungeon}
                    generationSettings={props.generationSettings}
                    setGenerationSettings={props.setGenerationSettings}
                    cellSize={props.cellSize}
                    setRenderSettings={props.setRenderSettings}
                    redraw={() => props.regenerate(false, [GenerationSteps.CreateTiles, ...allSteps.slice(2)])} // skip CreateTiles and CreateNodes
                />
            );
        case MenuPage.Regions:
            return (
                <Regions
                    goBack={switchToMain}
                    dungeon={props.dungeon}
                    dungeonDisplay={props.canvas}
                    cellSize={props.cellSize}
                    setRenderSettings={props.setRenderSettings}
                    redraw={() => props.regenerate(false, [GenerationSteps.CreateTiles, ...allSteps.slice(2)])} // skip CreateTiles and CreateNodes
                />
            );
        case MenuPage.Connections:
            return (
                <Connections
                    goBack={switchToMain}
                    dungeon={props.dungeon}
                    dungeonDisplay={props.canvas}
                    cellSize={props.cellSize}
                    setRenderSettings={props.setRenderSettings}
                    redraw={() => props.regenerate(false, [GenerationSteps.CreateTiles, GenerationSteps.AssociateTiles, ...allSteps.slice(5)])} // jump to ExpandLines
                />
            );

        // TODO: other pages

        default:
            return (
                <Generate
                    isGenerating={props.isGenerating}
                    setRenderSettings={props.setRenderSettings}
                    cellSize={props.cellSize}
                    generate={props.generate}
                    animate={animate}
                    skip={props.skip}
                    finish={props.finish}

                    showSize={switchToSize}
                    showRegions={switchToRegions}
                    showConnections={switchToConnections}
                    showRenders={switchToRenders}
                />
            );
    }
};