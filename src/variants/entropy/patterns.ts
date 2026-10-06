import * as cg from '../../types';
import { pos2key } from '../../util';

// A pattern, as strategygames states it in GuaranteedScore: a contiguous run of two or more squares
// along a line that reads the same in both directions, scoring its own length. One empty square is
// allowed at the dead centre of an odd run, where it is mirrored against nothing and so already
// reads the same whatever lands there. Nested and overlapping patterns each score separately.
export interface Pattern {
  from: cg.Pos;
  to: cg.Pos;
  points: number;
}

type Colour = cg.Role | undefined;

export function findPatterns(pieces: cg.Pieces, bd: cg.BoardDimensions): Pattern[] {
  const colourAt = (x: number, y: number): Colour => pieces.get(pos2key([x, y]))?.role;
  const found: Pattern[] = [];
  for (let y = 1; y <= bd.height; y++) {
    const line: Colour[] = [];
    for (let x = 1; x <= bd.width; x++) line.push(colourAt(x, y));
    found.push(...patternsInLine(line, i => [i + 1, y]));
  }
  for (let x = 1; x <= bd.width; x++) {
    const line: Colour[] = [];
    for (let y = 1; y <= bd.height; y++) line.push(colourAt(x, y));
    found.push(...patternsInLine(line, i => [x, i + 1]));
  }
  return found;
}

export function totalPoints(patterns: Pattern[]): number {
  return patterns.reduce((sum, pattern) => sum + pattern.points, 0);
}

// What each line of the board is worth, by rank and by file. A pattern runs along one line and one
// only, so every point lands in exactly one of these and the two sets together come to the score.
export interface LineScores {
  ranks: number[];
  files: number[];
}

export function lineScores(patterns: Pattern[], bd: cg.BoardDimensions): LineScores {
  const scores: LineScores = { ranks: Array(bd.height).fill(0), files: Array(bd.width).fill(0) };
  for (const pattern of patterns) {
    const alongRank = pattern.from[1] === pattern.to[1];
    const line = alongRank ? scores.ranks : scores.files;
    const index = alongRank ? pattern.from[1] - 1 : pattern.from[0] - 1;
    line[index] += pattern.points;
  }
  return scores;
}

function patternsInLine(line: Colour[], posAt: (i: number) => cg.Pos): Pattern[] {
  const found: Pattern[] = [];
  for (let start = 0; start < line.length; start++)
    for (let end = start + 2; end <= line.length; end++)
      if (qualifies(line.slice(start, end)))
        found.push({ from: posAt(start), to: posAt(end - 1), points: end - start });
  return found;
}

export function qualifies(run: Colour[]): boolean {
  const n = run.length;
  if (n < 2) return false;
  const gaps = run.reduce<number[]>((acc, colour, i) => (colour === undefined ? acc.concat(i) : acc), []);
  const gapIsFree = gaps.length === 0 || (n % 2 === 1 && gaps.length === 1 && gaps[0] === (n - 1) / 2);
  if (!gapIsFree) return false;
  for (let i = 0; i < n >> 1; i++) if (run[i] === undefined || run[i] !== run[n - 1 - i]) return false;
  return true;
}
