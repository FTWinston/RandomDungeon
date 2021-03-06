import { Coord } from '../model/Coord';
import { IGraph } from '../model/Graph';
import { Line } from '../model/Line';

export function computeRelativeNeighbourhoodGraph<TNode extends Coord<TNode>, TLine extends Line<TNode>>(
    graph: IGraph<TNode, TLine>, 
    links: TLine[] = graph.lines
) {
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
