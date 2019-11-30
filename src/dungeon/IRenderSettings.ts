import { GenerationSteps } from './GenerationSteps';

export interface IRenderSettings {
    nodeAlpha: number;
    regionAlpha: number;
    graphAlpha: number;
    drawNodeLinks: boolean;
    drawGrid: boolean;
    drawWalls: boolean;
    highlightWallCurves: boolean;
    drawOutsidePoints: boolean;
    drawOutside: boolean;
    backgroundColor: string;
    linkColor: string;
    linkWidth: number;
    floorColor: string;
    floorGridColor: string;
    floorGridWidth: number;
    wallColor: string;
    hatchingColor: string;
    cellSize: number,
    wallWidth: number,
    hatchingWidth: number,
    drawWallsAsFloor: boolean,
    minimumSpanningWidth: number,
    relativeNeighbourhoodWidth: number,
    gabrielWidth: number,
    delauneyWidth: number,
}

export function determineRenderSettings(   
    generationStage = GenerationSteps.Render,
    stageComplete: boolean = true,
    cellSize: number,
): IRenderSettings {
    let nodeAlpha = 0;
    let regionAlpha = 0;
    let graphAlpha = 0;
    let drawNodeLinks = false;
    let drawGrid = false;
    let drawWalls = false;
    let highlightWallCurves = false;
    let drawOutside = false;
    let drawOutsidePoints = false;
    let drawWallsAsFloor = true;

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
            regionAlpha = 0.5;
            graphAlpha = 0.25;
            drawGrid = true;
            break;

        case GenerationSteps.FilterLinks:
            nodeAlpha = 0.75;
            regionAlpha = 0.55;
            drawNodeLinks = true;
            drawGrid = true;
            break;

        case GenerationSteps.ExpandLines:
            regionAlpha = 0.5;
            drawGrid = true;
            break;

        case GenerationSteps.CreateRooms:
            regionAlpha = 0.5;
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
        graphAlpha,
        drawNodeLinks,
        drawGrid,
        drawWalls,
        highlightWallCurves,
        drawOutsidePoints,
        drawOutside,
        floorColor: '#fff',
        floorGridColor: 'rgba(192,192,192,0.5)',
        linkColor: '#000',
        linkWidth: 1,
        backgroundColor: '#fff',
        hatchingColor: '#000',
        wallColor: '#000',
        cellSize,
        wallWidth: cellSize,
        floorGridWidth: 1,
        hatchingWidth: cellSize * 0.175,
        drawWallsAsFloor,
        minimumSpanningWidth: cellSize,
        relativeNeighbourhoodWidth: cellSize * 0.5,
        gabrielWidth: cellSize * 0.25,
        delauneyWidth: 1,
    };
}