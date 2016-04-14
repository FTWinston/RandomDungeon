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
	distanceSquared: function (other) {
		return (this.x - other.x) * (this.x - other.x)
			 + (this.y - other.y) * (this.y - other.y);
	},
	directionTo: function (other) {
		return new Coord(other.x - this.x, other.y - this.y);
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
	applyOffset(other) {
		this.x += other.x;
		this.y += other.y;
	}
}

function Node(parent, pos) {
	this.parent = parent;
	this.pos = pos;
	this.links = [];
}

Node.prototype = {
	constructor: Node,
	calculateForce: function () {
		var force = new Coord(0, 0);
		
		// treat each link like a spring. if its length is less than 2, push away.
		// if its length is more than 4, pull apart
		for (var i=0; i<this.links.length; i++) {
			
		}
		
		// additionally, push away from any other node that is too close
		for (var i=0; i<this.parent.nodes.length; i++) {
			
		}
		
		return force;
	}
};

function Link(fromNode, toNode) {
	this.fromNode = fromNode;
	this.toNode = toNode;
	
	fromNode.links.push(this);
	toNode.links.push(this);
}

Link.prototype = {
	constructor: Link,
	something: function () {
		
	}
};

function Dungeon() {
	var node1 = new Node(this, new Coord(0, 0));
	var node2 = new Node(this, new Coord(0, 2));
	var node3 = new Node(this, new Coord(2, 0));
	
	this.nodes = [node1, node2, node3];
	
	var link1 = new Link(node1, node2);
	var link2 = new Link(node1, node3);
	
	this.links = [link1, link2];
	
	this.draw();
}

Dungeon.prototype = {
	constructor: Dungeon,
	addNode: function () {
		var insertChance = parseInt(document.getElementById('chanceInsert').value);
		var joinChance = parseInt(document.getElementById('chanceJoin').value);
		var appendChance = parseInt(document.getElementById('chanceAppend').value);
		
		var random = randomInt(insertChance + joinChance + appendChance);
		
		if (random < insertChance)
			this.insertNode();
		else if (random < joinChance)
			this.joinNode();
		else
			this.appendNode();
		
		this.draw();
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
		// pick two nodes that aren't already connected (?) and link them 
		// ...with just a link, or with two links and a node?
	},
	appendNode: function () {
		// randomly pick a node to branch off of with a new node
		var node = this.nodes[randomInt(this.nodes.length)];
		
		var newNode = new Node(this, node.pos.createAdjacent());
		this.nodes.push(newNode);
		
		var newLink = new Link(node, newNode);
		this.links.push(newLink);
	},
	reposition: function () {
		// add up all the forces on each node, and then apply them
		for (var i=0; i<this.nodes.length; i++) {
			var node = this.nodes[i];
			node.force = node.calculateForce();
		}
		
		for (var i=0; i<this.nodes.length; i++) {
			var node = this.nodes[i];
			node.pos.applyOffset(node.force);
			delete node.force;
		}
		
		this.draw();
	},
	draw: function () {
	
		// err... yeah. Canvas?
	}
}

var dungeon = new Dungeon();