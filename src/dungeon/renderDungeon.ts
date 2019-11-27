import { Dungeon } from './model/Dungeon';
import { Pathway } from './model/Pathway';
import { Region } from './model/Region';
import { Tile } from './model/Tile';
import { Curve } from '../lib/model/Curve';
import { IRenderSettings } from './IRenderSettings';

export function renderDungeon(   
    dungeon: Dungeon,
    ctx: CanvasRenderingContext2D,
    settings: IRenderSettings,
) {
    ctx.clearRect(0, 0, dungeon.width * settings.cellSize, dungeon.height * settings.cellSize);

    if (settings.drawGrid) {
        drawTileGrid(ctx, dungeon, settings);
    }

    if (settings.drawGraph) {
        drawGraph(ctx, dungeon, settings);
    }
    
    if (settings.drawOutside) {
        fillOutside(ctx, dungeon, settings);
    }

    if (settings.drawOutsidePoints) {
        drawOutsidePoints(ctx, dungeon, settings);
    }

    if (settings.drawWalls) {
        ctx.strokeStyle = ctx.fillStyle = settings.highlightWallCurves ? '#f00' : '#000';
        ctx.lineCap = 'round';
        for (const curve of dungeon.walls) {
            drawCurve(curve, ctx, settings);
        }
        ctx.lineCap = 'butt';
    }
    
    if (settings.drawNodeLinks) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#000';
        for (let line of dungeon.lines) {
            drawPath(line, ctx, settings);
        }
    }

    if (settings.nodeAlpha > 0) {
        ctx.globalAlpha = settings.nodeAlpha;
        for (let i = 0; i < dungeon.nodes.length; i++) {
            drawNode(dungeon.nodes[i], ctx, settings);
        }
        ctx.globalAlpha = 1;
    }
}

function drawTileGrid(ctx: CanvasRenderingContext2D, dungeon: Dungeon, settings: IRenderSettings) {
    ctx.lineWidth = settings.floorGridWidth;

    for (const tile of dungeon.tiles) {
        drawTile(tile, ctx, settings);
    }
}

function drawPath(pathway: Pathway, ctx: CanvasRenderingContext2D, settings: IRenderSettings) {
    ctx.beginPath();
    ctx.moveTo(pathway.from.x * settings.cellSize, pathway.from.y * settings.cellSize);
    ctx.lineTo(pathway.to.x * settings.cellSize, pathway.to.y * settings.cellSize);
    ctx.stroke();
}

