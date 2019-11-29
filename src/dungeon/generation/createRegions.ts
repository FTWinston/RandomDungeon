import { Dungeon } from '../model/Dungeon';
import { Region, RegionType } from '../model/Region';
import { Coord2D } from '../../lib/model/Coord';
import { Line } from '../../lib/model/Line';
import { IGraph } from '../../lib/model/Graph';
import { SRandom } from '../../lib/SRandom';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';

export async function createRegions(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    // Remove all nodes, then create nodeCount nodes. Using same seed ensures same ones are recreated.
    const random = new SRandom(seed);

    let makeNode = () => {
        const x = random.nextInRange(3, dungeon.width - 4);
        const y = random.nextInRange(3, dungeon.height - 4);
        const influence = random.nextInRange(0.6, 1.8);
        const regionType = random.nextIntInRange(0, RegionType.NUM_VALUES);
        const seed = random.next();
        const color = random.nextColor();
        return new Region(dungeon, x, y, seed, regionType, color, influence);
    };

    dungeon.nodes = [];
    for (let i = 0; i < settings.nodeCount; i++) {
        addSpacedNode(dungeon, makeNode, dungeon.width, dungeon.height);
        
        if (subStepComplete) {
            await subStepComplete(DelaySize.Small);
        }
    }
}

function addSpacedNode<TNode extends Coord2D, TLine extends Line<TNode>>(
    dungeon: IGraph<TNode, TLine>,
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