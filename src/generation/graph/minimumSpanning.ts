import { Coord } from '../../model/generic/Coord';
import { Graph } from '../../model/generic/Graph';
import { Line } from '../../model/generic/Line';

export function computeMinimumSpanningTree<TNode extends Coord<TNode>, TLine extends Line<TNode>>(
    graph: Graph<TNode, TLine>,
    links: TLine[] | undefined = undefined
) {
    let unvisitedNodes = graph.nodes.slice();
    let firstNode = unvisitedNodes.pop();
    if (firstNode === undefined) {
        return [];
    }
    
    links = links === undefined ? graph.lines : links;
    let possibleLinks = links.map(l => { return { link: l, lengthSq: l.from.distanceSqTo(l.to) }; });
    possibleLinks.sort((a, b) => a.lengthSq - b.lengthSq);

    let visitedNodes: TNode[] = [firstNode];
    let graphLinks: TLine[] = [];

    while (unvisitedNodes.length > 0 && possibleLinks.length > 0) {
        // Find the first link that connects to a node in visitedNodes...
        // The links are sorted by length, so the first one will be the shortest one.
        for (let i = 0; i < possibleLinks.length; i++) {
            let testLink = possibleLinks[i].link;
            
            let alreadyHasFrom = visitedNodes.indexOf(testLink.from) !== -1;
            let alreadyHasTo = visitedNodes.indexOf(testLink.to) !== -1;

            // if it doesn't connect to the graph at all, discard it
            if (!alreadyHasFrom && !alreadyHasTo) {
                continue;
            }

            possibleLinks.splice(i, 1);
            graphLinks.push(testLink);

            let addingNode = alreadyHasFrom ? testLink.to : testLink.from;
            
            // remove all other links from possibleLinks that connect addingNode to visitedNodes
            for (let j = i; j < possibleLinks.length; j++) {
                testLink = possibleLinks[j].link;
                if ((testLink.from === addingNode && visitedNodes.indexOf(testLink.to) !== -1)
                || (testLink.to === addingNode && visitedNodes.indexOf(testLink.from) !== -1)) {
                    possibleLinks.splice(j, 1);
                    j--;
                }
            }

            visitedNodes.push(addingNode);
            break;
        }
    }

    return graphLinks;
}
