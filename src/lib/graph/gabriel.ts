import { Coord } from '../model/Coord';
import { Graph } from '../model/Graph';
import { Line } from '../model/Line';

export function computeGabrielGraph<TNode extends Coord<TNode>, TLine extends Line<TNode>>(
    graph: Graph<TNode, TLine>,
    links: TLine[] | undefined = undefined
) {
    links = links === undefined ? graph.lines : links;

    let graphLinks: TLine[] = [];

    for (let link of links) {
        let anyBlocking = false;
        let center = link.from.halfwayTo(link.to);
        let radiusSq = link.from.distanceSqTo(center);

        for (let node of graph.nodes) {
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