"use strict";

function randomInt(length) {
	return Math.floor(Math.random() * length);
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
	length: function() {
		return this.magnitudeOf(this.x, this.y);
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
	createAdjacent: function(other) {
		var pick = randomInt(8);
		var dx, dy;
		
		switch (pick) {
		case 0:
		case 3:
		case 5:
			dx = -1;
		case 1:
		case 6:
			dx = 0;
		case 2:
		case 4:
		case 7:
			dx = 1;
		}
		
		switch (pick) {
		case 0:
		case 1:
		case 2:
			dy = -1;
		case 3:
		case 4:
			dy = 0;
		case 5:
		case 6:
		case 7:
			dy = 1;
		}
		
		return new Coord(this.x + dx, this.y + dy);
	},
	applyOffset: function(other) {
		this.x += other.x;
		this.y += other.y;
		return this;
	},
	scale: function(scale) {
		this.x *= scale;
		this.y *= scale;
		return this;
	}
}

function Node(parent, pos) {
	this.parent = parent;
	this.pos = pos;
	this.radius = 0.15;
	this.links = [];
}

Node.prototype = {
	constructor: Node,
	calculateForce: function () {
		var force = new Coord(0, 0);
		
		// treat each link like a spring. if its length is too short, push away.
		// if its length is too long, pull apart
		for (var i=0; i<this.links.length; i++) {
			var link = this.links[i];
			var scalarComponent = link.springConstant * link.getDistanceFromRest();
			var otherNode = link.fromNode == this ? link.toNode : link.fromNode;
			
			var componentForce = this.pos.directionTo(otherNode.pos).scale(scalarComponent);
			
			force.applyOffset(componentForce);
		}
		
		var forceCutoffDist = 0.8, nodeRepulsionForce = 0.001, linkRepulsionForce = 0.0005;
		
		// additionally, push away from any other node that is too close
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
		
		// if a node is touching a link it doesn't connect with, push away
		for (var i=0; i<this.parent.links.length; i++) {
			var link = this.parent.links[i];
			
			if (link.fromNode == this || link.toNode == this)
				continue;
			
			var dist = this.distanceFromLink(link);
			if (dist > forceCutoffDist)
				continue;
			
			var midpoint = link.fromNode.pos.halfwayTo(link.toNode.pos);
			var scalarComponent = linkRepulsionForce / dist / dist;
			var componentForce = this.pos.directionTo(midpoint).scale(-scalarComponent);
			
			force.applyOffset(componentForce);
		}
		
		// ought to apply dampening to the calculated force now, which should be proportional to velocity
		// however, things look good without it - so is this really necessary?
		
		// prevent any enormous forces from being created
		var forceLimit = 2, forceMagnitude = force.length();
		if (forceMagnitude > forceLimit) {
			force.x *= forceLimit / forceMagnitude;
			force.y *= forceLimit / forceMagnitude;
		}
		
		return force;
	},
	distanceFromLink: function(link) {
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
	draw: function(ctx, scale) {
		ctx.fillStyle = '#c00';
		
		ctx.beginPath();
		ctx.arc(this.pos.x * scale + scale, this.pos.y * scale + scale, scale * this.radius, 0, 2*Math.PI);
		ctx.fill();
	}
};

function Link(fromNode, toNode) {
	this.fromNode = fromNode;
	this.toNode = toNode;
	this.restLength = 1;
	this.springConstant = 0.1;
	
	fromNode.links.push(this);
	toNode.links.push(this);
}

Link.prototype = {
	constructor: Link,
	getDistanceFromRest: function () {
		return this.fromNode.pos.distanceTo(this.toNode.pos) - this.restLength;
	},
	draw: function(ctx, scale) {
		ctx.strokeStyle = '#000';
		
		ctx.beginPath();
		ctx.moveTo(this.fromNode.pos.x * scale + scale, this.fromNode.pos.y * scale + scale);
		ctx.lineTo(this.toNode.pos.x * scale + scale, this.toNode.pos.y * scale + scale);
		ctx.stroke();
	}
};

function Dungeon(container, animated) {
	this.root = container;
	this.root.innerHTML = '<canvas></canvas>';
	this.canvas = this.root.childNodes[0];
	this.scale = 100;
	this.intervalID = null;
	this.animated = animated;
		
	var node1 = new Node(this, new Coord(0, 0));
	var node2 = new Node(this, new Coord(0, 1));
	var node3 = new Node(this, new Coord(1, 0));
	
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
	destroy: function() {
		window.removeEventListener('resize', this.resizeListener);
		
		if (this.intervalID !== null)
			window.clearInterval(this.intervalID);
	},
	updateSize: function() {
		this.canvas.setAttribute('width', this.root.offsetWidth);
		this.canvas.setAttribute('height', this.root.offsetHeight);
		
		this.draw();
	},
	generate: function() {
		this.intervalID = null;
		
		var sequence = this.populateNodes();
		
		// TODO: align nodes to integer coordinates
		
		// TODO: reposition to fit on screen
		
		// TODO: expand nodes & links to take up actual volumes
		
		if (!this.animated)
			sequence = sequence.then(function () {
				this.draw();
			}.bind(this));
	},
	populateNodes: function() {
		var numNodeAddSteps = randomInt(8) + 5;
		
		var addNodeStep = function() {
			this.addNode();
			if (this.animated)
				this.draw();
			
			return this.settleNodes(20);
		}.bind(this);
		
		var sequence = Promise.resolve();
		for (var i=0; i<numNodeAddSteps; i++) 
			sequence = sequence.then(addNodeStep);
		
		sequence = sequence.then(function () {
			return this.settleNodes(100);
		}.bind(this));
		
		return sequence;
	},
	settleNodes: function (settleSteps) {
		var settledStepSizeLimit = 0.01;
		
		if (this.animated)
			return new Promise(function(resolve, reject) {
				var num = 0;
				this.intervalID = window.setInterval(function () {
					var finishEarly = this.repositionNodes() <= settledStepSizeLimit;
					this.draw();
					
					if (finishEarly || ++num >= settleSteps) {
						window.clearInterval(this.intervalID);
						resolve();
					}
				}.bind(this), 50);
			}.bind(this));
		else
			return new Promise(function(resolve, reject) {
				for (var i=0; i<settleSteps; i++)
					if (this.repositionNodes() <= settledStepSizeLimit) {
						console.log('settled early, after ' + (i+1) + '/' + (settleSteps+1) + ' steps');
						break;
					}
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
		var toNode;
		do {
			toNode = this.nodes[randomInt(this.nodes.length)];
		} while (toNode == fromNode);
		
		// if they're already linked, just do nothing
		for (var i=0; i<fromNode.links.length; i++) {
			var link = fromNode.links[i];
			if (link.toNode === toNode || link.fromNode === toNode) {
				return;
			}
		}
		
		// otherwise, add a link between them.
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