import { State } from '../../state';
import * as cg from '../../types';
import * as T from '../../transformations';
import { createElement as createSVG, setAttributes } from '../../svg';
import { Pattern, findPatterns, lineScores } from './patterns';

// All lengths are in board squares, because the layer carries a viewBox of the board's own
// dimensions and so scales with it. Every pattern draws at the same hairline width, whatever it
// scores, and they all share their line's centre — so a counter carrying several patterns costs no
// more room than a counter carrying one, and the board keeps a single weight of mark on it.
const PATTERN_WIDTH = 0.05;
const HALO_MARGIN = 0.045;
const END_INSET = PATTERN_WIDTH;
const LINE_SCORE_SIZE = 0.28;
const LINE_SCORE_INSET = 0.06;
const DIGIT_ADVANCE = 0.57;
const LINE_SCORE_RANK_X = LINE_SCORE_INSET + LINE_SCORE_SIZE * DIGIT_ADVANCE;

export function renderPatterns(s: State, el: SVGElement): void {
  const annotating = isAnnotating(s);
  // longest first, so a nested pattern is painted over the one that contains it, never under it
  const patterns = annotating ? findPatterns(s.pieces, s.dimensions).sort((a, b) => b.points - a.points) : [];
  const hash = [annotating, s.orientation, s.dimensions.width, s.dimensions.height, ...patterns.map(patternHash)].join(
    ';',
  );
  if (el.getAttribute('cgHash') === hash) return;
  el.setAttribute('cgHash', hash);
  setAttributes(el, { viewBox: `0 0 ${s.dimensions.width} ${s.dimensions.height}` });
  while (el.firstChild) el.removeChild(el.firstChild);
  for (const pattern of patterns) el.appendChild(renderPattern(s, pattern));
  // a line worth nothing still says so, so that the figures read as a set rather than as highlights
  if (annotating) for (const mark of renderLineScores(s, patterns)) el.appendChild(mark);
}

// Every square of a rank shares a screen row and every square of a file a screen column, whichever
// way round the board is being viewed, so one square of each line is enough to place its figure.
function renderLineScores(s: State, patterns: Pattern[]): SVGElement[] {
  const bd = s.dimensions;
  const scores = lineScores(patterns, bd);
  const marks: SVGElement[] = [];
  scores.files.forEach((score, i) => {
    const [x] = toBoardPos([i + 1, 1], s.orientation, bd);
    marks.push(renderLineScore(score, x, LINE_SCORE_INSET, 'middle', 'hanging'));
  });
  scores.ranks.forEach((score, i) => {
    const [, y] = toBoardPos([1, i + 1], s.orientation, bd);
    marks.push(renderLineScore(score, LINE_SCORE_RANK_X, y, 'middle', 'middle'));
  });
  return marks;
}

function renderLineScore(score: number, x: number, y: number, anchor: string, baseline: string): SVGElement {
  const el = setAttributes(createSVG('text'), {
    class: 'line-score',
    x,
    y,
    'font-size': LINE_SCORE_SIZE,
    'text-anchor': anchor,
    'dominant-baseline': baseline,
  });
  el.textContent = String(score);
  return el;
}

function patternHash(pattern: Pattern): string {
  return [pattern.from, pattern.to, pattern.points].join(',');
}

function isAnnotating(s: State): boolean {
  if (s.showPatterns === 'never') return false;
  return s.showPatterns === 'always' || countersOnBoard(s) === s.dimensions.width * s.dimensions.height;
}

// a0 holds a counter being dragged out of the pocket, which is not standing on the board yet
function countersOnBoard(s: State): number {
  let count = 0;
  for (const key of s.pieces.keys()) if (key !== 'a0') count++;
  return count;
}

// Halo before core, one pattern at a time. With every pattern the same width that ordering is what
// keeps them apart: where one runs over another, its halo leaves a dark tick across the line at each
// of its ends, and the shorter ones are drawn last so their ticks land on top.
function renderPattern(s: State, pattern: Pattern): SVGElement {
  const bd = s.dimensions;
  const [x1, y1] = toBoardPos(pattern.from, s.orientation, bd);
  const [x2, y2] = toBoardPos(pattern.to, s.orientation, bd);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const insetX = ((x2 - x1) / length) * END_INSET;
  const insetY = ((y2 - y1) / length) * END_INSET;
  const ends = { x1: x1 + insetX, y1: y1 + insetY, x2: x2 - insetX, y2: y2 - insetY };

  const g = setAttributes(createSVG('g'), { class: 'pattern', 'data-points': pattern.points });
  g.appendChild(
    setAttributes(createSVG('line'), { ...ends, class: 'halo', 'stroke-width': PATTERN_WIDTH + HALO_MARGIN }),
  );
  g.appendChild(setAttributes(createSVG('line'), { ...ends, class: 'core', 'stroke-width': PATTERN_WIDTH }));
  return g;
}

function toBoardPos(pos: cg.Pos, orientation: cg.Orientation, bd: cg.BoardDimensions): cg.NumberPair {
  const [x, y] = T.mapToP1Inverse[orientation](pos, bd);
  return [x - 0.5, bd.height + 0.5 - y];
}
