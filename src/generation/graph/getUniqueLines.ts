import { Coord } from '../../model/generic/Coord';
import { Line } from '../../model/generic/Line';
import { Polygon } from '../../model/generic/Polygon';

export function getUniqueLines<TNode extends Coord<TNode>, TLine extends Line<TNode>>
(
    polygons: Polygon<TNode>[], 
    createLine: (from: TNode, to: TNode) => TLine
) {
    const allLines: TLine[] = [];

    // Convert polygons to UNIQUE lines, ignoring their direction.
    for (const polygon of polygons) {
        for (let i = 1; i < polygon.vertices.length; i++) {
            const v0 = polygon.vertices[i - 1];
            const v1 = polygon.vertices[i];

            const isDuplicate = allLines.some(l => l.from === v0 && l.to === v1 || l.from === v1 && l.to === v0);
            if (!isDuplicate) {
                allLines.push(createLine(v0, v1));
            }
        }
    }

    return allLines;
}