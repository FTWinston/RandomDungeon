import { Dungeon } from '../model/Dungeon';
import { Room, RoomType } from '../model/Room';
import { Coord2D } from '../../lib/model/Coord';
import { Line } from '../../lib/model/Line';
import { Graph } from '../../lib/model/Graph';
import { SRandom } from '../../lib/SRandom';
import { DelaySize } from '../DungeonGenerator';

export async function populateNodes(
    dungeon: Dungeon,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    // Remove all nodes, then create nodeCount nodes. Using same seed ensures same ones are recreated.
    const random = new SRandom(seed);

    let makeNode = () => {
        let x = random.nextInRange(2, dungeon.width - 2);
        let y = random.nextInRange(2, dungeon.height - 2);
        return new Room(dungeon, x, y, random.nextIntInRange(0, RoomType.NUM_VALUES));
    };

    dungeon.nodes = [];
    for (let i = 0; i < dungeon.nodeCount; i++) {
        addSpacedNode(dungeon, makeNode, dungeon.width, dungeon.height);
        
        if (subStepComplete) {
            await subStepComplete(DelaySize.Small);
        }
    }
}

function addSpacedNode<TNode extends Coord2D, TLine extends Line<TNode>>(
    dungeon: Graph<TNode, TLine>,
    makeNode: () => TNode,
    totWidth: number,
    totHeight: number
) {
    const getScaledDistSq = (n1: TNode, n2: TNode, width: number, height: number) => {
        let dxScaled = (n1.x - n2.x) / width;
        let dyScaled = (n1.y - n2.y) / height;
        return dxScaled * dxScaled + dyScaled * dyScaled;
    };

    // create two nodes, and go with the one that's furthest away from the nearest node
    let node1 = makeNode(), node2 = makeNode();
    let closestDist1 = Number.MAX_VALUE, closestDist2 = Number.MAX_VALUE;
    for (let node of dungeon.nodes) {
        // scale x/y distances, so width/height changes don't change which node is chosen during regeneration
        closestDist1 = Math.min(closestDist1, getScaledDistSq(node1, node, totWidth, totHeight));
        closestDist2 = Math.min(closestDist2, getScaledDistSq(node2, node, totWidth, totHeight));
    }

    dungeon.nodes.push(closestDist1 < closestDist2 ? node2 : node1);
}