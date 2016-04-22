"use strict";

function randomInt(length) {
	return Math.floor(Math.random() * length);
}

function lerp(val1, val2, fraction) {
  return (1-fraction)*val1 + fraction*val2;
}

function crossProduct(pos1, pos2) {
	return pos1.x * pos2.y - pos1.y * pos2.x;
}

function allEqual(args) {
	var firstValue = args[0];
	for (var i = 1; i < args.length; i += 1) {
		if (args[i] != firstValue) {
			return false;
		}
	}
	return true;
}

function Coord(x, y) {
	this.x = x;
	this.y = y;
}

Coord.prototype = {
	constructor: Coord,
	magnitudeOf: function (dx, dy) {
		return Math.sqrt(dx * dx + dy * dy);
	},
	length: function () {
		return this.magnitudeOf(this.x, this.y);
	},
	equals: function (other) {
		return this.x == other.x && this.y == other.y;
	},
	subtract: function (other) {
		return new Coord(this.x - other.x, this.y - other.y);
	},
	toUnitLength: function () {
		var length = this.length();
		return new Coord(this.x / length, this.y / length);
	},
	distanceTo: function (other) {
		return this.magnitudeOf(this.x - other.x, this.y - other.y);
	},
	directionTo: function (other) {
		var dx = other.x - this.x;
		var dy = other.y - this.y;
		
		var length = this.magnitudeOf(dx, dy);
		return new Coord(dx / length, dy / length);
	},
	halfwayTo: function (other) {
		return new Coord((this.x + other.x) / 2, (this.y + other.y) / 2);
	},
	createAdjacent: function (other) {
		var pick = randomInt(8);
		var dx, dy;
		
		switch (pick) {
		case 0:
		case 3:
		case 5:
			dx = -2;
		case 1:
		case 6:
			dx = 0;
		case 2:
		case 4:
		case 7:
			dx = 2;
		}
		
		switch (pick) {
		case 0:
		case 1:
		case 2:
			dy = -2;
		case 3:
		case 4:
			dy = 0;
		case 5:
		case 6:
		case 7:
			dy = 2;
		}
		
		return new Coord(this.x + dx, this.y + dy);
	},
	applyOffset: function (other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	},
	scale: function (scale) {
		this.x *= scale;
		this.y *= scale;
		return this;
	}
}

function Node(parent, pos) {
	this.parent = parent;
	this.pos = pos;
	this.radius = 1.5;
	this.links = [];
}

