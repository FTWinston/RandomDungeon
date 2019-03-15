import { Dungeon } from '../model/Dungeon';
import { Pathway } from '../model/Pathway';
import { Room } from '../model/Room';
import { Tile } from '../model/Tile';
import { GenerationSteps } from '../generation/GenerationSteps';
import { Curve } from '../model/generic/Curve';

export class DungeonDrawer {   
    dungeon: Dungeon;
    private nodeAlpha = 0;
    private extraLinkAlpha = 0;
    private drawNodeLinks = true;
    private drawGrid = false;
    private drawWalls = false;
    private highlightWallCurves = false;
    private fillOutside = false;

    constructor(
        public readonly ctx: CanvasRenderingContext2D,
        public scale: number) {

    }

    public setAnimationStage(step: GenerationSteps, startOfStep: boolean) {
        switch (step) {
            case GenerationSteps.CreateNodes:
                if (startOfStep) {
                    this.nodeAlpha = 1;
                    this.extraLinkAlpha = 0;
                    this.drawNodeLinks = this.drawGrid = this.drawWalls = this.fillOutside = false;
                }
                break;
            case GenerationSteps.LinkNodes:
                if (startOfStep) {
                    this.extraLinkAlpha = 1;
                }
                break;
            case GenerationSteps.FilterLinks:
                if (startOfStep) {
                    this.drawNodeLinks = true;
                    this.extraLinkAlpha = 0.2;            
                } else {
                    this.extraLinkAlpha = 0;
                }
                break;
            case GenerationSteps.CreateRooms:
                if (!startOfStep) {
                    this.drawGrid = true;
                    this.nodeAlpha = 0;
                }
                break;
            case GenerationSteps.ExpandLines:
                if (!startOfStep) {
                    this.drawNodeLinks = false;
                }
                break;

            case GenerationSteps.CurveWalls:
                if (startOfStep) {
                    this.drawWalls = true;
                    this.highlightWallCurves = true;
                } else {
                    this.highlightWallCurves = false;
                }
                break;
            
            case GenerationSteps.FillBackdrop:
                if (startOfStep) {
                    // this.drawBackdropNodes = true;
                } else {
                    // this.drawBackdropNodes = false;
                }
                break;

            case GenerationSteps.Render:
                this.fillOutside = true;
                break;

            default:
                break;
        }
    }

    redraw() {
        // TODO: requestAnimationFrame?
        this.draw();
    }

    public draw() {
        const ctx = this.ctx;
        const dungeon = this.dungeon;

        ctx.clearRect(0, 0, dungeon.width * this.scale, dungeon.height * this.scale);

        if (this.drawGrid) {
            ctx.lineWidth = 1;
            for (let x = 0; x < dungeon.width; x++) {
                for (let y = 0; y < dungeon.height; y++) {
                    this.drawTile(dungeon.grid[x][y], ctx, this.scale);
                }
            }
        }

        if (this.extraLinkAlpha > 0) {
            ctx.lineWidth = 1;
            ctx.globalAlpha = this.extraLinkAlpha;

            ctx.strokeStyle = '#000';
            for (let line of dungeon.minimumSpanningLines) {
                this.drawPath(line, ctx, this.scale);
            }

            ctx.strokeStyle = '#F00';
            for (let line of dungeon.relativeNeighbourhoodLines) {
                if (dungeon.minimumSpanningLines.indexOf(line) === -1) {
                    this.drawPath(line, ctx, this.scale);
                }
            }

            ctx.strokeStyle = '#0CF';
            for (let line of dungeon.gabrielLines) {
                if (dungeon.relativeNeighbourhoodLines.indexOf(line) === -1) {
                    this.drawPath(line, ctx, this.scale);
                }
            }

            ctx.strokeStyle = '#ddd';
            for (let line of dungeon.delauneyLines) {
                if (dungeon.gabrielLines.indexOf(line) === -1) {
                    this.drawPath(line, ctx, this.scale);
                }
            }
            ctx.globalAlpha = 1;
        }
        
        if (this.fillOutside) {
            ctx.save();
            ctx.beginPath();

            ctx.rect(0, 0, dungeon.width * this.scale, dungeon.height * this.scale);
            for (let curve of dungeon.walls) {
                this.drawCurve(curve, ctx, this.scale, this.scale, false);
            }
            ctx.clip('evenodd');

            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, dungeon.width * this.scale, dungeon.height * this.scale);

            ctx.strokeStyle = '#000';
            ctx.lineWidth = this.scale * 0.1;
            let vmax = Math.max(dungeon.width, dungeon.height) * this.scale;
            let width = dungeon.width * this.scale;
            let iMax = vmax * 2;
            for (let i = iMax; i >= 0; i -= this.scale * 0.75) {
                ctx.moveTo(0, i);
                ctx.lineTo(i, 0);
                
                ctx.moveTo(width, iMax - i);
                ctx.lineTo(i - vmax, 0);
            }
            ctx.stroke();

            ctx.restore();
        }

