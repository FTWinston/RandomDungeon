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
