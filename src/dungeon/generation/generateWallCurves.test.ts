import { pickBestAdjacentWallTileOrthogonalThenDiagonal } from './generateWallCurves';
import { Dungeon } from '../model/Dungeon';
import { Tile } from '../model/Tile';

it("picks the correct subsequent tiles", () => {
    const dungeon = new Dungeon();
    dungeon.width = 20;
    dungeon.height = 27;

    dungeon.grid = [
        createCol(0, [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        createCol(1, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0]),
        createCol(2, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0]),
        createCol(3, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        createCol(4, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        createCol(5, [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        createCol(6, [0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0]),
        createCol(7, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0]),
        createCol(8, [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0]),
        createCol(9, [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0]),
        createCol(10, [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0]),
        createCol(11, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0]),
        createCol(12, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0]),
        createCol(13, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0]),
        createCol(14, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0]),
        createCol(15, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
    ];

    let currentCell: Tile | undefined = dungeon.grid[7][3];

    const path: Tile[] = [];

    while (currentCell !== undefined) {
        currentCell.isFloor = true;
        path.push(currentCell);
        currentCell = pickBestAdjacentWallTileOrthogonalThenDiagonal(dungeon, currentCell, t => !t.isFloor && t.isWall);
    }

    expect(path).toEqual([
        dungeon.grid[7][3],
        dungeon.grid[8][3],
        dungeon.grid[9][3],
        dungeon.grid[10][3],
        dungeon.grid[10][4],
        dungeon.grid[10][5],
        dungeon.grid[10][6],
        dungeon.grid[10][7],
        dungeon.grid[11][4],
        dungeon.grid[12][4],
    ]);
});

/* Below is what should be the "test" path
                    
  1                 
  111               
  1  111111         
  11      1         
 11       1         
  11      1         
  1       1111      
  11         11     
 11           1     
  1           1     
  1          11     
   1       111      
   1      1         
  1       1         
  11      1         
  11       111      
  1           1     
 11            1    
  1           11    
  1         11      
  1   1     1       
  1  11      111111 
  1  11        1111 
  1  11   1    1    
  11111111111111    
 1                  
                    
*/

function createCol(x: number, isWall: number[]) {
    return isWall.map((is, y) => new Tile(x, y, false, is === 1));
}