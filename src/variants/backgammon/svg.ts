import * as cg from '../../types';
import { pos2key } from '../../util';
import * as T from '../../transformations';

function stackCount(pieces: cg.Pieces, pos: cg.Pos): number {
  const piece = pieces.get(pos2key(pos));
  if (!piece) return 1;
  const m = piece.role.match(/^[a-z](\d+)-piece$/);
  return m ? Math.min(parseInt(m[1]), 5) : 1;
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
  const vUnit = bounds.height / 60;
  const yBottomBase = bounds.height - bounds.height / 15;

  const slot = col <= 6 ? col + 1 : col + 2;
  const x = (slot - 0.5) * colWidth;

  const p1Pos: cg.Pos = T.mapToP1[orientation](pos, bd);
  const stackSize = stackCount(pieces, p1Pos);
  const isBottom = orientation === 'p1' ? row === 1 : row === 2;
  const isFlipped = orientation !== 'p1';

  // perfect pos for top for stackSize=1 : (6 * vUnit)
  // perfect pos for bottom for stackSize=1 : yBottomBase
  const yBottom = yBottomBase - vUnit * 2 - (stackSize - 1) * vUnit * 4;
  const yTop = 6 * vUnit + (stackSize - 1) * vUnit * 4;

  const y = (isBottom && !isFlipped) || (!isBottom && isFlipped) ? yBottom : yTop;

  return [x, y];
}
