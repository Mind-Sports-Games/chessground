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

export function pos2px(
  pos: cg.Pos,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
  _variant: cg.Variant,
  orientation: cg.Orientation,
  pieces: cg.Pieces,
): cg.NumberPair {
  const col = pos[0];
  const row = pos[1];

  const colWidth = bounds.width / 15;
  const borderHeight = bounds.height / 15;
  const pieceRadius = colWidth / 2;

  const slot = col <= 6 ? col + 1 : col + 2;
  const x = (slot - 0.5) * colWidth;

  const p1Pos: cg.Pos = T.mapToP1[orientation](pos, bd);
  const stackSize = stackCount(pieces, p1Pos);
  const isBottom = orientation === 'p1' ? row === 1 : row === 2;
  const isFlipped = orientation !== 'p1';

  const halfPlayHeight = (bounds.height - 2 * borderHeight) / 2;
  const stackSpacing = (halfPlayHeight - 5.22 * pieceRadius) / 4;
  const yBottom = bounds.height - borderHeight - pieceRadius - (stackSize - 1) * stackSpacing;
  const yTop = borderHeight + pieceRadius + (stackSize - 1) * stackSpacing;

  const y = (isBottom && !isFlipped) || (!isBottom && isFlipped) ? yBottom : yTop;

  return [x, y];
}
