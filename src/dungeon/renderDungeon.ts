import { Dungeon } from './model/Dungeon';
import { Pathway } from './model/Pathway';
import { Room } from './model/Room';
import { Tile } from './model/Tile';
import { Curve } from '../lib/model/Curve';
import { IRenderSettings } from './IRenderSettings';

export function renderDungeon(   
    dungeon: Dungeon,
    ctx: CanvasRenderingContext2D,
    scale: number,
    settings: IRenderSettings,
) {
    ctx.clearRect(0, 0, dungeon.width * scale, dungeon.height * scale);

    if (settings.drawGrid) {
        drawTileGrid(ctx, dungeon, scale, settings.regionAlpha);
    }

    if (settings.drawGraph) {
        drawGraph(ctx, dungeon, scale);
    }
    
    if (settings.drawOutside) {
        fillOutside(ctx, dungeon, scale);
    }

    if (settings.drawOutsidePoints) {
        drawOutsidePoints(ctx, dungeon, scale);
    }

    if (settings.drawWalls) {
        ctx.strokeStyle = ctx.fillStyle = settings.highlightWallCurves ? '#f00' : '#000';
        ctx.lineCap = 'round';
        for (const curve of dungeon.walls) {
            drawCurve(curve, ctx, scale, scale);
        }
        ctx.lineCap = 'butt';
    }
    
    if (settings.drawNodeLinks) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        for (let line of dungeon.lines) {
            drawPath(line, ctx, scale);
        }
    }

    if (settings.nodeAlpha > 0) {
        ctx.globalAlpha = settings.nodeAlpha;
        for (let i = 0; i < dungeon.nodes.length; i++) {
            drawNode(dungeon.nodes[i], ctx, scale);
        }
        ctx.globalAlpha = 1;
    }
}

function drawTileGrid(ctx: CanvasRenderingContext2D, dungeon: Dungeon, scale: number, regionAlpha: number) {
    ctx.lineWidth = 1;

    for (const tile of dungeon.tiles) {
        drawTile(tile, ctx, scale, regionAlpha);
    }
}

function drawPath(pathway: Pathway, ctx: CanvasRenderingContext2D, scale: number) {
    ctx.beginPath();
    ctx.moveTo(pathway.from.x * scale, pathway.from.y * scale);
    ctx.lineTo(pathway.to.x * scale, pathway.to.y * scale);
    ctx.stroke();
}

function drawNode(room: Room, ctx: CanvasRenderingContext2D, scale: number) {
    ctx.fillStyle = '#c00';
    
    ctx.beginPath();
    ctx.arc(room.x * scale, room.y * scale, scale * room.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawTile(tile: Tile, ctx: CanvasRenderingContext2D, scale: number, regionAlpha: number) {
    if (tile.isWall && !tile.isFloor) {
        ctx.fillStyle = '#333';
        ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
    } else if (tile.isFloor) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
        ctx.strokeStyle = 'rgba(192,192,192,0.5)';
        ctx.strokeRect(tile.x * scale, tile.y * scale, scale, scale);
    }

    if (regionAlpha > 0 && tile.room !== null) {
        ctx.globalAlpha = regionAlpha;
        ctx.fillStyle = tile.room.color;
        ctx.fillRect(tile.x * scale, tile.y * scale, scale, scale);
        ctx.globalAlpha = 1;
    }
}

function drawGraph(ctx: CanvasRenderingContext2D, dungeon: Dungeon, scale: number) {
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#000';

    ctx.lineWidth = scale;
    for (let line of dungeon.minimumSpanningLines) {
        drawPath(line, ctx, scale);
    }

    ctx.lineWidth = scale * 0.5;
    for (let line of dungeon.relativeNeighbourhoodLines) {
        drawPath(line, ctx, scale);
    }

    ctx.lineWidth = scale * 0.25;
    for (let line of dungeon.gabrielLines) {
        drawPath(line, ctx, scale);
    }

    ctx.lineWidth = 1;
    for (let line of dungeon.delauneyLines) {
        drawPath(line, ctx, scale);
    }

    ctx.globalAlpha = 1;
}

function drawCurve(
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

function clipOutside(ctx: CanvasRenderingContext2D, dungeon: Dungeon, scale: number) {
    ctx.beginPath();
    ctx.rect(0, 0, dungeon.width * scale, dungeon.height * scale);
    for (let curve of dungeon.walls) {
        drawCurve(curve, ctx, scale, scale, false);
    }
    ctx.clip('evenodd');
}

function fillOutside(ctx: CanvasRenderingContext2D, dungeon: Dungeon, scale: number) {
    ctx.save();
    clipOutside(ctx, dungeon, scale);

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, dungeon.width * scale, dungeon.height * scale);


    ctx.restore();
    /*
    ctx.strokeStyle = '#000';
    ctx.lineWidth = scale * 0.1;
    let vmax = Math.max(dungeon.width, dungeon.height) * scale;
    let width = dungeon.width * scale;
    let iMax = vmax * 2;
    for (let i = iMax; i >= 0; i -= scale * 0.75) {
        ctx.moveTo(0, i);
        ctx.lineTo(i, 0);
        ctx.moveTo(width, iMax - i);
        ctx.lineTo(i - vmax, 0);
    }
    ctx.stroke();
    */
    ctx.globalAlpha = 0.75;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = scale * 0.2;

    const halfScale = scale * 0.6;
    for (const point of dungeon.backdropPoints) {
        ctx.save();

        ctx.translate((point.x + 0.5) * scale, (point.y + 0.5) * scale);
        ctx.scale(1, Math.random() * 0.2 + 1);
        ctx.rotate(Math.random() * Math.PI * 2);

        const skewTop = Math.random() * scale * 0.15;
        const skewBottom = Math.random() * scale * 0.15;

        ctx.moveTo(-halfScale, -halfScale - skewTop);
        ctx.lineTo(-halfScale, halfScale + skewTop);

        ctx.moveTo(0, -halfScale);
        ctx.lineTo(0, halfScale);

        ctx.moveTo(halfScale, -halfScale + skewBottom);
        ctx.lineTo(halfScale, halfScale - skewBottom);


        ctx.restore();
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
}

function drawOutsidePoints(ctx: CanvasRenderingContext2D, dungeon: Dungeon, scale: number) {
    ctx.save();
    clipOutside(ctx, dungeon, scale);

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#0ff';

    for (const point of dungeon.backdropPoints) {
        ctx.beginPath();
        ctx.arc(point.x * scale, point.y * scale, scale * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}