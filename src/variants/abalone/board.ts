import { setPieces, unselect } from '../../board';
import type { HeadlessState } from '../../state';
import { Key, NumberPair, Orientation, Piece, Variant } from '../../types';
import { callUserFunction } from '../../util';
import { computeMoveImpact } from './engine';

import { cellrelToCell, dist2, getSquareDimensions_bounded, isCell, mult, pos2key, pxToCellrel } from './util';

/**
  From a position in pixels, returns the key of the square
  by default squares positions in CG are computed like this:
      -----------------
     |_ _ _ _ _ _ _ _ _| 8
     |_ _ _ _ _ _ _ _ _| 7
     |_ _ _ _ _ _ _ _ _| 6
     |_ _ _ _ _ _ _ _ _| 5
     |_ _ _ _ _ _ _ _ _| 4
     |_ _ _ _ _ _ _ _ _| 3
     |_ _ _ _ _ _ _ _ _| 2
     |_ _ _ _ _ _ _ _ _| 1
      -----------------
      a b c d e f g h i

  But with the triangular grid, we have to take into account the margin between the border of the board
  ... and the limit of the area: [TODO? Alex: but why is there a margin in this case not for a square board?]
      ----------------------
     |                      |margin
     |      _ _ _ _ _       | 9
     |    /_ _ _ _ _ _\     | 8
     |   /_ _ _ _ _ _ _\    | 7
     |  /_ _ _ _ _ _ _ _\   | 6
     | /_ _ _ _ _ _ _ _ _\  | 5
     | \ _ _ _ _ _ _ _ _ /  | 4
     |  \ _ _ _ _ _ _ _ /   | 3
     |   \ _ _ _ _ _ _ /    | 2
     |    \ _ _ _ _ _ /     | 1
     |                      |margin
      ----------------------
              \ \ \ \ \ \ \ \ \
               a b c d e f g h i

    Used to know on which square the user clicked.
 */
export const getKeyAtDomPos = (
  variant: Variant,
  bounds: ClientRect,
  pos: NumberPair,
  orientation: Orientation,
): Key | undefined => {
  const d = getSquareDimensions_bounded(variant, bounds).width / 2;
  pos = [pos[0] - bounds.left - d, pos[1] - bounds.top - d];

  let res = pxToCellrel(variant, bounds, pos);
  let rres = [Math.round(res[0]), Math.round(res[1])] as NumberPair; // @TODO: rename properly

  if (dist2(res, rres) > 0.4) {
    return undefined;
  }
  res = rres;

  if (orientation == 'p2') res = mult(-1, res);
  res = cellrelToCell(variant, res);

  return isCell(variant, res) ? pos2key(res) : undefined;
};

export const baseMove = (state: HeadlessState, orig: Key, dest: Key): Piece | boolean => {
  // Note: after you moved, you also receive the move from the API. But the piece is already gone, since you moved.
  if (!state.pieces.get(orig)) return false;

  const moveImpact = computeMoveImpact(state.variant, state.pieces, orig, dest);
  if (!moveImpact) return false;

  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, moveImpact.capture); // communicate the move to other players

  setPieces(state, moveImpact.diff);

  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return moveImpact.capture || true; //TODO Wtf?
};
