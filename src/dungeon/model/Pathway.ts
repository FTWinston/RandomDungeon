import { Line } from '../../lib/model/Line';
import { Room } from './Room';

export class Pathway extends Line<Room> {
    constructor(from: Room, to: Room) {
        super(from, to);

        from.links.push(this);
        to.links.push(this);
    }
}