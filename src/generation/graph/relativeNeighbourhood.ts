import { Coord } from '../../model/generic/Coord';
import { Graph } from '../../model/generic/Graph';
import { Line } from '../../model/generic/Line';

export function computeRelativeNeighbourhoodGraph<TNode extends Coord<TNode>, TLine extends Line<TNode>>(
    graph: Graph<TNode, TLine>, 
    links: TLine[] | undefined = undefined
) {
    links = links === undefined ? graph.lines : links;

    let graphLinks: TLine[] = [];
    
    for (let link of links) {
        let anyBlocking = false;
        let lengthSq = link.from.distanceSqTo(link.to);

        for (let node of graph.nodes) {
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
