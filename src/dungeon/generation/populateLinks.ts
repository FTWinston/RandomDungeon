import { Dungeon } from '../model/Dungeon';
import { Room, RoomType } from '../model/Room';
import {
    computeDelauneyTriangulation,
    getUniqueLines,
    computeGabrielGraph,
    computeRelativeNeighbourhoodGraph,
    computeMinimumSpanningTree
} from '../../lib/graph';
import { Pathway } from '../model/Pathway';
import { DelaySize } from '../generateDungeon';
import { IGenerationSettings } from '../IGenerationSettings';

export async function populateLinks(
    dungeon: Dungeon,
    settings: IGenerationSettings,
    seed: number,
    subStepComplete?: (interval: DelaySize) => Promise<void>,
) {
    dungeon.lines = [];
    dungeon.delauneyLines = [];
    dungeon.gabrielLines = [];
    dungeon.relativeNeighbourhoodLines = [];
    dungeon.minimumSpanningLines = [];

    const enclosingTriangle: [Room, Room, Room] = [
        new Room(dungeon, 0, 0, RoomType.Artificial),
        new Room(dungeon, 999999, 0, RoomType.Artificial),
        new Room(dungeon, 0, 999999, RoomType.Artificial),
    ];

    const delauneyTriangles = computeDelauneyTriangulation(dungeon.nodes, enclosingTriangle);
    
    dungeon.delauneyLines = getUniqueLines(delauneyTriangles, (from, to) => new Pathway(from, to));

    if (subStepComplete) {
        await subStepComplete(DelaySize.Medium);
    }

    dungeon.gabrielLines = computeGabrielGraph(dungeon, dungeon.delauneyLines);

    if (subStepComplete) {
        await subStepComplete(DelaySize.Medium);
    }

    dungeon.relativeNeighbourhoodLines = computeRelativeNeighbourhoodGraph(dungeon, dungeon.gabrielLines);

    if (subStepComplete) {
        await subStepComplete(DelaySize.Medium);
    }

    dungeon.minimumSpanningLines = computeMinimumSpanningTree(dungeon, dungeon.relativeNeighbourhoodLines);
}