import { Coord } from './Coord';
import { Link } from './Link';
import { Node, NodeType } from './Node';
import { Tile } from './Tile';
import { lerp, randomInt } from './Calc';
import { Graph } from './generic/Graph';

interface IRenderInfo {
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
}

export class Dungeon extends Graph<Node, Link> {
    constructor(readonly animated: boolean, readonly getRenderInfo: () => IRenderInfo) {
		super();
        this.intervalID = null;
        this.generate();
    }

    scale = 10;
    drawNodeGraph = true;
    drawNodeLinks = true;
    drawGrid = false;

    width: number;
    height: number;
    grid: Tile[][];

    intervalID: number | null;

	distance(node1: Node, node2: Node) {
		return Math.sqrt(node1.pos.x - node2.pos.x + node1.pos.y - node2.pos.y);
	}

	destroy() {
		if (this.intervalID !== null)
			window.clearInterval(this.intervalID);
    }

	generate() {
		this.intervalID = null;
		
		let sequence = this.populateNodes()
			.then(() => this.computeDelauneyTriangulation())
			.then(() => this.computeGabrielGraph())
			.then(() => this.computeRelativeNeighbourhoodGraph())
			.then(() => this.computeMinimumSpanningTree())
			.then(() => this.reduceToLinearityValue())
			
			.then(this.alignNodes.bind(this))
			.then(this.fitOnScreen.bind(this))
			.then(this.switchToGrid.bind(this))
			.then(this.joinLinksToTiles.bind(this))
			.then(this.growRooms.bind(this));
		
		if (!this.animated)
			sequence = sequence.then(this.redraw.bind(this));
    }
    
	populateNodes() {
		// create nodes until there are numNodes. Use same seeded PRNG each time so that the same ones are created when the number increases/decreases
		let numNodes = 25; // TODO: this should be UI-driven

		if (this.nodes.length > numNodes) {
			this.nodes.splice(numNodes);
		}
		else {
			for (let i=this.nodes.length; i<numNodes; i++) {
				let x = Math.random() * this.width;
				let y = Math.random() * this.height;
				let node = new Node(this, new Coord(x, y), 1);
				this.nodes.push(node);
			}
		}

		return Promise.resolve();
	}
	
	private reduceToLinearityValue() {
		return Promise.resolve();
	}

	settleNodes(settleSteps: number, canFinishEarly: boolean) {
		let settledStepSizeLimit = 0.01;
		
		if (this.animated)
			return new Promise((resolve, reject) => {
				let num = 0;
				this.intervalID = window.setInterval(() => {
					let finishEarly = this.repositionNodes() <= settledStepSizeLimit;
					this.redraw();
					
					if ((canFinishEarly && finishEarly) || ++num >= settleSteps) {
                        if (this.intervalID !== null) {
                            window.clearInterval(this.intervalID);
                        }
						resolve();
					}
				}, 50);
			});
		else
			return new Promise((resolve, reject) => {
				for (let i=0; i<settleSteps; i++)
					if (this.repositionNodes() <= settledStepSizeLimit)
						break;
				resolve();
			});
    }
    
	repositionNodes() {
		// add up all the forces on each node, and then apply them
		let biggestForce = 0;
		
		for (let i=0; i<this.nodes.length; i++) {
			let node = this.nodes[i];
			node.force = node.calculateForce();
			
			let size = node.force.length();
			if (size > biggestForce)
				biggestForce = size;
		}
		
		for (let i=0; i<this.nodes.length; i++) {
			let node = this.nodes[i];
			node.pos.applyOffset(node.force as Coord);
			delete node.force;
		}
		
		return biggestForce;
    }
    
	alignNodes() {
		// align nodes to integer coordinates
		if (this.animated)
			return new Promise((resolve, reject) => {
				let num = 0, lerpSteps = 20;
				this.intervalID = window.setInterval(() => {
					num++;
					let fraction = num / lerpSteps;
					for (let i=0; i<this.nodes.length; i++) {
						let node = this.nodes[i];
						node.pos.x = lerp(node.pos.x, Math.round(node.pos.x), fraction);
						node.pos.y = lerp(node.pos.y, Math.round(node.pos.y), fraction);
					}
					this.redraw();
					
					if (num >= lerpSteps) {
                        if (this.intervalID !== null) {
                            window.clearInterval(this.intervalID);
                        }
						resolve();
					}
				}, 50);
			});
		else
			return new Promise((resolve, reject) => {
				for (let i=0; i<this.nodes.length; i++) {
					let node = this.nodes[i];
					node.pos.x = Math.round(node.pos.x);
					node.pos.y = Math.round(node.pos.y);
				}
				resolve();
			});
    }
    