        if (this.drawWalls) {
            ctx.strokeStyle = ctx.fillStyle = this.highlightWallCurves ? '#f00' : '#000';
            ctx.lineCap = 'round';
            for (const curve of dungeon.walls) {
                this.drawCurve(curve, ctx, this.scale, this.scale);
            }
            ctx.lineCap = 'butt';
        }
        
        if (this.drawNodeLinks) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#000';
            for (let line of dungeon.lines) {
                this.drawPath(line, ctx, this.scale);
            }
        }

        if (this.nodeAlpha > 0) {
            ctx.globalAlpha = this.nodeAlpha;
            for (let i = 0; i < dungeon.nodes.length; i++) {
                this.drawRoom(dungeon.nodes[i], ctx, this.scale);
            }
            ctx.globalAlpha = 1;
        }
    }

    private drawPath(pathway: Pathway, ctx: CanvasRenderingContext2D, scale: number) {
        ctx.beginPath();
        ctx.moveTo(pathway.from.x * scale, pathway.from.y * scale);
        ctx.lineTo(pathway.to.x * scale, pathway.to.y * scale);
        ctx.stroke();
    }

    private drawRoom(room: Room, ctx: CanvasRenderingContext2D, scale: number) {
        ctx.fillStyle = '#c00';
        
        ctx.beginPath();
        ctx.arc(room.x * scale, room.y * scale, scale * room.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    private drawTile(tile: Tile, ctx: CanvasRenderingContext2D, scale: number) {
        if (tile.isWall && !tile.isFloor) {
            ctx.fillStyle = '#000';
            ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
        } else if (tile.isFloor) {
            /*
            if (tile.room !== null) {
                ctx.fillStyle = tile.room.color;
                ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
            }
            */
            ctx.strokeStyle = 'rgba(200,200,200,0.5)';
            ctx.strokeRect(tile.x * scale, tile.y * scale, scale, scale);
        } else {
            ctx.fillStyle = '#666';
            ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
        }
    }

    private drawCurve(
        curve: Curve,
        ctx: CanvasRenderingContext2D,
        scale: number,
        width: number,
        draw: boolean = true
    ) {
        let halfScale = scale / 2;

        if (curve.keyPoints.length === 1) {
            if (draw) {
                let cell = curve.keyPoints[0];
                let cx = cell.x * scale + halfScale;
                let cy = cell.y * scale + halfScale;

                ctx.beginPath();
                ctx.arc(cx, cy, width / 2, 0, Math.PI * 2);
            
                ctx.fill();
            }
            return;
        }
        
        let points = curve.renderPoints;
        let x = points[0] * scale + halfScale;
        let y = points[1] * scale + halfScale;
        
        if (draw) {
            ctx.beginPath();
        }
        ctx.moveTo(x, y);
        
        ctx.lineWidth = width;
        for (let i = 0; i < points.length; i += 2) {
            x = points[i] * scale + halfScale;
            y = points[i + 1] * scale + halfScale;
            ctx.lineTo(x, y);
        }

        if (draw) {
            ctx.stroke();
        }
    }
}