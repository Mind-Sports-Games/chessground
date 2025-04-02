import {setPieces, unselect} from '../../board';
import type {HeadlessState} from '../../state';
import {Key, NumberPair, Orientation, Piece, Variant} from "../../types";
import {callUserFunction} from '../../util';
import {computeMoveImpact} from './engine';

import {add, getCentre, isCell, mult, pos2key, pxToCell, sub} from './util';

/**
  from a position in pixels, returns the key of the square
  by default squares positions in CG are computed like this :
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

  But as triangular grid, we have to take into account the margin between the border of the board
  ... and the limit of the area : [TODO Alex: but why is there a margin in this case not for a square board?]
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
	pos: NumberPair,
	orientation: Orientation,
	bounds: ClientRect,
): Key | undefined => {
	let res = pxToCell(variant, pos, bounds);
	
	if (orientation == "p2") {
		const centre = getCentre(variant);
		res = add(centre, mult(-1, sub(res, centre)));
	}
	
	return isCell(variant, res)?
		pos2key(res):
		undefined;
};

export const baseMove = (variant: Variant, state: HeadlessState, orig: Key, dest: Key): Piece | boolean => {
	// Note: after you moved, you also receive the move from the API. But the piece is already gone, since you moved.
	if (!state.pieces.get(orig)) return false;
	
	const moveImpact = computeMoveImpact(variant, state.pieces, orig, dest);
	if (!moveImpact) return false;
	
	if (dest === state.selected) unselect(state);
	callUserFunction(state.events.move, orig, dest, moveImpact.capture);
	
	setPieces(state, moveImpact.diff);
	
	state.lastMove = [orig, dest];
	state.check = undefined;
	callUserFunction(state.events.change);
	return moveImpact.capture || true;
};
