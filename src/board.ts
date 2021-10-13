import { HeadlessState } from './state';
import {
  pos2key,
  key2pos,
  opposite,
  oppositeOrientation,
  distanceSq,
  allPos,
  computeSquareCenter,
  containsX,
  callUserFunction
} from './util';
import { premove, queen, knight } from './premove';
import predrop from './predrop'
import * as cg from './types';
import * as T from './transformations';


export function setOrientation(state: HeadlessState, o: cg.Orientation): void {
  state.orientation = o;
  state.animation.current = state.draggable.current = state.selected = undefined;
}

export function toggleOrientation(state: HeadlessState): void {
  setOrientation(state, oppositeOrientation(state.orientation));
}

export function reset(state: HeadlessState): void {
  state.lastMove = undefined;
  unselect(state);
  unsetPremove(state);
  unsetPredrop(state);
}

export function setPieces(state: HeadlessState, pieces: cg.PiecesDiff): void {
  for (const [key, piece] of pieces) {
    if (piece) state.pieces.set(key, piece);
    else state.pieces.delete(key);
  }
}

// export function setCheck(state: HeadlessState, color: cg.Color | boolean): void {
//   state.check = undefined;
//   if (color === true) color = state.turnColor;
//   if (color)
//     for (const [k, p] of state.pieces) {
//       if (p.role === 'k-piece' && p.color === color) {
//         state.check = k;
//       }
//   }
// }

function setPremove(state: HeadlessState, orig: cg.Key, dest: cg.Key, meta: cg.SetPremoveMetadata): void {
  unsetPredrop(state);
  state.premovable.current = [orig, dest];
  callUserFunction(state.premovable.events.set, orig, dest, meta);
}

export function unsetPremove(state: HeadlessState): void {
  if (state.premovable.current) {
    state.premovable.current = undefined;
    callUserFunction(state.premovable.events.unset);
  }
}

function setPredrop(state: HeadlessState, role: cg.Role, key: cg.Key): void {
  unsetPremove(state);
  state.predroppable.current = { role, key };
  callUserFunction(state.predroppable.events.set, role, key);
}

export function unsetPredrop(state: HeadlessState): void {
  const pd = state.predroppable;
  if (pd.current) {
    pd.current = undefined;
    callUserFunction(pd.events.unset);
  }
}

function cancelDropMode(s: HeadlessState): void {
  s.dropmode.active = false;
  callUserFunction(s.dropmode.events?.cancel);
}

function tryAutoCastle(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  if (!state.autoCastle) return false;
  const king = state.pieces.get(orig);
  if (!king || king.role !== 'k-piece') return false;
  const origPos = key2pos(orig);
  if (origPos[0] !== 5) return false;
  if (origPos[1] !== 1 && origPos[1] !== 8) return false;
  const destPos = key2pos(dest);
  let oldRookPos, newRookPos, newKingPos;
  if (destPos[0] === 7 || destPos[0] === 8) {
    oldRookPos = pos2key([8, origPos[1]]);
    newRookPos = pos2key([6, origPos[1]]);
    newKingPos = pos2key([7, origPos[1]]);
  } else if (destPos[0] === 3 || destPos[0] === 1) {
    oldRookPos = pos2key([1, origPos[1]]);
    newRookPos = pos2key([4, origPos[1]]);
    newKingPos = pos2key([3, origPos[1]]);
  } else return false;

  const rook = state.pieces.get(oldRookPos);
  if (!rook || rook.role !== 'r-piece') return false;

  state.pieces.delete(orig);
  state.pieces.delete(oldRookPos);

  state.pieces.set(newKingPos, king);
  state.pieces.set(newRookPos, rook);
  return true;
}

export function baseMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const origPiece = state.pieces.get(orig), destPiece = state.pieces.get(dest);
  if (orig === dest || !origPiece) return false;
  const captured = (destPiece && destPiece.color !== origPiece.color) ? destPiece : undefined;
  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);
  if (!tryAutoCastle(state, orig, dest)) {
    state.pieces.set(dest, origPiece);
    state.pieces.delete(orig);
  }
  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

