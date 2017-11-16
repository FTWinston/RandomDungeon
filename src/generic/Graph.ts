import { Coord } from './Coord';
import { Line } from './Line';

class Triangle<TNode extends Coord<TNode>> {
    constructor(readonly vertices: [TNode, TNode, TNode]) {
        let circumCircle = vertices[0].circumCircle(vertices[1], vertices[2]);

        this.circumCenter = circumCircle[0];
        this.circumRadiusSq = circumCircle[1];
    }

    circumCenter: Coord<TNode>;
    circumRadiusSq: number;
}

export abstract class Graph<TNode extends Coord<TNode>, TLine extends Line<TNode>> {
    nodes: TNode[] = [];
    lines: TLine[] = [];

    computeDelauneyTriangulation(superTriangle: [TNode, TNode, TNode], createLine: (from: TNode, to: TNode) => TLine) {
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

            // find the boundary of polygonal hole formed by these "bad" triangles
            // ...get the edges of the "bad" triangles which don't touch other bad triangles. Each pair of nodes here represents a line.
            let polygon: TNode[] = [];
            for (let triangle of badTriangles) {
                for (let i=0; i<3; i++) {
                    let edgeFrom = triangle.vertices[i];
                    let edgeTo = triangle.vertices[i == 2 ? 0 : i + 1];

                    let sharedWithOther = false;
                    for (let other of badTriangles) {
                        if (other !== triangle && other.vertices.indexOf(edgeFrom) !== -1 && other.vertices.indexOf(edgeTo) !== -1) {
                            sharedWithOther = true;
                            break;
                        }
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
            for (let i=0; i<polygon.length - 1; i+=2) {
                let triangle = new Triangle<TNode>([polygon[i], polygon[i+1], node]);
                triangulation.push(triangle);
            }
        }

        // remove all triangles that contain a vertex from the original super-triangle
        for (let i=0; i<triangulation.length; i++) {
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
                    }
                    else if (link.to === v2) {
                        thirdDuplicate = true;
                    }
                }
                else if (link.from === v1) {
                    if (link.to === v0) {
                        firstDuplicate = true;
                    }
                    else if (link.to === v2) {
                        secondDuplicate = true;
                    }
                }
                else if (link.from === v2) {
                    if (link.to === v0) {
                        thirdDuplicate = true;
                    }
                    else if (link.to === v1) {
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

    private insideCircumcircle(point: TNode, triangle: Triangle<TNode>) {
        let distSq = point.distanceSqTo(triangle.circumCenter);
        return distSq <= triangle.circumRadiusSq;
    }

    computeGabrielGraph(links: TLine[]) {
        links = (links === undefined ? this.lines : links).slice();

        let graphLinks: TLine[] = [];

        // TODO: compute

        return graphLinks;
    }

    computeRelativeNeighbourhoodGraph(links: TLine[]) {
        links = (links === undefined ? this.lines : links).slice();

        let graphLinks: TLine[] = [];

        // TODO: compute

        return graphLinks;
    }

    computeMinimumSpanningTree(links: TLine[]) {
        links = (links === undefined ? this.lines : links).slice();

        let graphLinks: TLine[] = [];

        // TODO: compute

        return graphLinks;
    }
}