import { SRandom } from "../SRandom";

// Adapted from https://gist.github.com/banksean/304522, which was in turn
// Ported from Stefan Gustavson's java implementation
// http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf

export class SimplexNoise {
    private static grad3 = [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];
    private perm: number[];

    constructor(seed: number) {
        let p = [];
        for (let i=0; i<256; i++) {
            p[i] = i;
        }
        this.shuffle(seed, p);

        // To remove the need for index wrapping, double the permutation table length
        for (let i=0; i<256; i++) {
            p[i+256] = p[i];
        }

        this.perm = p;
    }

    private shuffle(seed: number, array: number[]) {
        const random = new SRandom(seed);
        
        let j = 0, temp: number;

        for (let i = array.length - 1; i > 0; i -= 1) {
            j = random.nextIntInRange(0, i);
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    private dot(gi: number, x: number, y: number) {
        let g = SimplexNoise.grad3[gi];
	    return g[0]*x + g[1]*y;
    }
    
    noise(xin: number, yin: number) {
        var n0, n1, n2; // Noise contributions from the three corners

        // Skew the input space to determine which simplex cell we're in
        var F2 = 0.5*(Math.sqrt(3.0)-1.0);
        var s = (xin+yin)*F2; // Hairy factor for 2D
        var i = Math.floor(xin+s);
        var j = Math.floor(yin+s);
        var G2 = (3.0-Math.sqrt(3.0))/6.0;
        var t = (i+j)*G2;
        var X0 = i-t; // Unskew the cell origin back to (x,y) space
        var Y0 = j-t;
        var x0 = xin-X0; // The x,y distances from the cell origin
        var y0 = yin-Y0;

        // For the 2D case, the simplex shape is an equilateral triangle.
        // Determine which simplex we are in.
        var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
        if (x0 > y0) {
            i1=1; j1=0; // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        }
        else {
            i1=0; j1=1; // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        }

        // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
        // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
        // c = (3-sqrt(3))/6
        var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
        var y1 = y0 - j1 + G2;
        var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
        var y2 = y0 - 1.0 + 2.0 * G2;

        // Work out the hashed gradient indices of the three simplex corners
        var ii = i & 255;
        var jj = j & 255;
        var gi0 = this.perm[ii+this.perm[jj]] % 12;
        var gi1 = this.perm[ii+i1+this.perm[jj+j1]] % 12;
        var gi2 = this.perm[ii+1+this.perm[jj+1]] % 12;

        // Calculate the contribution from the three corners
        var t0 = 0.5 - x0*x0-y0*y0;
        if (t0 < 0) {
            n0 = 0.0;
        } else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(gi0, x0, y0);  // (x,y) of grad3 used for 2D gradient
        }
        var t1 = 0.5 - x1*x1-y1*y1;
        if(t1 < 0) {
            n1 = 0.0;
        } else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(gi1, x1, y1);
        }
        var t2 = 0.5 - x2*x2-y2*y2;
        if(t2 < 0) {
            n2 = 0.0;
        } else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(gi2, x2, y2);
        }

        // Add contributions from each corner to get the final noise value.
        // The result is scaled to return values in the interval [0,1].
        return 35.0 * (n0 + n1 + n2) + 0.5;
    }
}