export function baseNewPiece(state: HeadlessState, piece: cg.Piece, key: cg.Key, force?: boolean): boolean {
  if (state.pieces.has(key)) {
    if (force) state.pieces.delete(key);
    else return false;
  }
  callUserFunction(state.events.dropNewPiece, piece, key);
  state.pieces.set(key, piece);
  state.lastMove = [key];
  state.check = undefined;
  callUserFunction(state.events.change);
  state.movable.dests = undefined;
  state.dropmode.dropDests = undefined;
  state.turnColor = opposite(state.turnColor);
  return true;
}

function baseUserMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const result = baseMove(state, orig, dest);
  if (result) {
    state.movable.dests = undefined;
    state.dropmode.dropDests = undefined;
    state.turnColor = opposite(state.turnColor);
    state.animation.current = undefined;
  }
  return result;
}

export function userMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const holdTime = state.hold.stop();
      unselect(state);
      const metadata: cg.MoveMetadata = {
        premove: false,
        ctrlKey: state.stats.ctrlKey,
        holdTime,
      };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      return true;
    }
  } else if (canPremove(state, orig, dest)) {
    setPremove(state, orig, dest, {
      ctrlKey: state.stats.ctrlKey,
    });
    unselect(state);
    return true;
  }
  unselect(state);
  return false;
}

/**
 * TODO: I believe this function is always called with orig=='a0'. Maybe consider changing that parameter to piece/role instead.
 *       I think we currently artificially assign state.pieces[a0] to the current pocket piece being dragged/selected, but it is imho hackish
 *       and we might little by little make existing code agnostic of that hack instead of tightly coupling it to it and making it depend
 *       on having that there, with the eventual goal of making pocket dynamics more of a first class citizens rather than hacks on top of
 *       regular chess movements dynamics
 * */
export function dropNewPiece(state: HeadlessState, orig: cg.Key, dest: cg.Key, force?: boolean): void {
  const piece = state.pieces.get(orig);
  if (piece && (canDrop(state, orig, dest) || force)) {
    state.pieces.delete(orig);
    baseNewPiece(state, piece, dest, force);
    callUserFunction(state.movable.events.afterNewPiece, piece.role, dest, {
      premove: false,
      predrop: false,
    });
  } else if (piece && canPredrop(state, orig, dest)) {
    setPredrop(state, piece.role, dest);
  } else {
    unsetPremove(state);
    unsetPredrop(state);
    cancelDropMode(state);
  }
  state.pieces.delete(orig);
  unselect(state);
}

export function selectSquare(state: HeadlessState, key: cg.Key, force?: boolean): void {
  callUserFunction(state.events.select, key);
  if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state);
      state.hold.cancel();
      return;
    } else if ((state.selectable.enabled || force) && state.selected !== key) {
      if (userMove(state, state.selected, key)) {
        state.stats.dragged = false;
        return;
      }
    }
  }
  if (isMovable(state, key) || isPremovable(state, key)) {
    setSelected(state, key);
    state.hold.start();
  }
}

export function setSelected(state: HeadlessState, key: cg.Key): void {
  state.selected = key;
  if (isPremovable(state, key)) {
    state.premovable.dests = premove(state.pieces, key, state.premovable.castle, state.geometry, state.variant, state.chess960);
  } else {
    state.premovable.dests = undefined;
    state.predroppable.dropDests = undefined;
  }
}

export function unselect(state: HeadlessState): void {
  state.selected = undefined;
  state.premovable.dests = undefined;
  state.predroppable.dropDests = undefined;
  state.hold.cancel();
}

function isMovable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (state.movable.color === 'both' || (state.movable.color === piece.color && state.turnColor === piece.color))
  );
}

export function canMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  return (
    orig !== dest && isMovable(state, orig) && (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest))
  );
}

function canDrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && dest && (orig === dest || !state.pieces.has(dest)) && (
    state.movable.color === 'both' || (
      state.movable.color === piece.color &&
        state.turnColor === piece.color
    ));
}

function isPremovable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return !!piece && state.premovable.enabled && state.movable.color === piece.color && state.turnColor !== piece.color;
}

