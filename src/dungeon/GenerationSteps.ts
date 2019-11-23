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
    Render,


    FIRST_STEP = CreateTiles,
}
