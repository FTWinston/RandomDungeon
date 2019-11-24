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

        const random = new SRandom(seed + x * x * 4987142 + x * 5947611 + y * y * 4392871 + y * 389711);

        super(x + random.nextInRange(0.1, 0.9), y + random.nextInRange(0.1, 0.9));

        this.rotation = random.nextInRange(0, Math.PI * 2);
        this.lengthScale = random.nextInRange(0.9, 1.35);
        this.topSkew = random.nextInRange(0, 0.25);
        this.bottomSkew = random.nextInRange(0, 0.25);
    }
}