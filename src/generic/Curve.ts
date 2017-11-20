import { Coord2D } from './Coord';

export class Curve {
    static readonly stepsPerSegment = 16;

    keyPoints: Coord2D[];
    isLoop: boolean;
    private renderPoints: number[];
    private color: string;

    constructor(public curvature: number = 0.75) {
        this.keyPoints = [];
        this.isLoop = false;
        this.color = `#${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`;
    }

    draw(ctx: CanvasRenderingContext2D, scale: number, width: number, newPath: boolean = true) {
        let halfScale = scale / 2;
        ctx.fillStyle = ctx.strokeStyle = this.color;

        if (this.keyPoints.length === 1) {
            if (newPath) {
                let cell = this.keyPoints[0];
                let cx = cell.x * scale + halfScale;
                let cy = cell.y * scale + halfScale;

                ctx.beginPath();
                ctx.arc(cx, cy, width / 2, 0, Math.PI * 2);
            
                ctx.fill();
            }
            return;
        }
        
        let points = this.renderPoints;
        let x = points[0] * scale + halfScale;
        let y = points[1] * scale + halfScale;
        
        if (newPath) {
            ctx.beginPath();
        }
        ctx.moveTo(x, y);
        
        ctx.lineWidth = width;
        for (let i = 0; i < points.length; i += 2) {
            x = points[i] * scale + halfScale;
            y = points[i + 1] * scale + halfScale;
            ctx.lineTo(x, y);
        }

        if (newPath) {
            ctx.stroke();
        }

        if (newPath) {
            ctx.fillStyle = ctx.strokeStyle = '#fff';
            let prev = ctx.lineWidth;
            ctx.lineWidth = 1;

            ctx.beginPath();

            // a + at the start
            x = points[0] * scale + halfScale;
            y = points[1] * scale + halfScale;
            ctx.moveTo(x - scale, y);
            ctx.lineTo(x + scale, y);
            ctx.moveTo(x, y - scale);
            ctx.lineTo(x, y + scale);

            // an X at the end
            x = points[points.length - 2] * scale + halfScale;
            y = points[points.length - 1] * scale + halfScale;
            ctx.moveTo(x - scale, y - scale);
            ctx.lineTo(x + scale, y + scale);
            ctx.moveTo(x + scale, y - scale);
            ctx.lineTo(x - scale, y + scale);

            ctx.stroke();

            ctx.lineWidth = prev;
        }
    }

    updateRenderPoints() {
        this.renderPoints = [];

        if (this.keyPoints.length < 2) {
            return;
        }

        let tension = this.curvature;
        let pts: number[] = [],
            x: number, y: number,
            t1x: number, t2x: number, t1y: number, t2y: number,
            c1: number, c2: number, c3: number, c4: number,
            fraction: number, step: number, iPt: number;

        let firstCell = this.keyPoints[0];
        let lastCell = this.keyPoints[this.keyPoints.length - 1];

        // decide if it's a closed loop, which needs the ends of the array set up differently
        let lastCellIndex: number;
        if (firstCell === lastCell) {
            this.isLoop = true;
            lastCellIndex = this.keyPoints.length - 2; // don't copy the last cell, its the same as the first
            lastCell = this.keyPoints[lastCellIndex];
        } else {
            this.isLoop = false;
            lastCellIndex = this.keyPoints.length - 1;
        }
        
        for (let cell of this.keyPoints) {
            pts.push(cell.x, cell.y);
        }
        
        if (this.isLoop) {
            // copy last cell onto start, and first cells onto end
            let secondCell = this.keyPoints[1];
            pts.push(firstCell.x, firstCell.y);
            pts.push(secondCell.x, secondCell.y);
            pts.unshift(lastCell.x, lastCell.y);
        } else {
            // copy first cell onto start, and last cell onto end
            pts.unshift(firstCell.x, firstCell.y);
            pts.push(lastCell.x, lastCell.y);
        }

        // loop through key points. Use each set of 4 points p0 p1 p2 p3 to draw segment p1-p2.
        for (iPt = 2; iPt < (pts.length - 4); iPt += 2) {
            for (step = 0; step <= Curve.stepsPerSegment; step++) {
                // tension vectors
                t1x = (pts[iPt + 2] - pts[iPt - 2]) * tension;
                t2x = (pts[iPt + 4] - pts[iPt]) * tension;

                t1y = (pts[iPt + 3] - pts[iPt - 1]) * tension;
                t2y = (pts[iPt + 5] - pts[iPt + 1]) * tension;

                fraction = step / Curve.stepsPerSegment;

                // cardinals
                c1 =   2 * Math.pow(fraction, 3)  - 3 * Math.pow(fraction, 2) + 1; 
                c2 = -(2 * Math.pow(fraction, 3)) + 3 * Math.pow(fraction, 2); 
                c3 =       Math.pow(fraction, 3)  - 2 * Math.pow(fraction, 2) + fraction; 
                c4 =       Math.pow(fraction, 3)  -     Math.pow(fraction, 2);

                // x and y coordinates
                x = c1 * pts[iPt]    + c2 * pts[iPt + 2] + c3 * t1x + c4 * t2x;
                y = c1 * pts[iPt + 1]  + c2 * pts[iPt + 3] + c3 * t1y + c4 * t2y;
                this.renderPoints.push(x);
                this.renderPoints.push(y);
            }
        }
    }
}