import { Dungeon } from '../model/Dungeon';
import { Region, RegionType } from '../model/Region';
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

    const enclosingTriangle: [Region, Region, Region] = [
        new Region(dungeon, 0, 0, 0, RegionType.Artificial, ''),
        new Region(dungeon, 999999, 0, 0, RegionType.Artificial, ''),
        new Region(dungeon, 0, 999999, 0, RegionType.Artificial, ''),
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