Node.prototype = {
	constructor: Node,
	calculateForce: function () {
		var force = new Coord(0, 0);
		/*
		// treat each link like a spring. if its length is too short, push away.
		// if its length is too long, pull apart
		for (var i=0; i<this.links.length; i++) {
			var link = this.links[i];
			var scalarComponent = link.springConstant * link.getDistanceFromRest();
			var otherNode = link.fromNode == this ? link.toNode : link.fromNode;
			
			var componentForce = this.pos.directionTo(otherNode.pos).scale(scalarComponent);
			
			force.applyOffset(componentForce);
		}
		*/
		var forceCutoffDist = 8, nodeRepulsionForce = 1, linkRepulsionForce = 0.3;
		
		// push away from any other node that is too close
		for (var i=0; i<this.parent.nodes.length; i++) {
			var otherNode = this.parent.nodes[i];
			if (otherNode == this)
				continue;
			
			var dist = this.pos.distanceTo(otherNode.pos);
			if (dist > forceCutoffDist)
				continue;

			var scalarComponent = nodeRepulsionForce / dist / dist;
			var componentForce = this.pos.directionTo(otherNode.pos).scale(-scalarComponent);
			
			force.applyOffset(componentForce);
		}
		
		// push away from links you don't connect with ... tangentially
		for (var i=0; i<this.parent.links.length; i++) {
			var link = this.parent.links[i];
			
			if (link.fromNode == this || link.toNode == this)
				continue;
			
			var dist = this.distanceFromLink(link);
			if (dist > forceCutoffDist || dist == 0)
				continue;
			
			var scalarComponent = linkRepulsionForce / dist / dist;
			
			var linkDir = link.toNode.pos.subtract(link.fromNode.pos).toUnitLength();
			var perpDir = new Coord(linkDir.y, -linkDir.x);
			
			// is this pointed towards the link? If so, need to reverse it.
			var compareTo = this.pos.subtract(link.fromNode.pos).toUnitLength();
			if (compareTo.x * perpDir.x + compareTo.y * perpDir.y < 0) {
				perpDir.x = -perpDir.x;
				perpDir.y = -perpDir.y;
			}
			
			var componentForce = perpDir.scale(scalarComponent);
			force.applyOffset(componentForce);
		}
		
		// prevent any enormous forces from being created
		var forceLimit = 5;
		if (force.length() > forceLimit) {
			force = force.toUnitLength();
			force.x *= forceLimit;
			force.y *= forceLimit;
		}
		
		return force;
	},
	distanceFromLink: function (link) {
		var A = this.pos.x - link.fromNode.pos.x;
		var B = this.pos.y - link.fromNode.pos.y;
		var C = link.toNode.pos.x - link.fromNode.pos.x;
		var D = link.toNode.pos.y - link.fromNode.pos.y;

		var dot = A * C + B * D;
		var len_sq = C * C + D * D;
		var param = -1;
		if (len_sq != 0) //in case of 0 length line
			param = dot / len_sq;

		var xx, yy;

		if (param < 0) {
			xx = link.fromNode.pos.x;
			yy = link.fromNode.pos.y;
		}
		else if (param > 1) {
			xx = link.toNode.pos.x;
			yy = link.toNode.pos.y;
		}
		else {
			xx = link.fromNode.pos.x + param * C;
			yy = link.fromNode.pos.y + param * D;
		}

		var dx = this.pos.x - xx;
		var dy = this.pos.y - yy;
		return Math.sqrt(dx * dx + dy * dy);
	},
	draw: function (ctx, scale) {
		ctx.fillStyle = '#c00';
		
		ctx.beginPath();
		ctx.arc(this.pos.x * scale, this.pos.y * scale, scale * this.radius, 0, 2*Math.PI);
		ctx.fill();
	}
};

function Link(fromNode, toNode, length) {
	this.fromNode = fromNode;
	this.toNode = toNode;
	this.restLength = length === undefined ? Math.random() * 10 + 5 : length;
	this.springConstant = 0.1;
	
	fromNode.links.push(this);
	toNode.links.push(this);
}

Link.prototype = {
	constructor: Link,
	getDistanceFromRest: function () {
		return this.fromNode.pos.distanceTo(this.toNode.pos) - this.restLength;
	},
	intersectsLine: function (pos1, pos2) {
		var r = this.toNode.pos.subtract(this.fromNode.pos);
		var s = pos2.subtract(pos1);

		var uNumerator = crossProduct(pos1.subtract(this.fromNode.pos), r);
		var denominator = crossProduct(r, s);

		if (uNumerator == 0 && denominator == 0) {
			// They are colinear
			
			// Do they touch? (Are any of the points equal?)
			if (this.fromNode.pos.equals(pos1) || this.fromNode.pos.equals(pos2) || this.toNode.pos.equals(pos1) || this.toNode.pos.equals(pos2)) {
				return true;
			}
			
			// Do they overlap? (Are all the point differences in either direction the same sign)
			return !allEqual(
					(node1.x - this.fromNode.x < 0),
					(node1.x - this.toNode.x < 0),
					(node2.x - this.fromNode.x < 0),
					(node2.x - this.toNode.x < 0)) ||
				!allEqual(
					(node1.y - this.fromNode.y < 0),
					(node1.y - this.toNode.y < 0),
					(node2.y - this.fromNode.y < 0),
					(node2.y - this.toNode.y < 0));
		}

		if (denominator == 0) {
			// lines are parallel
			return false;
		}

		var u = uNumerator / denominator;
		var t = crossProduct(pos1.subtract(this.fromNode.pos), s) / denominator;
		return t > 0 && t < 1 && u > 0 && u < 1;
	},
	draw: function (ctx, scale) {
		ctx.strokeStyle = '#000';
		
		ctx.beginPath();
		ctx.moveTo(this.fromNode.pos.x * scale, this.fromNode.pos.y * scale);
		ctx.lineTo(this.toNode.pos.x * scale, this.toNode.pos.y * scale);
		ctx.stroke();
	}
};