function drawNode(room: Region, ctx: CanvasRenderingContext2D, settings: IRenderSettings) {
    ctx.fillStyle = '#c00';
    
    ctx.beginPath();
    ctx.arc(room.x * settings.cellSize, room.y * settings.cellSize, settings.cellSize * room.radius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawTile(tile: Tile, ctx: CanvasRenderingContext2D, settings: IRenderSettings) {
    if (tile.isWall && !tile.isFloor) {
        ctx.fillStyle = '#333';
        ctx.fillRect(tile.x * settings.cellSize, tile.y * settings.cellSize, settings.cellSize, settings.cellSize);
    } else if (tile.isFloor) {
        ctx.fillStyle = settings.floorColor;
        ctx.fillRect(tile.x * settings.cellSize, tile.y * settings.cellSize, settings.cellSize, settings.cellSize);
        ctx.strokeStyle = settings.floorGridColor;
        ctx.strokeRect(tile.x * settings.cellSize, tile.y * settings.cellSize, settings.cellSize, settings.cellSize);
    }

    if (settings.regionAlpha > 0 && tile.region !== null) {
        ctx.globalAlpha = settings.regionAlpha;
        ctx.fillStyle = tile.region.color;
        ctx.fillRect(tile.x * settings.cellSize, tile.y * settings.cellSize, settings.cellSize, settings.cellSize);
        ctx.globalAlpha = 1;
    }
}

function drawGraph(ctx: CanvasRenderingContext2D, dungeon: Dungeon, settings: IRenderSettings) {
    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = '#000';

    ctx.lineWidth = settings.cellSize;
    for (let line of dungeon.minimumSpanningLines) {
        drawPath(line, ctx, settings);
    }

    ctx.lineWidth = settings.cellSize * 0.5;
    for (let line of dungeon.relativeNeighbourhoodLines) {
        drawPath(line, ctx, settings);
    }

    ctx.lineWidth = settings.cellSize * 0.25;
    for (let line of dungeon.gabrielLines) {
        drawPath(line, ctx, settings);
    }

    ctx.lineWidth = 1;
    for (let line of dungeon.delauneyLines) {
        drawPath(line, ctx, settings);
    }

    ctx.globalAlpha = 1;
}

function drawCurve(
    curve: Curve,
    ctx: CanvasRenderingContext2D,
    settings: IRenderSettings,
    draw: boolean = true
) {
    let halfCellSize = settings.cellSize / 2;

    if (curve.keyPoints.length === 1) {
        if (draw) {
            let cell = curve.keyPoints[0];
            let cx = cell.x * settings.cellSize + halfCellSize;
            let cy = cell.y * settings.cellSize + halfCellSize;

            ctx.beginPath();
            ctx.arc(cx, cy, settings.wallWidth / 2, 0, Math.PI * 2);
        
            ctx.fill();
        }
        return;
    }
    
    let points = curve.renderPoints;
    let x = points[0] * settings.cellSize + halfCellSize;
    let y = points[1] * settings.cellSize + halfCellSize;
    
    if (draw) {
        ctx.beginPath();
    }
    ctx.moveTo(x, y);
    
    ctx.lineWidth = settings.wallWidth;
    for (let i = 0; i < points.length; i += 2) {
        x = points[i] * settings.cellSize + halfCellSize;
        y = points[i + 1] * settings.cellSize + halfCellSize;
        ctx.lineTo(x, y);
    }

    if (draw) {
        ctx.stroke();
    }
}

function clipOutside(ctx: CanvasRenderingContext2D, dungeon: Dungeon, settings: IRenderSettings) {
    ctx.beginPath();
    ctx.rect(0, 0, dungeon.width * settings.cellSize, dungeon.height * settings.cellSize);
    for (let curve of dungeon.walls) {
        drawCurve(curve, ctx, settings, false);
    }
    ctx.clip('evenodd');
}

function fillOutside(ctx: CanvasRenderingContext2D, dungeon: Dungeon, settings: IRenderSettings) {
    ctx.fillStyle = settings.backgroundColor;

    ctx.save();
    clipOutside(ctx, dungeon, settings);

    ctx.fillRect(0, 0, dungeon.width * settings.cellSize, dungeon.height * settings.cellSize);
    
    ctx.strokeStyle = settings.hatchingColor;
    ctx.lineWidth = settings.hatchingWidth;

    const xScale = settings.cellSize * 0.6;
    for (const point of dungeon.backdropPoints) {
        const yScale = settings.cellSize * point.lengthScale;
        
        ctx.save();

        ctx.translate(point.x * settings.cellSize, point.y * settings.cellSize);
        ctx.rotate(point.rotation);

        // first clear the background of this segment
        ctx.beginPath();
        ctx.moveTo(-xScale, -yScale - point.topSkew * settings.cellSize);
        ctx.lineTo(xScale, -yScale + point.topSkew * settings.cellSize);
        ctx.lineTo(xScale, yScale - point.bottomSkew * settings.cellSize);
        ctx.lineTo(-xScale, yScale + point.bottomSkew * settings.cellSize);
        ctx.fill();

        // then draw the lines
        ctx.beginPath();

        ctx.moveTo(-xScale, -yScale - point.topSkew * settings.cellSize);
        ctx.lineTo(-xScale, yScale + point.bottomSkew * settings.cellSize);

        ctx.moveTo(0, -yScale);
        ctx.lineTo(0, yScale);

        ctx.moveTo(xScale, -yScale + point.topSkew * settings.cellSize);
        ctx.lineTo(xScale, yScale - point.bottomSkew * settings.cellSize);

        ctx.stroke();

        ctx.restore();
    }

    ctx.restore();
}

function drawOutsidePoints(ctx: CanvasRenderingContext2D, dungeon: Dungeon, settings: IRenderSettings) {
    ctx.save();
    clipOutside(ctx, dungeon, settings);

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#009';

    for (const point of dungeon.backdropPoints) {
        ctx.beginPath();
        ctx.arc(point.x * settings.cellSize, point.y * settings.cellSize, settings.cellSize * 0.25, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}