import { Coord } from './Coord';

export class Line<TCoord extends Coord<TCoord>> {
    constructor(public from: TCoord, public to: TCoord) {

    }
}