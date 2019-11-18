import { Coord } from './Coord';
import { Polygon } from './Polygon';

export class Triangle<TNode extends Coord<TNode>> extends Polygon<TNode> {
    circumCenter: Coord<TNode>;
    circumRadiusSq: number;

    constructor(vertices: [TNode, TNode, TNode]) {
        super(vertices);

        let circumCircle = vertices[0].circumCircle(vertices[1], vertices[2]);

        this.circumCenter = circumCircle[0];
        this.circumRadiusSq = circumCircle[1];
    }
}