import { Dungeon } from '../model/Dungeon';
import { GenerationSteps } from './GenerationSteps';
import { SRandom } from './SRandom';
import { Room, RoomType } from '../model/Room';
import { Pathway } from '../model/Pathway';
import { Tile } from '../model/Tile';
import { Curve } from '../model/generic/Curve';
import {
    computeDelauneyTriangulation,
    computeGabrielGraph,
    computeRelativeNeighbourhoodGraph,
    computeMinimumSpanningTree
} from './graph';

export class DungeonGenerator {
    constructor(
        public animated: boolean,
        readonly stepReached: (step: GenerationSteps, startOfStep: boolean) => void,
        readonly redraw: () => void
    ) {

    }

    async generate(dungeon: Dungeon, startStep: GenerationSteps = GenerationSteps.CreateNodes) {
        const seedGenerator = new SRandom(dungeon.seed);

        const nodeSeed = seedGenerator.next();
        if (startStep <= GenerationSteps.CreateNodes) {
            await this.populateNodes(dungeon, nodeSeed);
        }

        if (startStep <= GenerationSteps.LinkNodes) {
            await this.populateLinks(dungeon);
        }

        const filterSeed = seedGenerator.next();
        if (startStep <= GenerationSteps.FilterLinks) {
            await this.filterLines(dungeon, filterSeed);
        }

        const roomSeed = seedGenerator.next();
        if (startStep <= GenerationSteps.CreateRooms) {
            await this.linkNodesToGrid(dungeon);
            await this.growRooms(dungeon, roomSeed);
        }

        if (startStep <= GenerationSteps.ExpandLines) {
            await this.linkLinesToGrid(dungeon);
        }

        if (startStep <= GenerationSteps.DetectWalls) {
            await this.detectWalls(dungeon);
        }
        
        if (startStep <= GenerationSteps.CurveWalls) {
            await this.generateWallCurves(dungeon);
        }

        this.stepReached(GenerationSteps.Render, true);
        this.animated = false; // don't animate when regenerating so the user can quickly see the results of changes
        this.redraw();
    }

    private delay(milliseconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }

    private async populateNodes(dungeon: Dungeon, seed: number) {
        // Remove all nodes, then create nodeCount nodes. Using same seed ensures same ones are recreated.
        const random = new SRandom(seed);
        this.stepReached(GenerationSteps.CreateNodes, true);

        let makeNode = () => {
            let x = random.nextInRange(2, dungeon.width - 2);
            let y = random.nextInRange(2, dungeon.height - 2);
            return new Room(dungeon, x, y, random.nextIntInRange(0, RoomType.NUM_VALUES));
        };
        let getScaledDistSq = (node1: Room, node2: Room) => {
            let dxScaled = (node1.x - node2.x) / dungeon.width;
            let dyScaled = (node1.y - node2.y) / dungeon.height;
            return dxScaled * dxScaled + dyScaled * dyScaled;
        };

        dungeon.nodes = [];
        for (let i = 0; i < dungeon.nodeCount; i++) {
            if (this.animated) {
                this.redraw();
                await this.delay(100);
            }

            // create two nodes, and go with the one that's furthest away from the nearest node
            let node1 = makeNode(), node2 = makeNode();
            let closestDist1 = Number.MAX_VALUE, closestDist2 = Number.MAX_VALUE;
            for (let node of dungeon.nodes) {
                // scale x/y distances, so width/height changes don't change which node is chosen during regeneration
                closestDist1 = Math.min(closestDist1, getScaledDistSq(node1, node));
                closestDist2 = Math.min(closestDist2, getScaledDistSq(node2, node));
            }

            dungeon.nodes.push(closestDist1 < closestDist2 ? node2 : node1);
        }

        this.stepReached(GenerationSteps.CreateNodes, false);
    }

