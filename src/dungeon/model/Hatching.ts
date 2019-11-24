import { Coord2D } from '../../lib/model/Coord';
import { SRandom } from '../../lib/SRandom';

export class Hatching extends Coord2D {
    public readonly rotation: number;
    public readonly lengthScale: number;
    public readonly topSkew: number;
    public readonly bottomSkew: number;

    constructor(x: number, y: number, seed?: number) {
        if (seed === undefined) {
            super(x + 0.5, y + 0.5);
            this.rotation = 0;
            this.lengthScale = 1;
            this.topSkew = 0;
            this.bottomSkew = 0;
            return;
        }

        const random = new SRandom(seed + x ^ y);

        super(x + 0.15 + random.next() * 0.65, y + 0.15 + random.next() * 0.65);

        this.rotation = random.nextInRange(0, Math.PI * 2);
        this.lengthScale = random.nextInRange(0.9, 1.35);
        this.topSkew = random.nextInRange(0, 0.25);
        this.bottomSkew = random.nextInRange(0, 0.25);
    }
}