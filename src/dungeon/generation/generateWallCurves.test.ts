import { pickBestAdjacentWallTileOrthogonalThenDiagonal, generateSingleWallCurve } from './generateWallCurves';
import { Dungeon } from '../model/Dungeon';
import { Tile } from '../model/Tile';

const startX = 8;
const startY = 3;

it("generates the correct coordinates", () => {
    const dungeon = createDungeon();

    expect(dungeon.tilesByCoordinates[startX][startY].x).toEqual(startX);
    expect(dungeon.tilesByCoordinates[startX][startY].y).toEqual(startY);
})

it("picks the correct subsequent tiles", () => {
    const dungeon = createDungeon();

    let currentCell: Tile | undefined = dungeon.tilesByCoordinates[startX][startY];

    const path: Tile[] = [];

    while (currentCell !== undefined) {
        currentCell.isFloor = true;
        path.push(currentCell);
        currentCell = pickBestAdjacentWallTileOrthogonalThenDiagonal(dungeon, currentCell, t => !t.isFloor && t.isWall);
    }

    expect(path).toEqual(getExpectedRoute(dungeon));
});

it("generates a curve with correct key points", async () => {
    const dungeon = createDungeon();

    const startCell = dungeon.tilesByCoordinates[startX][startY];

    const curve = await generateSingleWallCurve(dungeon, startCell, () => Promise.resolve())
    
    expect(curve.keyPoints).toEqual(getExpectedRoute(dungeon));
});

/* Below is what should be the "test" path, starting at X:
....................
..1.................
..111...............
..1..11.X11.........
..11......1.........
.11.......1.........
..11......1.........
..1.......1111......
..11.........11.....
.11...........1.....
..1...........1.....
..1..........11.....
...1.......111......
...1......1.........
..1.......1.........
..11......1.........
..11.......111......
..1...........1.....
.11............1....
..1...........11....
..1.........11......
..1...1.....1.......
..1..11......111111.
..1..11........1111.
..1..11...1....1....
..11111111111111....
.1..................
....................
*/

