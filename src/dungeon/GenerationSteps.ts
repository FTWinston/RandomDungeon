export enum GenerationSteps {
    CreateTiles,
    CreateNodes,
    AssociateTiles,
    LinkNodes,
    FilterLinks,
    ExpandLines,
    CreateRooms,
    DetectWalls,
    CurveWalls,
    FillBackdrop,
    Render,


    FIRST_STEP = CreateTiles,
}

export const allSteps = [
    GenerationSteps.CreateTiles,
    GenerationSteps.CreateNodes,
    GenerationSteps.AssociateTiles,
    GenerationSteps.LinkNodes,
    GenerationSteps.FilterLinks,
    GenerationSteps.ExpandLines,
    GenerationSteps.CreateRooms,
    GenerationSteps.DetectWalls,
    GenerationSteps.CurveWalls,
    GenerationSteps.FillBackdrop,
    GenerationSteps.Render,
];