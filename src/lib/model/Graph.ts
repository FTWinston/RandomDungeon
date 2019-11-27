import { Coord } from './Coord';
import { Line } from './Line';

export interface IGraph<TNode extends Coord<TNode>, TLine extends Line<TNode>> {
    nodes: TNode[];
    lines: TLine[];
}