export function isPredroppable(state: HeadlessState): boolean {
  const piece = state.dropmode.active ? state.dropmode.piece : state.draggable.current?.piece;
  return (
    !!piece &&
    (state.dropmode.active || state.draggable.current?.orig === 'a0') &&
    state.predroppable.enabled &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
  );
}

function canPremove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  return (
    orig !== dest && isPremovable(state, orig) && containsX(premove(state.pieces, orig, state.premovable.castle, state.geometry, state.variant, state.chess960), dest)
  );
}

/*
 * TODO: orig is probably always equal to a0 and only used for getting the piece - consider replacing that param with "piece" (see also dropNewPiece(...) )
 **/
function canPredrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  const destPiece = state.pieces.get(dest);
  if (!piece){
    return false;
  }
  const isValidPredrop = containsX(predrop(state.pieces, piece, state.geometry, state.variant), dest);
 
  return (
    (!destPiece || destPiece.color !== state.movable.color) &&
    state.predroppable.enabled &&
    isValidPredrop &&
    state.movable.color === piece.color &&
    state.turnColor !== piece.color
  );
}

export function isDraggable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.draggable.enabled &&
    (state.movable.color === 'both' ||
      (state.movable.color === piece.color && (state.turnColor === piece.color || state.premovable.enabled)))
  );
}

export function playPremove(state: HeadlessState): boolean {
  const move = state.premovable.current;
  if (!move) return false;
  const orig = move[0], dest = move[1];
  let success = false;
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const metadata: cg.MoveMetadata = { premove: true };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      success = true;
    }
  }
  unsetPremove(state);
  return success;
}

export function playPredrop(state: HeadlessState, validate: (drop: cg.Drop) => boolean): boolean {
  const drop = state.predroppable.current;
  let success = false;
  if (!drop) return false;
  if (validate(drop)) {
    const piece = {
      role: drop.role,
      color: state.movable.color,
    } as cg.Piece;
    if (baseNewPiece(state, piece, drop.key)) {
      callUserFunction(state.movable.events.afterNewPiece, drop.role, drop.key, {
        premove: false,
        predrop: true,
      });
      success = true;
    }
  }
  unsetPredrop(state);
  return success;
}

export function cancelMove(state: HeadlessState): void {
  unsetPremove(state);
  unsetPredrop(state);
  unselect(state);
}

export function stop(state: HeadlessState): void {
  state.movable.color = state.movable.dests = state.dropmode.dropDests = state.animation.current = undefined;
  cancelMove(state);
}

export function getKeyAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  _: boolean,
  bounds: ClientRect,
  geom: cg.Geometry
): cg.Key | undefined {
  const bd = cg.dimensions[geom];
  let file = Math.ceil(bd.width * ((pos[0] - bounds.left) / bounds.width));
  //if (!asWhite) file = bd.width + 1 - file;
  let rank = Math.ceil(bd.height - (bd.height * ((pos[1] - bounds.top) / bounds.height)));
  //if (!asWhite) rank = bd.height + 1 - rank;
  pos = [file, rank]
  console.log("getKeyAtDom: ", pos)
  pos = T.mapToWhite[orientation](pos, bd);
  console.log("getKeyAtDom - map to white: ", pos)
  console.log("getKeyAtDom - map to white - pos2key: ", pos2key(pos))
  return (pos[0] > 0 && pos[0] < bd.width + 1 && pos[1] > 0 && pos[1] < bd.height + 1) ? pos2key(pos) : undefined;
}


export function whitePov(s: HeadlessState): boolean {
  return s.myColor === 'white';
}

export function getSnappedKeyAtDomPos(
  orig: cg.Key,
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  bounds: ClientRect,
  geom: cg.Geometry
): cg.Key | undefined {
  const bd = cg.dimensions[geom];
  const origPos = key2pos(orig);
  const validSnapPos = allPos(geom).filter(pos2 => {
    return queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]);
  });
  const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2key(pos2), orientation, bounds, bd));
  const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
  const [, closestSnapIndex] = validSnapDistances.reduce((a, b, index) => (a[0] < b ? a : [b, index]), [
    validSnapDistances[0],
    0,
  ]);
  return pos2key(validSnapPos[closestSnapIndex]);
}
