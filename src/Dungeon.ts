import { SRandom } from './generic/SRandom';
import { Link } from './Link';
import { Node } from './Node';
import { Tile } from './Tile';
import { Graph } from './generic/Graph';

export const enum GenerationSteps {
    CreateNodes,
    LinkNodes,
    FilterLinks,
    CreateRooms,
    ExpandLines,
    Render,
}

export class Dungeon extends Graph<Node, Link> {
    seed: number;
    delauneyLines: Link[];
    gabrielLines: Link[];
    relativeNeighbourhoodLines: Link[];
    minimumSpanningLines: Link[];

    nodeAlpha = 0;
    extraLinkAlpha = 0;
    drawNodeLinks = true;
    drawGrid = false;

    grid: Tile[][];
    
    constructor(private animated: boolean, public ctx: CanvasRenderingContext2D, public nodeCount: number,
                public width: number, public height: number, public scale: number, public connectivity: number) {
        super();
        this.seed = Math.random();
    }

    async generate(startStep: GenerationSteps = GenerationSteps.CreateNodes) {
        if (this.animated) {
            this.nodeAlpha = this.extraLinkAlpha = 0;
            this.drawNodeLinks = false;
        }

        let seedGenerator = new SRandom(this.seed);

        let nodeSeed = seedGenerator.next();
        if (startStep <= GenerationSteps.CreateNodes) {
            await this.populateNodes(nodeSeed);
        }

        if (startStep <= GenerationSteps.LinkNodes) {
            await this.populateLinks();
        }

        let filterSeed = seedGenerator.next();
        if (startStep <= GenerationSteps.FilterLinks) {
            await this.filterLines(filterSeed);
        }

        let roomSeed = seedGenerator.next();
        if (startStep <= GenerationSteps.CreateRooms) {
            await this.linkNodesToGrid();
            await this.growRooms(roomSeed);
        }

        if (startStep <= GenerationSteps.ExpandLines) {
            await this.linkLinesToGrid();
        }

        this.animated = false; // don't animate when regenerating so the user can quickly see the results of changes
        this.redraw();
    }

    redraw() {
        // TODO: requestAnimationFrame?
        this.draw();
    }

    private delay(milliseconds: number): Promise<void> {
        return new Promise<void>(resolve => {
            setTimeout(() => resolve(), milliseconds);
        });
    }

    private async populateNodes(seed: number) {
        // Remove all nodes, then create nodeCount nodes. Using same seed ensures same ones are recreated.
        let random = new SRandom(seed);
        this.nodeAlpha = 1;

        let makeNode = () => {
            let x = random.nextInRange(1, this.width - 1);
            let y = random.nextInRange(1, this.height - 1);
            return new Node(this, x, y, 1);
        };
        let getScaledDistSq = (node1: Node, node2: Node) => {
            let dxScaled = (node1.x - node2.x) / this.width;
            let dyScaled = (node1.y - node2.y) / this.height;
            return dxScaled * dxScaled + dyScaled * dyScaled;
        };

        this.nodes = [];
        for (let i = 0; i < this.nodeCount; i++) {
            if (this.animated) {
                this.redraw();
                await this.delay(100);
            }

            // create two nodes, and go with the one that's furthest away from the nearest node
            let node1 = makeNode(), node2 = makeNode();
            let closestDist1 = Number.MAX_VALUE, closestDist2 = Number.MAX_VALUE;
            for (let node of this.nodes) {
                // scale x/y distances, so width/height changes don't change which node is chosen during regeneration
                closestDist1 = Math.min(closestDist1, getScaledDistSq(node1, node));
                closestDist2 = Math.min(closestDist2, getScaledDistSq(node2, node));
            }

            this.nodes.push(closestDist1 < closestDist2 ? node2 : node1);
        }
    }

    private async populateLinks() {
        this.extraLinkAlpha = 1;

        this.lines = [];
        this.delauneyLines = [];
        this.gabrielLines = [];
        this.relativeNeighbourhoodLines = [];
        this.minimumSpanningLines = [];

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        let node1 = new Node(this, 0, 0);
        let node2 = new Node(this, 999999, 0);
        let node3 = new Node(this, 0, 999999);

        this.delauneyLines = this.computeDelauneyTriangulation([node1, node2, node3], (from, to) => new Link(from, to));
        
        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        this.gabrielLines = this.computeGabrielGraph(this.delauneyLines);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        this.relativeNeighbourhoodLines = this.computeRelativeNeighbourhoodGraph(this.gabrielLines);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }

