import { Coord } from '../model/Coord';

export function getClosest<TNode extends Coord<TNode>>(
    point: Coord<TNode>,
    nodes: TNode[],
) {
    let bestDist = Number.MAX_VALUE;
    let bestNode: TNode | null = null;

    for (const node of nodes) {
        const dist = point.distanceSqTo(node);
        if (dist < bestDist) {
            bestDist = dist;
            bestNode = node;
        }
    }

    return bestNode;
}