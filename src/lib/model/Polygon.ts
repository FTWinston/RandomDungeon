import { Coord } from './Coord';

export class Polygon<TNode extends Coord<TNode>> {
    constructor(readonly vertices: TNode[]) {
        
    }
}