function createDungeon() {
    const dungeon = new Dungeon();
    dungeon.width = 20;
    dungeon.height = 27;

    dungeon.tiles = [
        ...createCol(0,  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
        ...createCol(1,  [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        ...createCol(2,  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0]),
        ...createCol(3,  [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
        ...createCol(4,  [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
        ...createCol(5,  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0]),
        ...createCol(6,  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0]),
        ...createCol(7,  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
        ...createCol(8,  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
        ...createCol(9,  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
        ...createCol(10, [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0]),
        ...createCol(11, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0]),
        ...createCol(12, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0]),
        ...createCol(13, [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0]),
        ...createCol(14, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0]),
        ...createCol(15, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0]),
        ...createCol(16, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]),
        ...createCol(17, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]),
        ...createCol(18, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]),
        ...createCol(19, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    ];

    return dungeon;
}

function getExpectedRoute(dungeon: Dungeon) {
    return [
        dungeon.tilesByCoordinates[8][3],
        dungeon.tilesByCoordinates[9][3],
        dungeon.tilesByCoordinates[10][3],
        dungeon.tilesByCoordinates[10][4],
        dungeon.tilesByCoordinates[10][5],
        dungeon.tilesByCoordinates[10][6],
        dungeon.tilesByCoordinates[10][7],
        dungeon.tilesByCoordinates[11][7],
        dungeon.tilesByCoordinates[12][7],
        dungeon.tilesByCoordinates[13][7],
        dungeon.tilesByCoordinates[13][8],
        dungeon.tilesByCoordinates[14][8],
        dungeon.tilesByCoordinates[14][9],
        dungeon.tilesByCoordinates[14][10],
        dungeon.tilesByCoordinates[14][11],
        dungeon.tilesByCoordinates[13][11],
        dungeon.tilesByCoordinates[13][12],
        dungeon.tilesByCoordinates[12][12],
        dungeon.tilesByCoordinates[11][12],
        dungeon.tilesByCoordinates[10][13],
        dungeon.tilesByCoordinates[10][14],
        dungeon.tilesByCoordinates[10][15],
        dungeon.tilesByCoordinates[11][16],
        dungeon.tilesByCoordinates[12][16],
        dungeon.tilesByCoordinates[13][16],
        dungeon.tilesByCoordinates[14][17],
        dungeon.tilesByCoordinates[15][18],
        dungeon.tilesByCoordinates[15][19],
        dungeon.tilesByCoordinates[14][19],
        dungeon.tilesByCoordinates[13][20],
        dungeon.tilesByCoordinates[12][20],
        dungeon.tilesByCoordinates[12][21],
        dungeon.tilesByCoordinates[13][22],
        dungeon.tilesByCoordinates[14][22],
        dungeon.tilesByCoordinates[15][22],
        dungeon.tilesByCoordinates[16][22],
        dungeon.tilesByCoordinates[17][22],
        dungeon.tilesByCoordinates[18][22],
        dungeon.tilesByCoordinates[18][23],
        dungeon.tilesByCoordinates[17][23],
        dungeon.tilesByCoordinates[16][23],
        dungeon.tilesByCoordinates[15][23],
        dungeon.tilesByCoordinates[15][24],
        dungeon.tilesByCoordinates[15][25],
        dungeon.tilesByCoordinates[14][25],
        dungeon.tilesByCoordinates[13][25],
        dungeon.tilesByCoordinates[12][25],
        dungeon.tilesByCoordinates[11][25],
        dungeon.tilesByCoordinates[10][25],
        //dungeon.grid[10][24], // 5 non-wall either way, was evens. Perhaps we should count floors worth *slightly* more than solids? Or count the # contiguous blocks as worth more
        dungeon.tilesByCoordinates[9][25],
        dungeon.tilesByCoordinates[8][25],
        dungeon.tilesByCoordinates[7][25],
        dungeon.tilesByCoordinates[6][25],
        //dungeon.grid[6][24],
        //dungeon.grid[6][23],
        //dungeon.grid[6][22],
        //dungeon.grid[6][21],
        //dungeon.grid[5][22],
        //dungeon.grid[5][23],
        //dungeon.grid[5][24],
        dungeon.tilesByCoordinates[5][25],
        dungeon.tilesByCoordinates[4][25],
        dungeon.tilesByCoordinates[3][25],
        dungeon.tilesByCoordinates[2][25],
        dungeon.tilesByCoordinates[2][24],
        dungeon.tilesByCoordinates[2][23],
        dungeon.tilesByCoordinates[2][22],
        dungeon.tilesByCoordinates[2][21],
        dungeon.tilesByCoordinates[2][20],
        dungeon.tilesByCoordinates[2][19],
        dungeon.tilesByCoordinates[2][18],
        dungeon.tilesByCoordinates[1][18],
        dungeon.tilesByCoordinates[2][17],
        dungeon.tilesByCoordinates[2][16],
        dungeon.tilesByCoordinates[3][16],
        dungeon.tilesByCoordinates[3][15],
        dungeon.tilesByCoordinates[2][15],
        dungeon.tilesByCoordinates[2][14],
        dungeon.tilesByCoordinates[3][13],
        dungeon.tilesByCoordinates[3][12],
        dungeon.tilesByCoordinates[2][11],
        dungeon.tilesByCoordinates[2][10],
        dungeon.tilesByCoordinates[2][9],
        dungeon.tilesByCoordinates[1][9],
        dungeon.tilesByCoordinates[2][8],
        dungeon.tilesByCoordinates[3][8],
        dungeon.tilesByCoordinates[2][7],
        dungeon.tilesByCoordinates[2][6],
        dungeon.tilesByCoordinates[3][6],
        dungeon.tilesByCoordinates[2][5],
        dungeon.tilesByCoordinates[1][5],
        dungeon.tilesByCoordinates[2][4],
        dungeon.tilesByCoordinates[3][4],
        dungeon.tilesByCoordinates[2][3],
        dungeon.tilesByCoordinates[2][2],
        dungeon.tilesByCoordinates[2][1],
        dungeon.tilesByCoordinates[3][2],
        dungeon.tilesByCoordinates[4][2],
        dungeon.tilesByCoordinates[5][3],
        dungeon.tilesByCoordinates[6][3],
    ];
}

function createCol(x: number, isWall: number[]) {
    return isWall.map((is, y) => new Tile(x, y, false, is === 1));
}