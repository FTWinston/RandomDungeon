// based on http://cdnjs.cloudflare.com/ajax/libs/seedrandom/2.4.3/lib/alea.js

export class SRandom {
    private c: number;
    private s0: number;
    private s1: number;
    private s2: number;

    constructor(public readonly seed: number | string) {
        var mash = SRandom.mash();

        this.c = 1;
        this.s0 = mash(' ');
        this.s1 = mash(' ');
        this.s2 = mash(' ');

        this.s0 -= mash(seed);
        if (this.s0 < 0)
            this.s0 += 1;

        this.s1 -= mash(seed);
        if (this.s1 < 0)
            this.s1 += 1;

        this.s2 -= mash(seed);
        if (this.s2 < 0)
            this.s2 += 1;
    }

    next() {
        let t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return this.s2 = t - (this.c = t | 0);
    }
    
    nextInt32() {
        return (this.next() * 0x100000000) | 0;
    }

    nextInRange(min: number, max: number) {
        return min + this.next() * (max - min);
    }

    static randomIntRange(minInclusive: number, maxExclusive: number) {
        return Math.floor(SRandom.randomRange(minInclusive, maxExclusive));
    }

    static randomRange(minInclusive: number, maxExclusive: number) {
        return minInclusive + Math.random() * (maxExclusive - minInclusive);
    }

    private static mash() {
        let n = 0xefc8249d;

        let mash = function(data: number | string) {
            data = data.toString();
            for (var i = 0; i < data.length; i++) {
                n += data.charCodeAt(i);
                var h = 0.02519603282416938 * n;
                n = h >>> 0;
                h -= n;
                h *= n;
                n = h >>> 0;
                h -= n;
                n += h * 0x100000000; // 2^32
            }
            return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
        };

        return mash;
    }
}