import { Coord } from '../model/Coord';
import { Triangle } from '../model/Triangle';
import { Polygon } from '../model/Polygon';

export class Cell<TNode extends Coord<TNode>> extends Polygon<TNode> {
    constructor(public center: TNode, vertices: TNode[]) {
        super(vertices);
    }
}

export function computeVoronoiCells<TNode extends Coord<TNode>>(
    nodes: TNode[],
    triangles: Triangle<TNode>[]
) {
    if (triangles.length === 0) {
        return [];
    }

    return nodes.map(node => {
        // Firstly, get all triangles that have this vertex.
        const unsortedTriangles = triangles
            .filter(t => t.vertices.indexOf(node) !== -1);

        // Then sort these triangles so we iterate through them in order, otherwise the vertices would be out of sync.
        let lastTriangle = unsortedTriangles.pop()!;
        const sortedTriangles = [lastTriangle];

        while (unsortedTriangles.length > 0) {
            const firstIsCenter = lastTriangle.vertices[0] === node;
            
            // Each triangle should share a vertex with the previous triangle. (All will share the central vertex.)
            const v1 = lastTriangle.vertices[firstIsCenter ? 1 : 0];
            const v2 = firstIsCenter
                ? lastTriangle.vertices[2]
                : lastTriangle.vertices[1] === node ? lastTriangle.vertices[2] : lastTriangle.vertices[1];
            
            const nextIndex = unsortedTriangles.findIndex(
                t => t.vertices.indexOf(v1) !== -1 || t.vertices.indexOf(v2) !== -1
            );
            lastTriangle = unsortedTriangles.splice(nextIndex, 1)[0];

            sortedTriangles.push(lastTriangle);
        }
        
        // The vertices of the voronoi cell are the circumcentres of each triangle that shares its central vertex.
        const vertices = sortedTriangles
            .map(t => t.circumCenter);

        return new Cell(node, vertices);
    });
}