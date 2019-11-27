import { Line } from '../../lib/model/Line';
import { Region } from './Region';

export class Pathway extends Line<Region> {
    constructor(from: Region, to: Region) {
        super(from, to);

        from.links.push(this);
        to.links.push(this);
    }
}