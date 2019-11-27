import { Coord } from '../model/Coord';

export function getClosest<TNode extends Coord<TNode>>(
    point: Coord<TNode>,
    nodes: TNode[],
    getDistance: (node: TNode, point: Coord<TNode>) => number = (node, point) => point.distanceSqTo(node),
) {
    let bestDist = Number.MAX_VALUE;
    let bestNode: TNode | null = null;

    for (const node of nodes) {
        const dist = getDistance(node, point);
        if (dist < bestDist) {
            bestDist = dist;
            bestNode = node;
        }
    }

    return bestNode;
}