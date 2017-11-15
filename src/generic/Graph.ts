export abstract class Graph<TNode, TLink> {
    nodes: TNode[] = [];
    links: TLink[] = [];

    abstract distance(node1: TNode, node2: TNode): number;

    computeDelauneyTriangulation(makeLink: (node1: TNode, node2: TNode) => TLink) {
        let triangulationLinks: TLink[] = [];

        // TODO: https://en.wikipedia.org/wiki/Bowyer%E2%80%93Watson_algorithm

        return triangulationLinks;
    }

    computeGabrielGraph(links: TLink[]) {
        links = (links === undefined ? this.links : links).slice();

        let graphLinks: TLink[] = [];

        // TODO: compute

        return graphLinks;
    }

    computeRelativeNeighbourhoodGraph(links: TLink[]) {
        links = (links === undefined ? this.links : links).slice();

        let graphLinks: TLink[] = [];

        // TODO: compute

        return graphLinks;
    }

    computeMinimumSpanningTree(links: TLink[]) {
        links = (links === undefined ? this.links : links).slice();

        let graphLinks: TLink[] = [];

        // TODO: compute

        return graphLinks;
    }
}