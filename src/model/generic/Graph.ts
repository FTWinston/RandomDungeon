import { Coord } from './Coord';
import { Line } from './Line';

export class Triangle<TNode extends Coord<TNode>> {
    circumCenter: Coord<TNode>;
    circumRadiusSq: number;

    constructor(readonly vertices: [TNode, TNode, TNode]) {
        let circumCircle = vertices[0].circumCircle(vertices[1], vertices[2]);

        this.circumCenter = circumCircle[0];
        this.circumRadiusSq = circumCircle[1];
    }
}

export abstract class Graph<TNode extends Coord<TNode>, TLine extends Line<TNode>> {
    nodes: TNode[] = [];
    lines: TLine[] = [];
}