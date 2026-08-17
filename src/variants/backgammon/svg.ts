import * as cg from '../../types';
import { pos2key } from '../../util';
import * as T from '../../transformations';

function stackCount(pieces: cg.Pieces, pos: cg.Pos): number {
  const piece = pieces.get(pos2key(pos));
  if (!piece) return 1;
  const m = piece.role.match(/^[a-z](\d+)-piece$/);
  return m ? Math.min(parseInt(m[1]), 5) : 1;
}

export function circleWidth(bounds: ClientRect): [number, number] {
  const colWidth = bounds.width / 15;
  const stroke = colWidth / 15;
  return [stroke * 0.75, stroke];
}

export function circleRadius(bounds: ClientRect, widths: [number, number]): number {
  const colWidth = bounds.width / 15;
  return colWidth / 2 - widths[1] / 2 + colWidth / 8;
}

// cy of the topmost visible checker in each piece image (viewBox 0 0 321 2046).
// Index 0 = 1 checker, index 4 = 5 checkers (images cap at 5 visible).
// Bottom pieces (w{N}b.svg): stack grows upward from the bottom border.
const BOTTOM_CHECKER_CY = [1885.5, 1580.5, 1275.5, 970.5, 665.5];
// Top pieces (w{N}t.svg): stack grows downward from the top border.
const TOP_CHECKER_CY = [160.5, 466.5, 772.5, 1078.5, 1384.5];
const IMAGE_HEIGHT = 2046;

export function pos2px(
  pos: cg.Pos,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
  _variant: cg.Variant,
  orientation: cg.Orientation,
  pieces: cg.Pieces,
  extraStack = 0,
): cg.NumberPair {
  const col = pos[0];
  const row = pos[1];

  const colWidth = bounds.width / 15;

  // For p1/p1vflip: cols 1-6 are left of the bar (slot = col+1), cols 7-12 right (slot = col+2).
  // For p2: the board is horizontally mirrored, so display cols 1-6 end up on the RIGHT side
  // of the bar (they are P1's right-half pieces with margin-left=2*W/15 → slot = col+2),
  // and display cols 7-12 are on the LEFT side (slot = col+1).
  const rightOfBar = orientation === 'p2' ? col <= 6 : col > 6;
  const slot = rightOfBar ? col + 2 : col + 1;
  const x = (slot - 0.5) * colWidth;

  const p1Pos: cg.Pos = T.mapToP1[orientation](pos, bd);
  const rawStack = stackCount(pieces, p1Pos) + extraStack;
  const stackSize = Math.max(Math.min(rawStack, 5), 1);
  const isBottom = orientation === 'p1' ? row === 1 : row === 2;
  const isFlipped = orientation !== 'p1';
  const visuallyBottom = (isBottom && !isFlipped) || (!isBottom && isFlipped);

  // Piece element height = bounds.height * 6.5/15 (CSS calc(100% * 6.5/15)).
  // Translate-y for visually-bottom pieces = H/2; for visually-top = 0 + margin-top (W/15).
  const pieceHeight = (bounds.height * 6.5) / 15;
  const pieceTranslateY = visuallyBottom ? bounds.height / 2 : bounds.width / 15;
  const cy = (visuallyBottom ? BOTTOM_CHECKER_CY : TOP_CHECKER_CY)[stackSize - 1];
  const y = pieceTranslateY + (cy * pieceHeight) / IMAGE_HEIGHT;

  return [x, y];
}
