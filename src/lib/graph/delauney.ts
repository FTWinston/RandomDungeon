import { Coord } from '../model/Coord';
import { Triangle } from '../model/Triangle';

export function computeDelauneyTriangulation<TNode extends Coord<TNode>>(
    nodes: TNode[],
    superTriangle: [TNode, TNode, TNode]
) {
    if (nodes.length < 3) {
        return [];
    }

    // https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm
    let triangulation: Triangle<TNode>[] = [];
    triangulation.push(new Triangle(superTriangle));

    for (let node of nodes) {
        // find all triangles that are no longer valid due to this node's insertion
        let badTriangles: Triangle<TNode>[] = [];
        for (let triangle of triangulation) {
            if (insideCircumcircle(node, triangle)) {
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

    return triangulation;
}

function insideCircumcircle<TNode extends Coord<TNode>>(
    point: TNode,
    triangle: Triangle<TNode>
) {
    let distSq = point.distanceSqTo(triangle.circumCenter);
    return distSq <= triangle.circumRadiusSq;
}