        this.minimumSpanningLines = this.computeMinimumSpanningTree(this.relativeNeighbourhoodLines);

        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }
    }

    private async filterLines(seed: number) {
        this.drawNodeLinks = true;
        this.extraLinkAlpha = 0.2;

        let selectingFrom, selectFraction;
        let animStepTime = 0;

        if (this.connectivity < 50) {
            this.lines = this.minimumSpanningLines.slice();
            selectingFrom = [];
            for (let line of this.relativeNeighbourhoodLines) {
                if (this.lines.indexOf(line) === -1) {
                    selectingFrom.push(line);
                }
            }
            selectFraction = this.connectivity / 50;

            let numSteps = selectFraction * selectingFrom.length + 1;
            animStepTime = 5000 / numSteps; // ensure that animation always lasts the same duration
        } else {
            selectingFrom = [];
            for (let line of this.gabrielLines) {
                if (this.relativeNeighbourhoodLines.indexOf(line) === -1) {
                    selectingFrom.push(line);
                }
            }
            selectFraction = (this.connectivity - 50) / 50;

            if (this.animated) {
                // start from the minimum and add everything in the relative neighbourhood, to get a fuller animation
                this.lines = this.minimumSpanningLines.slice();

                let numSteps = selectFraction * selectingFrom.length
                    + this.relativeNeighbourhoodLines.length - this.minimumSpanningLines.length
                    + 1;
                animStepTime = 5000 / numSteps; // ensure that animation always lasts the same duration
                    
                for (let line of this.relativeNeighbourhoodLines) {
                    if (this.lines.indexOf(line) === -1) {
                        this.redraw();
                        await this.delay(animStepTime);

                        this.lines.push(line);
                    }
                }
            } else {
                this.lines = this.relativeNeighbourhoodLines.slice();
            }
        }
        
        let random = new SRandom(seed);
        let numToSelect = Math.round(selectingFrom.length * selectFraction);

        for (let i = numToSelect; i > 0; i--) {
            if (this.animated) {
                this.redraw();
                await this.delay(animStepTime);
            }

            let selectedLink = selectingFrom.splice(random.randomIntRange(0, selectingFrom.length), 1)[0];
            this.lines.push(selectedLink);
        }

        if (this.animated) {
            this.redraw();
            await this.delay(animStepTime);
        }

        this.extraLinkAlpha = 0;

        if (this.animated) {
            this.redraw();
            await this.delay(1000);
        }
    }

    private async linkNodesToGrid() {
        // populate the grid with blank tiles
        this.grid = [];
        for (let x = 0; x < this.width; x++) {
            let col = new Array<Tile>(this.height);
            this.grid[x] = col;

            for (let y = 0; y < this.height; y++) {
                col[y] = new Tile(x, y);
            }
        }

        // link up the nodes to the tiles that they touch
        for (let node of this.nodes) {
            let x = Math.floor(node.x);
            let y = Math.floor(node.y);

            let cell = this.grid[x][y];
            cell.node = node;
        }
        
        this.drawGrid = true;
        this.nodeAlpha = 0;
        
        if (this.animated) {
            this.redraw();
            await this.delay(1500);
        }
    }

    private async linkLinesToGrid() {
        // associate each tile of the grid with all of the links that overlap or touch it
        // this is Xiaolin Wi's algorithm, without the antialiasing.
        for (let link of this.lines) {
            let x0 = Math.floor(link.from.x);
            let x1 = Math.floor(link.to.x);
            let y0 = Math.floor(link.from.y);
            let y1 = Math.floor(link.to.y);
            
            this.grid[x0][y0].links.push(link);
            this.grid[x1][y1].links.push(link);

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
                    this.grid[iY + closestSideStep][x].links.push(link);
                    this.grid[iY][x].links.push(link);
                    if (!almostInteger) {
                        this.grid[iY - closestSideStep][x].links.push(link);
                    }
                } else {
                    this.grid[x][iY + closestSideStep].links.push(link);
                    this.grid[x][iY].links.push(link);
                    if (!almostInteger) {
                        this.grid[x][iY - closestSideStep].links.push(link);
                    }
                }
                
                y += gradient;
            }          
        
            if (this.animated) {
                this.redraw();
                await this.delay(250);
            }
        }

        this.drawNodeLinks = false;
        if (this.animated) {
            this.redraw();
            await this.delay(1000);
        }
    }
    
    private async growRooms(seed: number) {
        let random = new SRandom(seed);

        for (let node of this.nodes) {
            let nodeX = Math.floor(node.x);
            let nodeY = Math.floor(node.y);

            let minX: number, minY: number, maxX: number, maxY: number;

            switch (random.randomIntRange(0, 6)) {
                case 0:
                    // junction
                    minX = nodeX - 1; maxX = nodeX + 1;
                    minY = nodeY - 1; maxY = nodeY + 1;
                    break;
                case 1:
                case 2: {
                    // small room
                    let halfWidth = random.randomIntRange(1, 4);
                    let halfHeight = random.randomIntRange(1, 4);
                    minX = nodeX - halfWidth; maxX = nodeX + halfWidth;
                    minY = nodeY - halfHeight; maxY = nodeY + halfHeight;
                    break;
                }
                case 3: {
                    // large room
                    let halfWidth = random.randomIntRange(3, 8);
                    let halfHeight = random.randomIntRange(3, 8);
                    let xOffset = random.randomIntRange(-3, 4);
                    let yOffset = random.randomIntRange(-3, 4);
                    minX = nodeX - halfWidth + xOffset; maxX = nodeX + halfWidth + xOffset;
                    minY = nodeY - halfHeight + yOffset; maxY = nodeY + halfHeight + yOffset;
                    break;
                }
                case 4: {
                    // long room
                    let halfWidth = random.randomIntRange(7, 12);
                    let halfHeight = random.randomIntRange(2, 5);
                    let xOffset = random.randomIntRange(-6, 7);
                    minX = nodeX - halfWidth + xOffset; maxX = nodeX + halfWidth + xOffset;
                    minY = nodeY - halfHeight; maxY = nodeY + halfHeight;
                    break;
                }
                case 5: {
                    // tall room
                    let halfWidth = random.randomIntRange(2, 5);
                    let halfHeight = random.randomIntRange(7, 12);
                    let yOffset = random.randomIntRange(-6, 7);
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

            minX = Math.max(0, minX);
            maxX = Math.min(this.width - 1, maxX);
            minY = Math.max(0, minY);
            maxY = Math.min(this.height - 1, maxY);

            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    let tile = this.grid[x][y];
                    if (tile.node === null && (filter === undefined || filter(x, y))) {
                        tile.node = node;
                    }
                }
            }

            if (this.animated) {
                this.redraw();
                await this.delay(250);
            }
        }
    }

    private draw() {
        let ctx = this.ctx;

        if (this.drawGrid) {
            ctx.fillStyle = '#666666';
            ctx.fillRect(0, 0, this.width * this.scale, this.height * this.scale);

            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    this.grid[x][y].drawFill(ctx, this.scale);
                }
            }
        } else {
            ctx.clearRect(0, 0, this.width * this.scale, this.height * this.scale);
        }

        if (this.extraLinkAlpha > 0) {
            ctx.globalAlpha = this.extraLinkAlpha;

            ctx.strokeStyle = '#000';
            for (let line of this.minimumSpanningLines) {
                line.draw(ctx, this.scale);
            }

            ctx.strokeStyle = '#F00';
            for (let line of this.relativeNeighbourhoodLines) {
                if (this.minimumSpanningLines.indexOf(line) === -1) {
                    line.draw(ctx, this.scale);
                }
            }

            ctx.strokeStyle = '#0CF';
            for (let line of this.gabrielLines) {
                if (this.relativeNeighbourhoodLines.indexOf(line) === -1) {
                    line.draw(ctx, this.scale);
                }
            }

            ctx.strokeStyle = '#ddd';
            for (let line of this.delauneyLines) {
                if (this.gabrielLines.indexOf(line) === -1) {
                    line.draw(ctx, this.scale);
                }
            }
            ctx.globalAlpha = 1;
        }
        
        if (this.drawNodeLinks) {
            ctx.strokeStyle = '#000';
            for (let line of this.lines) {
                line.draw(ctx, this.scale);
            }
        }

        if (this.nodeAlpha > 0) {
            ctx.globalAlpha = this.nodeAlpha;
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].draw(ctx, this.scale);
            }
            ctx.globalAlpha = 1;
        }

        if (this.drawGrid) {
            ctx.strokeStyle = 'rgba(200,200,200,0.5)';
            ctx.beginPath();
            for (let x = 0; x < this.width; x++) {
                ctx.moveTo(x * this.scale, 0);
                ctx.lineTo(x * this.scale, this.height * this.scale);
            }
            for (let y = 0; y < this.height; y++) {
                ctx.moveTo(0, y * this.scale);
                ctx.lineTo(this.width * this.scale, y * this.scale);
            }
            ctx.stroke();
        }
    }
}