	fitOnScreen() {
		let edgeSpacing = 10;
		let minX: number, minY: number, maxX: number, maxY: number;
		return new Promise((resolve, reject) => {
			minX = Number.MAX_VALUE; minY = Number.MAX_VALUE;
			maxX = Number.MIN_VALUE; maxY = Number.MIN_VALUE;
			for (let i=0; i<this.nodes.length; i++) {
					let node = this.nodes[i];
					minX = Math.min(minX, node.pos.x);
					minY = Math.min(minY, node.pos.y);
					maxX = Math.max(maxX, node.pos.x);
					maxY = Math.max(maxY, node.pos.y);
				}
			
			minX -= edgeSpacing;
			minY -= edgeSpacing;
			maxX += edgeSpacing;
			maxY += edgeSpacing;
			
			if (this.animated) {
				let num = 0, lerpSteps = 20;
				let stepX = -minX / lerpSteps, stepY = -minY / lerpSteps;
				this.intervalID = window.setInterval(() => {
					for (let i=0; i<this.nodes.length; i++) {
						let node = this.nodes[i];
						node.pos.x += stepX;
						node.pos.y += stepY;
						this.redraw();
					}
					if (++num >= lerpSteps) {
                        if (this.intervalID !== null) {
                            window.clearInterval(this.intervalID);
                        }
						resolve();
					}
				}, 50);
			}
			else {
				for (let i=0; i<this.nodes.length; i++) {
					let node = this.nodes[i];
					node.pos.x -= minX;
					node.pos.y -= minY;
				}
				resolve();
			}
		})
		.then(() => {
			for (let i=0; i<this.nodes.length; i++) {
				let pos = this.nodes[i].pos;
				pos.x = Math.round(pos.x);
				pos.y = Math.round(pos.y);
			}
			
			this.grid = new Array(maxX - minX + 1);
			for (let i=0; i<this.grid.length; i++)
				this.grid[i] = new Array(maxY - minY + 1);
		});
    }
    
	addNode() {
		// these are all cumulative
		let insertChance = parseInt((document.getElementById('chanceInsert') as HTMLInputElement).value);
		let joinChance = parseInt((document.getElementById('chanceJoin') as HTMLInputElement).value) + insertChance;
		let appendChance = parseInt((document.getElementById('chanceAppend') as HTMLInputElement).value) + joinChance;
		let branchChance = parseInt((document.getElementById('chanceBranch') as HTMLInputElement).value) + appendChance;
		
		let weightVariation = parseInt((document.getElementById('weightVariation') as HTMLInputElement).value);
		
		let randomType = randomInt(branchChance);
		let randomWeight = (25 + randomInt(weightVariation)) / 40;
		
		if (randomType < insertChance)
			this.insertNode(randomWeight);
		else if (randomType < joinChance)
			this.joinNodes();
		else if (randomType < appendChance)
			this.appendNode(randomWeight);
		else
			this.branchNode(randomWeight);
    }
    
	insertNode(weight: number) {
		// randomly pick a link to interrupt with a new node
		let link = this.links[randomInt(this.links.length)];
		
		let newNode = new Node(this, link.fromNode.pos.halfwayTo(link.toNode.pos), weight);
		this.nodes.push(newNode);
		
		let newLink = new Link(newNode, link.toNode);
		this.links.push(newLink);
		
		link.toNode = newNode;
		return newNode;
    }
    
	joinNodes() {
		// pick two nodes
		let fromNode = this.nodes[randomInt(this.nodes.length)];
		let possibleToNodes = [], junctions = [];
		
		for (let i=0; i<fromNode.links.length; i++) {
			let link = fromNode.links[i];
			if (link.fromNode.nodeType == NodeType.Junction)
				junctions.push(link.fromNode);
			if (link.toNode.nodeType == NodeType.Junction)
				junctions.push(link.toNode);
		}
		
		for (let i=0; i<this.nodes.length; i++) {
			let node = this.nodes[i];
			if (node === fromNode)
				continue;
			
			// if already linked, don't do it twice
			let invalid = false;
			for (let j=0; j<fromNode.links.length; j++) {
				let link = fromNode.links[j];
				if (link.toNode === node || link.fromNode === node) {
					invalid = true;
					break;
				}
				
				// if both nodes link to the same junction node, that's also disallowed
				for (let k=0; k<junctions.length; k++) {
					let junction = junctions[k];
					if (link.fromNode == junction || link.toNode == junction) {
						invalid = true;
						break;
					}
				}
			}
			
			if (invalid)
				continue;
			
			// test each link. if none intersect, this is a possibility
			invalid = false;
			for (let j=0; j<this.links.length; j++) {
				let link = this.links[j];
				if (link.intersectsLine(fromNode.pos, node.pos)) {
					invalid = true;
					break;
				}
			}
			
			if (invalid)
				continue;
			
			possibleToNodes.push(node);
		}
		
		if (possibleToNodes.length == 0)
			return; // no valid, unobscured links from this node
		
		// pick a possibility & add a link
		let toNode = possibleToNodes[randomInt(possibleToNodes.length)];
		let newLink = new Link(fromNode, toNode);
		this.links.push(newLink);
    }
    
	appendNode(weight: number) {
		// randomly pick a node to branch off of with a new node
		let node = this.nodes[randomInt(this.nodes.length)];
		
		let newNode = new Node(this, node.pos.createAdjacent(), weight);
		this.nodes.push(newNode);
		
		let newLink = new Link(node, newNode);
		this.links.push(newLink);
    }
    
