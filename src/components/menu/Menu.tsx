import * as React from 'react';
import './Menu.css';
import { FunctionComponent, useState, useMemo } from 'react';
import { Generate } from './Generate';
import { Dungeon } from '../../dungeon/model/Dungeon';
import { MapSize } from './MapSize';
import { GenerationSteps } from '../../dungeon/GenerationSteps';
import { IGenerationSettings } from '../../dungeon/IGenerationSettings';
import { RegionPlacement } from './RegionPlacement';
import { RegionSize } from './RegionSize';
import { IRenderSettings } from '../../dungeon/IRenderSettings';

interface Props {
    isGenerating: boolean;
    dungeon: Dungeon;
    canvas?: HTMLCanvasElement;
    cellSize: number;
    generationSettings: Readonly<IGenerationSettings>;
    setGenerationSettings: (settings: IGenerationSettings) => void;
    setRenderSettings: (settings: IRenderSettings) => void;
    generate: (generateTo: GenerationSteps) => Promise<void>;
    regenerate: (animate: boolean, generateFrom: GenerationSteps, generateTo: GenerationSteps) => Promise<void>;
    skip: () => void;
    finish: () => void;
}

enum MenuPage {
    Main,
    Size,
    AddRegions,
    ResizeRegions,
    RegionTypes,
    Connections,
    Renders,
}

export const Menu: FunctionComponent<Props> = props => {
    const [currentPage, setCurrentPage] = useState(MenuPage.Main);

    const switchToMain = useMemo(() => () => setCurrentPage(MenuPage.Main), []);
    const switchToSize = useMemo(() => () => setCurrentPage(MenuPage.Size), []);
    const switchToAddRegions = useMemo(() => () => setCurrentPage(MenuPage.AddRegions), []);
    const switchToResizeRegions = useMemo(() => () => setCurrentPage(MenuPage.ResizeRegions), []);
    const switchToRegionTypes = useMemo(() => () => setCurrentPage(MenuPage.RegionTypes), []);
    const switchToConnections = useMemo(() => () => setCurrentPage(MenuPage.Connections), []);
    const switchToRenders = useMemo(() => () => setCurrentPage(MenuPage.Renders), []);

    switch (currentPage) {
        case MenuPage.Size:
            return (
                <MapSize
                    goBack={switchToMain}
                    generationSettings={props.generationSettings}
                    setGenerationSettings={props.setGenerationSettings}
                    cellSize={props.cellSize}
                    setRenderSettings={props.setRenderSettings}
                    redraw={() => props.regenerate(false, GenerationSteps.AssociateTiles, GenerationSteps.Render)}
                />
            );
        case MenuPage.AddRegions:
            return (
                <RegionPlacement
                    goBack={switchToMain}
                    dungeon={props.dungeon}
                    dungeonDisplay={props.canvas}
                    cellSize={props.cellSize}
                    setRenderSettings={props.setRenderSettings}
                    redraw={() => props.regenerate(false, GenerationSteps.AssociateTiles, GenerationSteps.Render)}
                />
            );
        case MenuPage.ResizeRegions:
            return (
                <RegionSize
                    goBack={switchToMain}
                    dungeon={props.dungeon}
                    dungeonDisplay={props.canvas}
                    cellSize={props.cellSize}
                    setRenderSettings={props.setRenderSettings}
                    redraw={() => props.regenerate(false, GenerationSteps.AssociateTiles, GenerationSteps.Render)}
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
                    regenerate={props.regenerate}
                    skip={props.skip}
                    finish={props.finish}

                    showSize={switchToSize}
                    showAddRegions={switchToAddRegions}
                    showResizeRegions={switchToResizeRegions}
                    showRegionTypes={switchToRegionTypes}
                    showConnections={switchToConnections}
                    showRenders={switchToRenders}
                />
            );
    }
};