import { GenerationSteps } from './GenerationSteps';

export interface IRenderSettings {
    nodeAlpha: number;
    regionAlpha: number;
    drawGraph: boolean;
    drawNodeLinks: boolean;
    drawGrid: boolean;
    drawWalls: boolean;
    highlightWallCurves: boolean;
    drawOutsidePoints: boolean;
    drawOutside: boolean;
    backgroundColor: string;
    floorColor: string;
    floorGridColor: string;
    floorGridWidth: number;
    wallColor: string;
    hatchingColor: string;
    cellSize: number,
    wallWidth: number,
    hatchingWidth: number,
}

export function determineRenderSettings(   
    generationStage = GenerationSteps.Render,
    stageComplete: boolean = true,
    cellSize: number,
): IRenderSettings {
    let nodeAlpha = 0;
    let regionAlpha = 0;
    let drawGraph = false;
    let drawNodeLinks = false;
    let drawGrid = false;
    let drawWalls = false;
    let highlightWallCurves = false;
    let drawOutside = false;
    let drawOutsidePoints = false;

    switch (generationStage) {
        case GenerationSteps.CreateTiles:
            drawGrid = true;
            break;
        case GenerationSteps.CreateNodes:
            nodeAlpha = 1;
            drawGrid = true;
            break;

        case GenerationSteps.AssociateTiles:
            nodeAlpha = 1;
            regionAlpha = 0.66;
            drawGrid = true;
            break;

        case GenerationSteps.LinkNodes:
            nodeAlpha = 1;
            regionAlpha = 0.33;
            drawGraph = true;
            drawGrid = true;
            break;

        case GenerationSteps.FilterLinks:
            nodeAlpha = 0.75;
            regionAlpha = 0.25;
            drawNodeLinks = true;
            drawGrid = true;
            break;

        case GenerationSteps.ExpandLines:
            regionAlpha = 0.25;
            drawGrid = true;
            break;

        case GenerationSteps.CreateRooms:
            regionAlpha = 0.25;
            drawGrid = true;
            break;

        case GenerationSteps.DetectWalls:
            drawGrid = true;
            break;

        case GenerationSteps.CurveWalls:
            drawGrid = true;
            drawWalls = true;

            highlightWallCurves = !stageComplete;
            break;

        case GenerationSteps.FillBackdrop:
            drawGrid = true;
            drawWalls = true;
            drawOutsidePoints = true;
            break;

        case GenerationSteps.Render:
            drawGrid = true;
            drawWalls = true;
            drawOutside = true;
            break;
    }

    return {
        nodeAlpha,
        regionAlpha,
        drawGraph,
        drawNodeLinks,
        drawGrid,
        drawWalls,
        highlightWallCurves,
        drawOutsidePoints,
        drawOutside,
        floorColor: '#fff',
        floorGridColor: 'rgba(192,192,192,0.5)',
        backgroundColor: '#fff',
        hatchingColor: '#000',
        wallColor: '#000',
        cellSize,
        wallWidth: cellSize,
        floorGridWidth: 1,
        hatchingWidth: cellSize * 0.175,
    }
}