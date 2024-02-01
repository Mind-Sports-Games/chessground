import { HeadlessState, State } from './state';
import * as cg from './types';
import * as board from './board';
import * as util from './util';
import { cancel as cancelDrag } from './drag';
import predrop from './predrop';

export function setDropMode(s: State, piece?: cg.Piece): void {
  s.dropmode.active = true;
  s.dropmode.piece = piece;

  cancelDrag(s);

  board.unselect(s);

  if (piece && board.isPredroppable(s)) {
    s.predroppable.dropDests = predrop(s.pieces, piece, s.dimensions, s.variant);
  }
}

export function cancelDropMode(s: HeadlessState): void {
  s.dropmode.active = false;
  util.callUserFunction(s.dropmode.events?.cancel);
}

export function drop(s: State, e: cg.MouchEvent): void {
  if (!s.dropmode.active) return;

  board.unsetPremove(s);
  board.unsetPredrop(s);

  const piece = s.dropmode.piece;

  if (piece) {
    s.pieces.set('a0', piece);
    const position = util.eventPosition(e);
    const dest = position && board.getKeyAtDomPos(position, s.orientation, s.dom.bounds(), s.dimensions);
    if (dest) board.dropNewPiece(s, 'a0', dest, s.variant === 'backgammon');
  }
  //stop processing event clicks, as click drops will trigger a screen click and select a piece.
  e.stopPropagation();
  e.preventDefault();
  s.dom.redraw();
}