    private async populateLinks(dungeon: Dungeon) {
        this.stepReached(GenerationSteps.LinkNodes, true);

        dungeon.lines = [];
        dungeon.delauneyLines = [];
        dungeon.gabrielLines = [];
        dungeon.relativeNeighbourhoodLines = [];
        dungeon.minimumSpanningLines = [];

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        let enclosingTriangle: [Room, Room, Room] = [
            new Room(dungeon, 0, 0, RoomType.Artificial),
            new Room(dungeon, 999999, 0, RoomType.Artificial),
            new Room(dungeon, 0, 999999, RoomType.Artificial),
        ];

        dungeon.delauneyLines = computeDelauneyTriangulation(
            dungeon,
            enclosingTriangle,
            (from, to) => new Pathway(from, to)
        );
        
        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        dungeon.gabrielLines = computeGabrielGraph(dungeon, dungeon.delauneyLines);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        dungeon.relativeNeighbourhoodLines = computeRelativeNeighbourhoodGraph(dungeon, dungeon.gabrielLines);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        dungeon.minimumSpanningLines = computeMinimumSpanningTree(dungeon, dungeon.relativeNeighbourhoodLines);

        this.stepReached(GenerationSteps.LinkNodes, false);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }
    }

    private async filterLines(dungeon: Dungeon, seed: number) {
        this.stepReached(GenerationSteps.FilterLinks, true);
        
        let selectingFrom, selectFraction;
        
        if (dungeon.connectivity < 50) {
            dungeon.lines = dungeon.minimumSpanningLines.slice();
            selectingFrom = [];
            for (let line of dungeon.relativeNeighbourhoodLines) {
                if (dungeon.lines.indexOf(line) === -1) {
                    selectingFrom.push(line);
                }
            }
            selectFraction = dungeon.connectivity / 50;
        } else {
            selectingFrom = [];
            for (let line of dungeon.gabrielLines) {
                if (dungeon.relativeNeighbourhoodLines.indexOf(line) === -1) {
                    selectingFrom.push(line);
                }
            }
            selectFraction = (dungeon.connectivity - 50) / 50;
            dungeon.lines = dungeon.relativeNeighbourhoodLines.slice();
        }
        
        let random = new SRandom(seed);
        let numToSelect = Math.round(selectingFrom.length * selectFraction);

        for (let i = numToSelect; i > 0; i--) {
            let selectedLink = selectingFrom.splice(random.nextIntInRange(0, selectingFrom.length), 1)[0];
            dungeon.lines.push(selectedLink);
        }

        this.stepReached(GenerationSteps.FilterLinks, false);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }
    }

    private async linkNodesToGrid(dungeon: Dungeon) {
        this.stepReached(GenerationSteps.CreateRooms, true);

        // populate the grid with blank tiles
        dungeon.grid = [];
        for (let x = 0; x < dungeon.width; x++) {
            let col = new Array<Tile>(dungeon.height);
            dungeon.grid[x] = col;

            for (let y = 0; y < dungeon.height; y++) {
                col[y] = new Tile(x, y);
            }
        }

        // link up the nodes to the tiles that they touch
        for (let node of dungeon.nodes) {
            let x = Math.floor(node.x);
            let y = Math.floor(node.y);

            let tile = dungeon.grid[x][y];
            tile.room = node;
            tile.isFloor = true;
        }
        
        this.stepReached(GenerationSteps.CreateRooms, false);
        
        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }
    }

    private async linkLinesToGrid(dungeon: Dungeon) {
        this.stepReached(GenerationSteps.ExpandLines, true);

        // associate each tile of the grid with all of the links that overlap or touch it
        // this is Xiaolin Wi's algorithm, without the antialiasing.
        for (let link of dungeon.lines) {
            let x0 = Math.floor(link.from.x);
            let x1 = Math.floor(link.to.x);
            let y0 = Math.floor(link.from.y);
            let y1 = Math.floor(link.to.y);
            
            dungeon.grid[x0][y0].isFloor = true;
            dungeon.grid[x1][y1].isFloor = true;

            let steep = Math.abs(y1 - y0) > Math.abs(x1 - x0);
            if (steep) { // swap x & y, ensure not steep
                let tmp = y0;
                y0 = x0;
                x0 = tmp;
                
                tmp = y1;
                y1 = x1;
                x1 = tmp;
            }
            if (x0 > x1) { // swap 0 & 1, ensure moving rightwards
                let tmp = x1;
                x1 = x0;
                x0 = tmp;
                
                tmp = y1;
                y1 = y0;
                y0 = tmp;
            }
            
            let gradient = (y1 - y0) / (x1 - x0);
            let y = y0 + gradient * 0.5; // move to the "middle" of the cell
            
            for (let x = x0; x < x1; x++) {
                let iY = Math.round(y - 0.5); // round to the nearest i+0.5, then truncate to int
                let closestSideStep = iY + 0.5 > y ? -1 : 1;
                let almostInteger = Math.abs(y - iY) < 0.10;
                
                if (steep) {
                    dungeon.grid[iY + closestSideStep][x].isFloor = true;
                    dungeon.grid[iY][x].isFloor = true;
                    if (!almostInteger) {
                        dungeon.grid[iY - closestSideStep][x].isFloor = true;
                    }
                } else {
                    dungeon.grid[x][iY + closestSideStep].isFloor = true;
                    dungeon.grid[x][iY].isFloor = true;
                    if (!almostInteger) {
                        dungeon.grid[x][iY - closestSideStep].isFloor = true;
                    }
                }
                
                y += gradient;
            }          
        
            if (this.animated) {
                this.redraw();
                await this.delay(250);
            }
        }

        this.stepReached(GenerationSteps.ExpandLines, false);

        if (this.animated) {
            this.redraw();
            await this.delay(1000);
        }
    }
    
    private async growRooms(dungeon: Dungeon, seed: number) {
        let random = new SRandom(seed);

        for (let node of dungeon.nodes) {
            let nodeX = Math.floor(node.x);
            let nodeY = Math.floor(node.y);

            let minX: number, minY: number, maxX: number, maxY: number;

            switch (random.nextIntInRange(0, 6)) {
                case 0:
                    // junction
                    minX = nodeX - 1; maxX = nodeX + 1;
                    minY = nodeY - 1; maxY = nodeY + 1;
                    break;
                case 1:
                case 2: {
                    // small room
                    let halfWidth = random.nextIntInRange(1, 4);
                    let halfHeight = random.nextIntInRange(1, 4);
                    minX = nodeX - halfWidth; maxX = nodeX + halfWidth;
                    minY = nodeY - halfHeight; maxY = nodeY + halfHeight;
                    break;
                }
                case 3: {
                    // large room
                    let halfWidth = random.nextIntInRange(3, 8);
                    let halfHeight = random.nextIntInRange(3, 8);
                    let xOffset = random.nextIntInRange(-3, 4);
                    let yOffset = random.nextIntInRange(-3, 4);
                    minX = nodeX - halfWidth + xOffset; maxX = nodeX + halfWidth + xOffset;
                    minY = nodeY - halfHeight + yOffset; maxY = nodeY + halfHeight + yOffset;
                    break;
                }
                case 4: {
                    // long room
                    let halfWidth = random.nextIntInRange(7, 12);
                    let halfHeight = random.nextIntInRange(2, 5);
                    let xOffset = random.nextIntInRange(-6, 7);
                    minX = nodeX - halfWidth + xOffset; maxX = nodeX + halfWidth + xOffset;
                    minY = nodeY - halfHeight; maxY = nodeY + halfHeight;
                    break;
                }
                case 5: {
                    // tall room
                    let halfWidth = random.nextIntInRange(2, 5);
                    let halfHeight = random.nextIntInRange(7, 12);
                    let yOffset = random.nextIntInRange(-6, 7);
                    minX = nodeX - halfWidth; maxX = nodeX + halfWidth;
                    minY = nodeY - halfHeight + yOffset; maxY = nodeY + halfHeight + yOffset;
                    break;
                }
                default:
                    continue;
            }

            let isRound = random.next() < 0.5;
            let filter;
            if (isRound) {
                maxX += 2; maxY += 2;
                minX -= 2; minY -= 2;

                filter = (x: number, y: number) => {
                    let a = maxX - nodeX;
                    let b = maxY - nodeY;
                    x -= nodeX;
                    y -= nodeY;

                    return (x * x) / (a * a) + (y * y) / (b * b) <= 1;
                };
            }

            minX = Math.max(1, minX);
            maxX = Math.min(dungeon.width - 2, maxX);
            minY = Math.max(1, minY);
            maxY = Math.min(dungeon.height - 2, maxY);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    let tile = dungeon.grid[x][y];
                    if (tile.room === null && (filter === undefined || filter(x, y))) {
                        tile.isFloor = true;
                        tile.room = node;
                    }
                }
            }

            if (this.animated) {
                this.redraw();
                await this.delay(250);
            }
        }
    }
    
    private async detectWalls(dungeon: Dungeon) {
        for (let x = 0; x < dungeon.width; x++) {
            for (let y = 0; y < dungeon.height; y++) {
                let tile = dungeon.grid[x][y];
                if (tile.isFloor) {
                    continue;
                }

                let toTest = this.getAdjacent(dungeon, tile, true, false);
                for (let test of toTest) {
                    if (test.isFloor) {
                        tile.isWall = true;
                        break;
                    }
                }

                if (tile.isFloor) {
                    continue;
                }

                // artificial rooms should have "corner" wall nodes filled in
                // TODO: wall curves still "cut the corner" and then a new loop is added to fill the cut corner in.
                // That needs to change if these go in.
                toTest = this.getAdjacent(dungeon, tile, false, true);
                for (let test of toTest) {
                    if (test.isFloor && test.room !== null && test.room.roomType === RoomType.Artificial) {
                        tile.isWall = true;
                        break;
                    }
                }
            }
            
            if (this.animated) {
                this.redraw();
                await this.delay(50);
            }
        }

        if (this.animated) {
            this.redraw();
            await this.delay(500);
        }
    }
    
    private async generateWallCurves(dungeon: Dungeon) {
        dungeon.walls = [];
        
        this.stepReached(GenerationSteps.CurveWalls, true);

        for (let x = 0; x < dungeon.width; x++) {
            for (let y = 0; y < dungeon.height; y++) {
                let tile = dungeon.grid[x][y];
                if (tile.isWall && !tile.isFloor) {
                    await this.generateWallCurve(dungeon, tile);
                    
                    if (this.animated) {
                        this.redraw();
                        await this.delay(500);
                    }
                }
            }
        }
        
        this.stepReached(GenerationSteps.CurveWalls, false);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }
    }

    private async generateWallCurve(dungeon: Dungeon, firstTile: Tile) {
        let curve = new Curve();
        dungeon.walls.push(curve);

        curve.keyPoints.push(firstTile);
        firstTile.isFloor = true;

        // Pick next tile, keep looping. When there isn't a next one, stop. Initially, only look orthogonally.
        let tile = this.pickBestAdjacentWallTileOrthogonalThenDiagonal(
            dungeon,
            firstTile,
            t => !t.isFloor && t.isWall
        );

        if (tile === undefined) {
            // Do the same check agains, but don't ignore tiles that are part of walls. This will be the last one.
            tile = this.pickBestAdjacentWallTileOrthogonalThenDiagonal(
                dungeon,
                firstTile,
                t => t.isWall
            );
        }

        // let lastTile = firstTile;
        
        let isDeadEnd = false;
        let prevTile = firstTile;
        while (tile !== undefined) {
            // lastTile = tile;
            /*
            // to make curves look better, only include alternate tiles ... unless they're important ones.
            if ((tile.x !== prevTile.x && tile.y !== prevTile.y) || tile.isFloor || tile === firstTile) {
                addKeyPoint = true;
            }
            if (addKeyPoint) {
                */
            curve.keyPoints.push(tile);
                /*
            }
            addKeyPoint = !addKeyPoint;
            */
            
            // if the next one is the first one, note that this is a loop and stop.
            if (tile === firstTile) {
                curve.isLoop = true;
                break;
            }
            
            if (tile.isFloor) {
                isDeadEnd = curve.keyPoints.indexOf(tile) !== curve.keyPoints.length - 1;
                break; // intersected a(nother) curve, so end this one
            }
            tile.isFloor = true;
            
            let next = this.pickBestAdjacentWallTileOrthogonalThenDiagonal(
                dungeon,
                tile,
                t => !t.isFloor && t.isWall && t !== prevTile
            );
            if (next === undefined) {
                // do the same check again, but don't ignore tiles that are part of walls. This will be the last one.
                next = this.pickBestAdjacentWallTileOrthogonalThenDiagonal(
                    dungeon,
                    tile,
                    t => t.isWall && t !== prevTile
                );
            }
            prevTile = tile;
            tile = next;

            if (this.animated) {
                curve.updateRenderPoints();
                this.redraw();
                await this.delay(10);
            }
        }
        if (tile === undefined) {
            isDeadEnd = true;
        }

        if (this.animated) {
            curve.updateRenderPoints();
            this.redraw();
            await this.delay(10);
        }

        await this.backtrackAndBranch(dungeon, curve, isDeadEnd);

        curve.updateRenderPoints();
        return curve;
    }
    
    private async backtrackAndBranch(dungeon: Dungeon, curve: Curve, isDeadEnd: boolean) {
        // iterate backwards round this curve, trying to find somewhere to branch off a new curve from
        for (let i = curve.keyPoints.length - 1; i >= 0; i--) {
            let curveTile = curve.keyPoints[i] as Tile;

            // if there's an adjacent tile a wall can start from, generate a new curve and call this method on it again
            let viableTile = this.pickBestAdjacentWallTile(dungeon, curveTile, true, true, t => !t.isFloor && t.isWall);
            if (viableTile !== undefined) {
                let newCurve = await this.generateWallCurve(dungeon, curveTile);
                
                if (isDeadEnd) {
                    if (this.animated) {
                        this.redraw();
                        await this.delay(500);
                    }
                    
                    // chop off the dead end from the initial curve, and graft the new curve on.
                    // then have the chopped-off dead end be the new curve instead
                    let newBranch = newCurve.keyPoints.slice(1);
                    let deadEnd = curve.keyPoints.splice(i + 1);
                    deadEnd.unshift(curveTile);

                    newCurve.keyPoints = deadEnd;
                    curve.keyPoints = curve.keyPoints.concat(newBranch);
                    
                    if (curve.keyPoints[0] === curve.keyPoints[curve.keyPoints.length - 1]) {
                        curve.isLoop = true;
                        isDeadEnd = false;
                    }

                    curve.updateRenderPoints();
                    newCurve.updateRenderPoints();
                }

                if (this.animated) {
                    this.redraw();
                    await this.delay(500);
                }
            }
        }
    }

    private getAdjacent(dungeon: Dungeon, from: Tile, orthogonal: boolean = true, diagonal: boolean = false) {
        let results = [];

        if (orthogonal) {
            if (from.x > 0) {
                results.push(dungeon.grid[from.x - 1][from.y]);
            }
            if (from.x < dungeon.width - 1) {
                results.push(dungeon.grid[from.x + 1][from.y]);
            }
            if (from.y > 0) {
                results.push(dungeon.grid[from.x][from.y - 1]);
            }
            if (from.y < dungeon.height - 1) {
                results.push(dungeon.grid[from.x][from.y + 1]);
            }
        }
        
        if (diagonal) {
            if (from.x > 0) {
                if (from.y > 0) {
                    results.push(dungeon.grid[from.x - 1][from.y - 1]);
                }
                if (from.y < dungeon.height - 1) {
                    results.push(dungeon.grid[from.x - 1][from.y + 1]);
                }
            }
            if (from.x < dungeon.width - 1) {
                if (from.y > 0) {
                    results.push(dungeon.grid[from.x + 1][from.y - 1]);
                }
                if (from.y < dungeon.height - 1) {
                    results.push(dungeon.grid[from.x + 1][from.y + 1]);
                }
            }
        }

        return results;
    }

    private pickBestAdjacentWallTileOrthogonalThenDiagonal(
        dungeon: Dungeon,
        from: Tile,
        filter: (tile: Tile) => boolean
    ) {
        const ortho = this.pickBestAdjacentWallTile(dungeon, from, true, false, filter);
        return ortho !== undefined
            ? ortho
            : this.pickBestAdjacentWallTile(dungeon, from, false, true, filter);
    }

    private pickBestAdjacentWallTile(
        dungeon: Dungeon,
        from: Tile,
        orthogonal: boolean,
        diagonal: boolean,
        filter: (tile: Tile) => boolean
    ) {
        let bestTile = undefined;
        let bestNumAdjacentFloorTiles = 0;

        let toTest = this.getAdjacent(dungeon, from, orthogonal, diagonal);
        for (let tile of toTest) {
            if (!filter(tile)) {
                continue;
            }

            let numAdjacentFloorTiles = 0;
            let allAdjacent = this.getAdjacent(dungeon, tile, true, true);

            for (let adjacent of allAdjacent) {
                if (adjacent.isFloor && !adjacent.isWall) {
                    numAdjacentFloorTiles ++;
                }
            }

            if (numAdjacentFloorTiles > bestNumAdjacentFloorTiles) {
                bestNumAdjacentFloorTiles = numAdjacentFloorTiles;
                bestTile = tile;
            }
        }
        
        return bestTile;
    }
}