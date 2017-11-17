import { Coord } from './Coord';
import { Line } from './Line';

class Triangle<TNode extends Coord<TNode>> {
    circumCenter: Coord<TNode>;
    circumRadiusSq: number;

    constructor(readonly vertices: [TNode, TNode, TNode]) {
        let circumCircle = vertices[0].circumCircle(vertices[1], vertices[2]);

        this.circumCenter = circumCircle[0];
        this.circumRadiusSq = circumCircle[1];
    }
}

export abstract class Graph<TNode extends Coord<TNode>, TLine extends Line<TNode>> {
    nodes: TNode[] = [];
    lines: TLine[] = [];

    computeDelauneyTriangulation(superTriangle: [TNode, TNode, TNode], createLine: (from: TNode, to: TNode) => TLine) {
        if (this.nodes.length === 2) {
            return [createLine(this.nodes[0], this.nodes[1])];
        }

        // https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm
        let triangulation: Triangle<TNode>[] = [];
        triangulation.push(new Triangle(superTriangle));

        for (let node of this.nodes) {
            // find all triangles that are no longer valid due to this node's insertion
            let badTriangles: Triangle<TNode>[] = [];
            for (let triangle of triangulation) {
                if (this.insideCircumcircle(node, triangle)) {
                    badTriangles.push(triangle);
                }
            }

            // Find the boundary of polygonal hole formed by these "bad" triangles...
            // Get the edges of the "bad" triangles which don't touch other bad triangles...
            // Each pair of nodes here represents a line.
            let polygon: TNode[] = [];
            for (let triangle of badTriangles) {
                for (let i = 0; i < 3; i++) {
                    let edgeFrom = triangle.vertices[i];
                    let edgeTo = triangle.vertices[i === 2 ? 0 : i + 1];

                    let sharedWithOther = false;
                    for (let other of badTriangles) {
                        if (other === triangle) {
                            continue;
                        }

                        if (other.vertices.indexOf(edgeFrom) === -1) {
                            continue;
                        }

                        if (other.vertices.indexOf(edgeTo) === -1) {
                            continue;
                        }

                        sharedWithOther = true;
                        break;
                    }

                    if (!sharedWithOther) {
                        polygon.push(edgeFrom, edgeTo);
                    }
                }
            }

            // discard all bad triangles
            for (let triangle of badTriangles) {
                triangulation.splice(triangulation.indexOf(triangle), 1);
            }

            // re-triangulate the polygonal hole ... create a new triangle for each edge
            for (let i = 0; i < polygon.length - 1; i += 2) {
                let triangle = new Triangle<TNode>([polygon[i], polygon[i + 1], node]);
                triangulation.push(triangle);
            }
        }

        // remove all triangles that contain a vertex from the original super-triangle
        for (let i = 0; i < triangulation.length; i++) {
            let triangle = triangulation[i];
            for (let vertex of triangle.vertices) {
                if (superTriangle.indexOf(vertex) !== -1) {
                    triangulation.splice(i, 1);
                    i--;
                    break;
                }
            }
        }

        let links: TLine[] = [];

        // convert triangles to UNIQUE lines
        for (let triangle of triangulation) {
            let v0 = triangle.vertices[0], v1 = triangle.vertices[1], v2 = triangle.vertices[2];            

            let firstDuplicate = false, secondDuplicate = false, thirdDuplicate = false;
            for (let link of links) {
                if (link.from === v0) {
                    if (link.to === v1) {
                        firstDuplicate = true;
                    } else if (link.to === v2) {
                        thirdDuplicate = true;
                    }
                } else if (link.from === v1) {
                    if (link.to === v0) {
                        firstDuplicate = true;
                    } else if (link.to === v2) {
                        secondDuplicate = true;
                    }
                } else if (link.from === v2) {
                    if (link.to === v0) {
                        thirdDuplicate = true;
                    } else if (link.to === v1) {
                        secondDuplicate = true;
                    }
                }
            }

            if (!firstDuplicate) {
                links.push(createLine(v0, v1));
            }
            if (!secondDuplicate) {
                links.push(createLine(v1, v2));
            }
            if (!thirdDuplicate) {
                links.push(createLine(v2, v0));
            }
        }

        return links;
    }

    computeGabrielGraph(links: TLine[] | undefined = undefined) {
        links = links === undefined ? this.lines : links;

        let graphLinks: TLine[] = [];

        for (let link of links) {
            let anyBlocking = false;
            let center = link.from.halfwayTo(link.to);
            let radiusSq = link.from.distanceSqTo(center);

            for (let node of this.nodes) {
                if (node === link.from || node === link.to) {
                    continue;
                }

                if (node.distanceSqTo(center) < radiusSq) {
                    anyBlocking = true;
                    break;
                }
            }

            if (!anyBlocking) {
                graphLinks.push(link);
            }
        }

        return graphLinks;
    }

    computeRelativeNeighbourhoodGraph(links: TLine[] | undefined = undefined) {
        links = links === undefined ? this.lines : links;

        let graphLinks: TLine[] = [];
        
        for (let link of links) {
            let anyBlocking = false;
            let lengthSq = link.from.distanceSqTo(link.to);

            for (let node of this.nodes) {
                if (node === link.from || node === link.to) {
                    continue;
                }

                if (node.distanceSqTo(link.from) < lengthSq && node.distanceSqTo(link.to) < lengthSq) {
                    anyBlocking = true;
                    break;
                }
            }

            if (!anyBlocking) {
                graphLinks.push(link);
            }
        }

        return graphLinks;
    }

    computeMinimumSpanningTree(links: TLine[] | undefined = undefined) {
        let unvisitedNodes = this.nodes.slice();
        let firstNode = unvisitedNodes.pop();
        if (firstNode === undefined) {
            return [];
        }
        
        links = links === undefined ? this.lines : links;
        let possibleLinks = links.map(l => { return { link: l, lengthSq: l.from.distanceSqTo(l.to) }; });
        possibleLinks.sort((a, b) => a.lengthSq - b.lengthSq);

        let visitedNodes: TNode[] = [firstNode];
        let graphLinks: TLine[] = [];

        while (unvisitedNodes.length > 0 && possibleLinks.length > 0) {
            // Find the first link that connects to a node in visitedNodes...
            // The links are sorted by length, so the first one will be the shortest one.
            for (let i = 0; i < possibleLinks.length; i++) {
                let testLink = possibleLinks[i].link;
                
                let alreadyHasFrom = visitedNodes.indexOf(testLink.from) !== -1;
                let alreadyHasTo = visitedNodes.indexOf(testLink.to) !== -1;

                // if it doesn't connect to the graph at all, discard it
                if (!alreadyHasFrom && !alreadyHasTo) {
                    continue;
                }

                possibleLinks.splice(i, 1);
                graphLinks.push(testLink);

                let addingNode = alreadyHasFrom ? testLink.to : testLink.from;
                
                // remove all other links from possibleLinks that connect addingNode to visitedNodes
                for (let j = i; j < possibleLinks.length; j++) {
                    testLink = possibleLinks[j].link;
                    if ((testLink.from === addingNode && visitedNodes.indexOf(testLink.to) !== -1)
                    || (testLink.to === addingNode && visitedNodes.indexOf(testLink.from) !== -1)) {
                        possibleLinks.splice(j, 1);
                        j--;
                    }
                }

                visitedNodes.push(addingNode);
                break;
            }
        }

        return graphLinks;
    }

    private insideCircumcircle(point: TNode, triangle: Triangle<TNode>) {
        let distSq = point.distanceSqTo(triangle.circumCenter);
        return distSq <= triangle.circumRadiusSq;
    }
}