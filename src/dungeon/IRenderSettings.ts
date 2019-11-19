import { GenerationSteps } from './GenerationSteps';

export interface IRenderSettings {
    nodeAlpha: number,
    drawGraph: boolean,
    drawNodeLinks: boolean,
    drawGrid: boolean,
    drawWalls: boolean,
    highlightWallCurves: boolean,
    fillOutside: boolean,
}

export function determineRenderSettings(   
    generationStage = GenerationSteps.Render,
    stageComplete: boolean = true,
): IRenderSettings {
    let nodeAlpha = 0;
    let drawGraph = false;
    let drawNodeLinks = false;
    let drawGrid = false;
    let drawWalls = false;
    let highlightWallCurves = false;
    let fillOutside = false;

    switch (generationStage) {
        case GenerationSteps.CreateNodes:
            nodeAlpha = 1;
            break;

        case GenerationSteps.LinkNodes:
            nodeAlpha = 1;
            drawGraph = true;
            break;

        case GenerationSteps.FilterLinks:
            nodeAlpha = 1;
            drawNodeLinks = true;
            break;

        case GenerationSteps.CreateRooms:
            drawNodeLinks = true;
            drawGrid = true;

            if (!stageComplete) {
                nodeAlpha = 1;
            }
            break;
        case GenerationSteps.ExpandLines:
            drawGrid = true;

            if (!stageComplete) {
                drawNodeLinks = true;
            }
            break;

        case GenerationSteps.DetectWalls:
            drawGrid = true;
            break;

        case GenerationSteps.CurveWalls:
            drawGrid = true;
            drawWalls = true;

            highlightWallCurves = !stageComplete;
            break;

        case GenerationSteps.Render:
            drawGrid = true;
            drawWalls = true;
            fillOutside = true;
            break;
    }

    return {
        nodeAlpha,
        drawGraph,
        drawNodeLinks,
        drawGrid,
        drawWalls,
        highlightWallCurves,
        fillOutside,
    }
}