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
    let nodeAlpha = 1;
    let drawGraph = false;
    let drawNodeLinks = false;
    let drawGrid = false;
    let drawWalls = false;
    let highlightWallCurves = false;
    let fillOutside = false;

    switch (generationStage) {
        case GenerationSteps.CreateNodes:
            break;

        case GenerationSteps.LinkNodes:
            drawGraph = true;
            break;

        case GenerationSteps.FilterLinks:
            drawNodeLinks = true;
            break;

        case GenerationSteps.CreateRooms:
            drawNodeLinks = true;
            drawGrid = true;

            if (stageComplete) {
                nodeAlpha = 0;
            }
            break;
        case GenerationSteps.ExpandLines:
            drawGrid = true;
            nodeAlpha = 0;

            if (!stageComplete) {
                drawNodeLinks = true;
            }
            break;

        case GenerationSteps.DetectWalls:
            drawGrid = true;
            nodeAlpha = 0;
            break;

        case GenerationSteps.CurveWalls:
            drawGrid = true;
            drawWalls = true;
            nodeAlpha = 0;

            highlightWallCurves = !stageComplete;
            break;

        case GenerationSteps.Render:
            drawGrid = true;
            drawWalls = true;
            fillOutside = true;
            drawGrid = true;
            nodeAlpha = 0;
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