	branchNode(weight: number) {
		let junction = this.insertNode(5);
		junction.nodeType = NodeType.Junction;
				
		let newNode = new Node(this, junction.pos.createAdjacent(), weight);
		this.nodes.push(newNode);
		
		let newLink = new Link(junction, newNode);
		this.links.push(newLink);
    }
    
	switchToGrid() {
		//this.canvas.setAttribute('width', (this.grid.length * this.scale).toString());
		//this.canvas.setAttribute('height', (this.grid[0].length * this.scale).toString());
		//this.canvas.style.border = 'solid red 1px';
		this.drawGrid = true;
		
		// populate the grid with blank tiles
		this.width = this.grid.length; this.height = this.grid[0].length;
		for (let x=0; x<this.width; x++)
			for (let y=0; y<this.height; y++)
				this.grid[x][y] = new Tile(x, y);

		// link up the nodes to the tiles that they touch
		for (let i=0; i<this.nodes.length; i++) {
			let node = this.nodes[i];
			if (node.nodeType == NodeType.Junction)
				continue;
			
			for (let x=node.pos.x - 1; x<=node.pos.x; x++)
				for (let y=node.pos.y - 1; y<=node.pos.y; y++)
					this.grid[x][y].node = node;
		}
		
		if (this.animated) {
			this.redraw();
			
			// animate nodes changing from circles to squares. The squares are already drawing, so just shrink the circles
			return new Promise((resolve, reject) => {
				let num = 0, animSteps = 20;
				this.intervalID = window.setInterval(() => {
					for (let i=0; i<this.nodes.length; i++) {
						this.nodes[i].radius *= 0.96;
					}					
					
					this.redraw();
					
					if (++num >= animSteps) {
                        if (this.intervalID !== null) {
                            window.clearInterval(this.intervalID);
                        }
						this.drawNodeGraph = false;
						resolve();
					}
				}, 50);
			});
		}
		else {
			this.drawNodeGraph = false;
			return Promise.resolve();
		}
    }
    
	joinLinksToTiles() {
		// associate each tile of the grid with all of the links that overlap or touch it
		// this is Xiaolin Wi's algorithm, without the antialiasing.
		for (let i=0; i<this.links.length; i++) {
			let link = this.links[i];
			let x0 = link.fromNode.pos.x, x1 = link.toNode.pos.x;
			let y0 = link.fromNode.pos.y, y1 = link.toNode.pos.y;
			
			this.grid[x0][y0].links.push(link);
			this.grid[x0 - 1][y0].links.push(link);
			this.grid[x0][y0 - 1].links.push(link);
			this.grid[x0 - 1][y0 - 1].links.push(link);
			
			this.grid[x1][y1].links.push(link);
			this.grid[x1 - 1][y1].links.push(link);
			this.grid[x1][y1 - 1].links.push(link);
			this.grid[x1 - 1][y1 - 1].links.push(link);
			
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
					if (!almostInteger)
						this.grid[iY - closestSideStep][x].links.push(link);
				}
				else {
					this.grid[x][iY + closestSideStep].links.push(link);
					this.grid[x][iY].links.push(link);
					if (!almostInteger)
						this.grid[x][iY - closestSideStep].links.push(link);
				}
				
				y += gradient;
			}
		}
		
		if (this.animated) {
			return new Promise((resolve, reject) => {
				this.redraw();
				this.intervalID = window.setTimeout(() => {
					resolve();
				}, 1000);
			});
		}
		else
			return Promise.resolve();
    }
    
	growRooms() {
		// TODO: implement - expand rooms, by 1 row/col at a time, according to their weights
		return Promise.resolve();
    }
	
	redraw() {
		let info = this.getRenderInfo();
		// TODO: requestAnimationFrame?
		this.draw(info.ctx, info.width, info.height);
	}

	draw(ctx: CanvasRenderingContext2D, width: number, height: number) {
		ctx.clearRect(0, 0, width, height);
		
		if (this.drawGrid) {
			for (let x=0; x<this.width; x++)
				for (let y=0; y<this.height; y++)
					this.grid[x][y].drawFill(ctx, this.scale);
		}
		
		if (this.drawNodeLinks)
			for (let i=0; i<this.links.length; i++)
				this.links[i].draw(ctx, this.scale);

		if (this.drawNodeGraph)
			for (let i=0; i<this.nodes.length; i++)
				this.nodes[i].draw(ctx, this.scale);
		
		if (this.drawGrid) {
			ctx.strokeStyle = 'rgba(200,200,200,0.5)';
			ctx.beginPath();
			for (let x=0; x<this.width; x++) {
				ctx.moveTo(x * this.scale, 0);
				ctx.lineTo(x * this.scale, this.height * this.scale);
			}
			for (let y=0; y<this.height; y++) {
				ctx.moveTo(0, y * this.scale);
				ctx.lineTo(this.width * this.scale, y * this.scale);
			}
			ctx.stroke();
		}
    }
}