function Dungeon(container, animated) {
	this.root = container;
	this.root.innerHTML = '<canvas></canvas>';
	this.canvas = this.root.childNodes[0];
	this.scale = 10;
	this.intervalID = null;
	this.animated = animated;
		
	var node1 = new Node(this, new Coord(20, 20));
	var node2 = new Node(this, new Coord(20, 30));
	var node3 = new Node(this, new Coord(30, 20));
	
	this.nodes = [node1, node2, node3];
	
	var link1 = new Link(node1, node2);
	var link2 = new Link(node1, node3);
	
	this.links = [link1, link2];
	
	this.resizeListener = this.updateSize.bind(this);
	window.addEventListener('resize', this.resizeListener);
	
	this.updateSize();
	this.generate();
}

Dungeon.prototype = {
	constructor: Dungeon,
	destroy: function () {
		window.removeEventListener('resize', this.resizeListener);
		
		if (this.intervalID !== null)
			window.clearInterval(this.intervalID);
	},
	updateSize: function () {
		this.canvas.setAttribute('width', this.root.offsetWidth);
		this.canvas.setAttribute('height', this.root.offsetHeight);
		
		this.draw();
	},
	generate: function () {
		this.intervalID = null;
		
		var sequence = this.populateNodes()
			.then(function() { return this.alignNodes() }.bind(this))
			.then(function() { return this.fitOnScreen() }.bind(this));
		
		// TODO: expand nodes & links to take up actual volumes
		
		if (!this.animated)
			sequence = sequence.then(function () {
				this.draw();
			}.bind(this));
	},
	populateNodes: function () {
		var numNodeAddSteps = parseInt(document.getElementById('numSteps').value);
		
		var addNodeStep = function () {
			this.addNode();
			if (this.animated)
				this.draw();
			
			return this.settleNodes(20, true);
		}.bind(this);
		
		var sequence = this.settleNodes(10, this.animated);
		for (var i=0; i<numNodeAddSteps; i++) 
			sequence = sequence.then(addNodeStep);
		
		sequence = sequence.then(function () {
			return this.settleNodes(100, true);
		}.bind(this));
		
		return sequence;
	},
	settleNodes: function (settleSteps, canFinishEarly) {
		var settledStepSizeLimit = 0.01;
		
		if (this.animated)
			return new Promise(function (resolve, reject) {
				var num = 0;
				this.intervalID = window.setInterval(function () {
					var finishEarly = this.repositionNodes() <= settledStepSizeLimit;
					this.draw();
					
					if ((canFinishEarly && finishEarly) || ++num >= settleSteps) {
						window.clearInterval(this.intervalID);
						resolve();
					}
				}.bind(this), 50);
			}.bind(this));
		else
			return new Promise(function (resolve, reject) {
				for (var i=0; i<settleSteps; i++)
					if (this.repositionNodes() <= settledStepSizeLimit)
						break;
				resolve();
			}.bind(this));
	},
	repositionNodes: function () {
		// add up all the forces on each node, and then apply them
		var biggestForce = 0;
		
		for (var i=0; i<this.nodes.length; i++) {
			var node = this.nodes[i];
			node.force = node.calculateForce();
			
			var size = node.force.length();
			if (size > biggestForce)
				biggestForce = size;
		}
		
		for (var i=0; i<this.nodes.length; i++) {
			var node = this.nodes[i];
			node.pos.applyOffset(node.force);
			delete node.force;
		}
		
		return biggestForce;
	},
	alignNodes: function () {
		// align nodes to integer coordinates
		if (this.animated)
			return new Promise(function (resolve, reject) {
				var num = 0, lerpSteps = 20;
				this.intervalID = window.setInterval(function () {
					num++;
					var fraction = num / lerpSteps;
					for (var i=0; i<this.nodes.length; i++) {
						var node = this.nodes[i];
						node.pos.x = lerp(node.pos.x, Math.round(node.pos.x), fraction);
						node.pos.y = lerp(node.pos.y, Math.round(node.pos.y), fraction);
					}
					this.draw();
					
					if (num >= lerpSteps) {
						window.clearInterval(this.intervalID);
						resolve();
					}
				}.bind(this), 50);
			}.bind(this));
		else
			return new Promise(function (resolve, reject) {
				for (var i=0; i<this.nodes.length; i++) {
					var node = this.nodes[i];
					node.pos.x = Math.round(node.pos.x);
					node.pos.y = Math.round(node.pos.y);
				}
				resolve();
			}.bind(this));
	},
	fitOnScreen: function() {
		return new Promise(function (resolve, reject) {
			var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE;
			for (var i=0; i<this.nodes.length; i++) {
					var node = this.nodes[i];
					minX = Math.min(minX, node.pos.x);
					minY = Math.min(minY, node.pos.y);
				}
			minX -= 10;
			minY -= 10;
			
			if (this.animated) {
				var num = 0, lerpSteps = 20;
				var stepX = -minX / lerpSteps, stepY = -minY / lerpSteps;
				this.intervalID = window.setInterval(function () {
					for (var i=0; i<this.nodes.length; i++) {
						var node = this.nodes[i];
						node.pos.x += stepX;
						node.pos.y += stepY;
						this.draw();
					}
					if (++num >= lerpSteps) {
						window.clearInterval(this.intervalID);
						resolve();
					}
				}.bind(this), 50);
			}
			else {
				for (var i=0; i<this.nodes.length; i++) {
					var node = this.nodes[i];
					node.pos.x -= minX;
					node.pos.y -= minY;
				}
				resolve();
			}
		}.bind(this));
	},
	addNode: function () {
		var insertChance = parseInt(document.getElementById('chanceInsert').value);
		var joinChance = parseInt(document.getElementById('chanceJoin').value);
		var appendChance = parseInt(document.getElementById('chanceAppend').value);
		
		var random = randomInt(insertChance + joinChance + appendChance);
		
		if (random < insertChance)
			this.insertNode();
		else if (random < joinChance + insertChance)
			this.joinNodes();
		else
			this.appendNode();
	},
	insertNode: function () {
		// randomly pick a link to interrupt with a new node
		var link = this.links[randomInt(this.links.length)];
		
		var newNode = new Node(this, link.fromNode.pos.halfwayTo(link.toNode.pos));
		this.nodes.push(newNode);
		
		var newLink = new Link(newNode, link.toNode);
		this.links.push(newLink);
		
		link.toNode = newNode;
	},
	joinNodes: function () {
		// pick two nodes
		var fromNode = this.nodes[randomInt(this.nodes.length)];
		
		var possibleToNodes = [];
		for (var i=0; i<this.nodes.length; i++) {
			var node = this.nodes[i];
			if (node === fromNode)
				continue;
			
			// if already linked, don't do it twice
			var invalid = false;
			for (var j=0; j<fromNode.links.count; j++) {
				var link = fromNode.links[j];
				if (link.toNode === node || link.fromNode === node) {
					invalid = true;
					break;
				}
			}
			
			if (invalid)
				continue;
			
			// test each link. if none intersect, this is a possibility
			invalid = false;
			for (var j=0; j<this.links.length; j++) {
				var link = this.links[j];
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
		var toNode = possibleToNodes[randomInt(possibleToNodes.length)];
		var newLink = new Link(fromNode, toNode);
		this.links.push(newLink);
	},
	appendNode: function () {
		// randomly pick a node to branch off of with a new node
		var node = this.nodes[randomInt(this.nodes.length)];
		
		var newNode = new Node(this, node.pos.createAdjacent());
		this.nodes.push(newNode);
		
		var newLink = new Link(node, newNode);
		this.links.push(newLink);
	},
	draw: function () {
		var ctx = this.canvas.getContext('2d');
		ctx.clearRect(0, 0, this.root.offsetWidth, this.root.offsetHeight);
		
		for (var i=0; i<this.links.length; i++) {
			this.links[i].draw(ctx, this.scale);
		}
		
		for (var i=0; i<this.nodes.length; i++) {
			this.nodes[i].draw(ctx, this.scale);
		}
	}
}

var dungeon = null;
function createDungeon(animated) {
	if (dungeon != null)
		dungeon.destroy();
		
	dungeon = new Dungeon(document.getElementById('mapRoot'), animated);
}