import { Line } from './generic/Line';
import { Room } from './Room';

export class Pathway extends Line<Room> {
    restLength: number;
    springConstant: number;
    
    constructor(from: Room, to: Room, length?: number) {
        super(from, to);

        this.restLength = length === undefined ? Math.random() * 10 + 5 : length;
        this.springConstant = 0.1;
        
        from.links.push(this);
        to.links.push(this);
    }
}