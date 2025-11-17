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
  callUserFunction,
  calculatePieceGroup,
  calculateGoScores,
  calculateGoCaptures,
  calculateBackgammonDropChanges,
  oppositeOrientationBG,
  owareUpdatePiecesFromMove,
  togyzkumalakUpdatePiecesFromMove,
  backgammonUpdatePiecesFromMove,
  dameoUpdatePiecesFromMove,
  calculateFlippingPieces,
} from './util';
import { queen, knight } from './premove';
import predrop from './predrop';
import * as cg from './types';
import * as T from './transformations';

export function setOrientation(state: HeadlessState, o: cg.Orientation): void {
  state.orientation = o;
  state.animation.current = state.draggable.current = state.selected = undefined;
}

export function toggleOrientation(state: HeadlessState): void {
  if (state.variant === 'backgammon' || state.variant === 'hyper' || state.variant === 'nackgammon') {
    setOrientation(state, oppositeOrientationBG(state.orientation));
  } else setOrientation(state, oppositeOrientation(state.orientation));
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
  const destPos = key2pos(dest);
  if ((origPos[1] !== 1 && origPos[1] !== 8) || origPos[1] !== destPos[1]) return false;
  if (origPos[0] === 5 && !state.pieces.has(dest)) {
    if (destPos[0] === 7) dest = pos2key([8, destPos[1]]);
    else if (destPos[0] === 3) dest = pos2key([1, destPos[1]]);
  }
  const rook = state.pieces.get(dest);
  if (!rook || rook.playerIndex !== king.playerIndex || rook.role !== 'r-piece') return false;

  state.pieces.delete(orig);
  state.pieces.delete(dest);

  if (origPos[0] < destPos[0]) {
    state.pieces.set(pos2key([7, destPos[1]]), king);
    state.pieces.set(pos2key([6, destPos[1]]), rook);
  } else {
    state.pieces.set(pos2key([3, destPos[1]]), king);
    state.pieces.set(pos2key([4, destPos[1]]), rook);
  }
  return true;
}

//update state pieces based on drop for specific game logics
function setDropVariantState(state: HeadlessState, piece: cg.Piece, key: cg.Key): void {
  switch (state.variant) {
    case 'flipello':
    case 'flipello10':
    case 'antiflipello':
    case 'octagonflipello': {
      const flipping = calculateFlippingPieces(state.dimensions, state.pieces, piece, key);
      const flipPiece: cg.Piece = { role: 'p-piece', playerIndex: state.turnPlayerIndex };
      flipping.forEach(key => state.pieces.set(key, flipPiece));
      state.pieces.set(key, piece);
      break;
    }
    case 'go19x19':
    case 'go13x13':
    case 'go9x9': {
      state.pieces.set(key, piece);
      const captured: cg.Key[] = calculateGoCaptures(key, state.pieces, state.dimensions);
      captured.map(k => state.pieces.delete(k));
      break;
    }
    case 'nackgammon':
    case 'hyper':
    case 'backgammon': {
      const destPiece = state.pieces.get(key);
      const capture = destPiece ? destPiece.playerIndex !== piece.playerIndex : false;
      const backgammonPieces: cg.PiecesDiff = calculateBackgammonDropChanges(state.pieces, piece, key);
      setPieces(state, backgammonPieces);
      updatePocketPieces(state, opposite(piece.playerIndex), true, capture);
      break;
    }
    default:
      state.pieces.set(key, piece);
  }
}

function updatePocketPieces(
  state: HeadlessState,
  capturedPiecePlayerIndex: cg.PlayerIndex,
  isDrop: boolean,
  isCapture: boolean,
): void {
  let playerCount = 0;
  let enemyCount = 0;

  state.pocketPieces.forEach(p => {
    const pCount = +p.role.split('-')[0].substring(1);
    if (p.playerIndex === capturedPiecePlayerIndex) {
      enemyCount = pCount;
    } else {
      playerCount = pCount;
    }
  });

  const newPocketPieces: cg.Piece[] = [];
  if (enemyCount > 0 || isCapture) {
    const piece = {
      role: `s${enemyCount + (isCapture ? 1 : 0)}-piece`,
      playerIndex: capturedPiecePlayerIndex,
    } as cg.Piece;
    newPocketPieces.push(piece);
  }
  if ((playerCount > 0 && !isDrop) || (isDrop && playerCount > 1)) {
    const piece = {
      role: `s${playerCount - (isDrop ? 1 : 0)}-piece`,
      playerIndex: opposite(capturedPiecePlayerIndex),
    } as cg.Piece;
    newPocketPieces.push(piece);
  }

  state.pocketPieces = newPocketPieces;
}

/**
 * called when a piece is moved from orig to dest
 * @returns: false if the move is invalid, true if the move is valid but no capture happened, or the captured piece if a capture happened
 */
export function baseMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const origPiece = state.pieces.get(orig),
    destPiece = state.pieces.get(dest);
  if ((orig === dest && state.variant !== 'togyzkumalak' && state.variant !== 'bestemshe') || !origPiece) return false;
  const captured = isCapture(state.variant, destPiece, origPiece);
  if (dest === state.selected) unselect(state);
  callUserFunction(state.events.move, orig, dest, captured);

  switch (state.variant) {
    case 'togyzkumalak':
    case 'bestemshe':
      setPieces(
        state,
        togyzkumalakUpdatePiecesFromMove(state.dimensions, state.pieces, orig, dest, state.variant === 'togyzkumalak'),
      );
      break;
    case 'oware':
      setPieces(state, owareUpdatePiecesFromMove(state.dimensions, state.pieces, orig, dest));
      break;
    case 'nackgammon':
    case 'hyper':
    case 'backgammon':
      if (captured) {
        updatePocketPieces(state, opposite(origPiece.playerIndex), false, true);
      }
      setPieces(state, backgammonUpdatePiecesFromMove(state.pieces, orig, dest));
      break;
    case 'dameo':
      setPieces(
        state,
        dameoUpdatePiecesFromMove(state.pieces, orig, dest, state.movable.captLen ?? 0, state.dimensions),
      );
      break;
    default:
      if (!tryAutoCastle(state, orig, dest)) {
        state.pieces.set(dest, origPiece);
        state.pieces.delete(orig);
      }
  }

  state.lastMove = [orig, dest];
  state.check = undefined;
  callUserFunction(state.events.change);
  return captured || true;
}

function isCapture(variant: cg.Variant, destPiece: cg.Piece | undefined, origPiece: cg.Piece): cg.Piece | undefined {
  switch (variant) {
    case 'togyzkumalak':
    case 'bestemshe': {
      //TODO account for wrapping around board (simimlar to oware capture)
      const count = destPiece && Number(destPiece.role.split('-')[0].substring(1));
      return destPiece && destPiece.playerIndex !== origPiece.playerIndex && count && (count === 2 || count % 2 === 1)
        ? destPiece
        : undefined;
    }
    case 'oware':
      //TODO this is more complicated to calculate... (but its only used for sound in lila atm)
      return destPiece && destPiece.playerIndex !== origPiece.playerIndex ? destPiece : undefined;
    default:
      return destPiece && destPiece.playerIndex !== origPiece.playerIndex ? destPiece : undefined;
  }
}

export function baseNewPiece(state: HeadlessState, piece: cg.Piece, key: cg.Key, force?: boolean): boolean {
  if (
    state.pieces.has(key) &&
    !(state.variant === 'backgammon' || state.variant === 'hyper' || state.variant === 'nackgammon')
  ) {
    if (force) state.pieces.delete(key);
    else return false;
  }
  callUserFunction(state.events.dropNewPiece, piece, key);
  setDropVariantState(state, piece, key);

  state.lastMove = [key];
  state.check = undefined;
  callUserFunction(state.events.change);
  state.movable.dests = undefined;
  state.dropmode.dropDests = undefined;
  if (!(state.variant === 'backgammon' || state.variant === 'hyper' || state.variant === 'nackgammon')) {
    //end turn action is used for backgammon games
    state.turnPlayerIndex = opposite(state.turnPlayerIndex);
  }
  return true;
}

function baseUserMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): cg.Piece | boolean {
  const result = state.baseMove(state, orig, dest);
  if (result) {
    state.movable.dests = undefined;
    state.dropmode.dropDests = undefined;
    state.liftable.liftDests = undefined;
    if (!(state.variant === 'backgammon' || state.variant === 'hyper' || state.variant === 'nackgammon')) {
      //end turn manually for backgammon games
      state.turnPlayerIndex = opposite(state.turnPlayerIndex);
    }
    state.animation.current = undefined;
  }
  return result;
}

export function baseLift(state: HeadlessState, dest: cg.Key): boolean {
  const piece = state.pieces.get(dest);
  if (piece) {
    if (state.variant === 'backgammon' || state.variant === 'hyper' || state.variant === 'nackgammon') {
      const count = piece.role.split('-')[0].substring(1);
      const letter = piece.role.charAt(0);
      if (count === '1') {
        state.pieces.delete(dest);
      } else {
        state.pieces.set(dest, {
          role: `${letter}${+count - 1}-piece` as cg.Role,
          playerIndex: piece.playerIndex,
        });
      }
    } else {
      state.pieces.delete(dest);
    }
    state.lastMove = [dest];
    state.check = undefined;
    state.movable.dests = undefined;
    state.dropmode.dropDests = undefined;
    state.liftable.liftDests = undefined;
    state.animation.current = undefined;
    callUserFunction(state.events.change);
    return true;
  } else {
    return false;
  }
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

export function userLift(state: HeadlessState, dest: cg.Key): boolean {
  const piece = state.pieces.get(dest);

  if (
    piece &&
    state.liftable.liftDests &&
    state.liftable.liftDests.length > 0 &&
    state.liftable.liftDests.includes(dest) &&
    state.turnPlayerIndex === piece.playerIndex
  ) {
    const result = baseLift(state, dest);
    if (result) {
      state.movable.dests = undefined;
      state.dropmode.dropDests = undefined;
      state.liftable.liftDests = undefined;
      state.animation.current = undefined;

      callUserFunction(state.liftable.events.after, dest);
      return true;
    }
  } else {
    unsetPremove(state);
    unsetPredrop(state);
    cancelDropMode(state);
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
    if (!state.onlyDropsVariant) cancelDropMode(state);
  }
  state.pieces.delete(orig);
  unselect(state);
}

export function setGoScore(state: HeadlessState): void {
  if (state.selectOnly) {
    state.simpleGoScores = calculateGoScores(state.selectedPieces, state.pieces, state.dimensions);
  } else {
    state.simpleGoScores = undefined;
  }
}

export function selectSquare(state: HeadlessState, key: cg.Key, force?: boolean): void {
  callUserFunction(state.events.select, key);
  if (state.selectOnly) {
    const piece = state.pieces.get(key);
    if (piece) {
      const pieceGroup = calculatePieceGroup(key, state.pieces, state.dimensions);
      if (state.selectedPieces.has(key)) {
        for (const k of pieceGroup) {
          state.selectedPieces.delete(k);
        }
      } else {
        for (const k of pieceGroup) {
          state.selectedPieces.set(k, piece);
        }
      }
      state.simpleGoScores = calculateGoScores(state.selectedPieces, state.pieces, state.dimensions);
    }
    return;
  } else {
    state.selectedPieces.clear();
    state.simpleGoScores = undefined;
  }
  if (state.selected) {
    if (state.selected === key && !state.draggable.enabled) {
      unselect(state);
      state.hold.cancel();
      return;
    } else if ((state.selectable.enabled || force) && state.selected !== key) {
      if (userMove(state, state.selected, key)) {
        state.stats.dragged = false;
        if (state.variant === 'dameo' && state.movable.captLen !== undefined && state.movable.captLen > 1) {
          // if we can continue capturing, keep the piece selected
          setSelected(state, key);
        }
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
    state.premovable.dests = state.premove(
      state.pieces,
      key,
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960,
    );
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
    (!state.onlyDropsVariant || (state.onlyDropsVariant && orig === 'a0')) &&
    (state.movable.playerIndex === 'both' ||
      (state.movable.playerIndex === piece.playerIndex && state.turnPlayerIndex === piece.playerIndex))
  );
}

export function canMove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  return (
    (orig !== dest || state.variant === 'togyzkumalak' || state.variant === 'bestemshe') &&
    isMovable(state, orig) &&
    (state.movable.free || !!state.movable.dests?.get(orig)?.includes(dest))
  );
}

function canDrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    (orig === dest ||
      !state.pieces.has(dest) ||
      state.variant === 'backgammon' ||
      state.variant === 'hyper' ||
      state.variant === 'nackgammon') &&
    (state.movable.playerIndex === 'both' ||
      (state.movable.playerIndex === piece.playerIndex && state.turnPlayerIndex === piece.playerIndex)) &&
    !!(
      (state.dropmode.dropDests &&
        state.dropmode.dropDests.has(piece.role) &&
        state.dropmode.dropDests.get(piece.role)?.includes(dest)) ||
      state.variant === 'crazyhouse'
    )
  );
}

function isPremovable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.premovable.enabled &&
    state.movable.playerIndex === piece.playerIndex &&
    state.turnPlayerIndex !== piece.playerIndex
  );
}

export function isPredroppable(state: HeadlessState): boolean {
  const piece = state.dropmode.active ? state.dropmode.piece : state.draggable.current?.piece;
  return (
    !!piece &&
    (state.dropmode.active || state.draggable.current?.orig === 'a0') &&
    state.predroppable.enabled &&
    state.movable.playerIndex === piece.playerIndex &&
    state.turnPlayerIndex !== piece.playerIndex
  );
}

function canPremove(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  return (
    orig !== dest &&
    isPremovable(state, orig) &&
    containsX(
      state.premove(state.pieces, orig, state.premovable.castle, state.dimensions, state.variant, state.chess960),
      dest,
    )
  );
}

/*
 * TODO: orig is probably always equal to a0 and only used for getting the piece - consider replacing that param with "piece" (see also dropNewPiece(...) )
 **/
function canPredrop(state: HeadlessState, orig: cg.Key, dest: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  const destPiece = state.pieces.get(dest);
  if (!piece) {
    return false;
  }
  const isValidPredrop = containsX(predrop(state.pieces, piece, state.dimensions, state.variant), dest);
  return (
    (!destPiece || destPiece.playerIndex !== state.movable.playerIndex) &&
    state.predroppable.enabled &&
    isValidPredrop &&
    state.movable.playerIndex === piece.playerIndex &&
    state.turnPlayerIndex !== piece.playerIndex
  );
}

export function isDraggable(state: HeadlessState, orig: cg.Key): boolean {
  const piece = state.pieces.get(orig);
  return (
    !!piece &&
    state.draggable.enabled &&
    (state.movable.playerIndex === 'both' ||
      (state.movable.playerIndex === piece.playerIndex &&
        (state.turnPlayerIndex === piece.playerIndex || state.premovable.enabled)))
  );
}

export function playPremove(state: HeadlessState): boolean {
  const move = state.premovable.current;
  if (!move) return false;
  const orig = move[0],
    dest = move[1];
  let success = false;
  if (canMove(state, orig, dest)) {
    const result = baseUserMove(state, orig, dest);
    if (result) {
      const metadata: cg.MoveMetadata = { premove: true };
      if (result !== true) metadata.captured = result;
      callUserFunction(state.movable.events.after, orig, dest, metadata);
      success = true;
      unsetPremove(state);
    }
  } else {
    if (canPremove(state, orig, dest)) {
      success = true;
    } else {
      unsetPremove(state);
    }
  }
  return success;
}

export function playPredrop(state: HeadlessState, validate: (drop: cg.Drop) => boolean): boolean {
  const drop = state.predroppable.current;
  let success = false;
  if (!drop) return false;
  if (validate(drop)) {
    const piece = {
      role: drop.role,
      playerIndex: state.movable.playerIndex,
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
  state.movable.playerIndex =
    state.movable.dests =
    state.dropmode.dropDests =
    state.liftable.liftDests =
    state.animation.current =
      undefined;
  state.gameButtonsActive = false;
  cancelMove(state);
}

// triggered when we click on the svg area (a piece, a square or even an area outside the board drawn can be below the cursor).
// @return the key of the square that was clicked, or undefined if the click was outside the board.
export function getKeyAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
  variant: cg.Variant = 'chess',
): cg.Key | undefined {
  const bgBorder = 1 / 15;
  const file =
    variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon'
      ? (pos[0] - bounds.left) / bounds.width < 1 / 15 ||
        (pos[0] - bounds.left) / bounds.width >= 14 / 15 ||
        ((pos[0] - bounds.left) / bounds.width >= 7 / 15 && (pos[0] - bounds.left) / bounds.width <= 8 / 15)
        ? undefined
        : (pos[0] - bounds.left) / bounds.width <= 7 / 15
          ? Math.ceil(bd.width * ((pos[0] - bounds.left - bounds.width * bgBorder) / (bounds.width * 12 * bgBorder)))
          : Math.ceil(
              bd.width * ((pos[0] - bounds.left - bounds.width * 2 * bgBorder) / (bounds.width * 12 * bgBorder)),
            )
      : Math.ceil(bd.width * ((pos[0] - bounds.left) / bounds.width));
  const rank =
    variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon'
      ? (pos[1] - bounds.top) / bounds.height <= 1 / 15 ||
        (pos[1] - bounds.top) / bounds.height >= 14 / 15 ||
        ((pos[1] - bounds.top) / bounds.height >= 6 / 15 && (pos[1] - bounds.top) / bounds.height <= 9 / 15)
        ? undefined
        : Math.ceil(bd.height - bd.height * ((pos[1] - bounds.top) / bounds.height))
      : Math.ceil(bd.height - bd.height * ((pos[1] - bounds.top) / bounds.height));
  if (rank === undefined || file === undefined) return undefined;
  pos = [file, rank];
  pos = T.mapToP1[orientation](pos, bd);
  return pos[0] > 0 && pos[0] < bd.width + 1 && pos[1] > 0 && pos[1] < bd.height + 1 ? pos2key(pos) : undefined;
}

export function areMyDiceAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  myPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  cubeActions: cg.CubeAction[] = [],
): boolean {
  if (cubeActions && cubeActions.length > 0) return false;
  if (turnPlayerIndex !== myPlayerIndex) return false;
  const correctWidth =
    (orientation === 'p1' && turnPlayerIndex === 'p2') || (orientation === 'p1vflip' && turnPlayerIndex === 'p1')
      ? (pos[0] - bounds.left) / bounds.width > 1 / 15 && (pos[0] - bounds.left) / bounds.width < 7 / 15
      : (pos[0] - bounds.left) / bounds.width > 8 / 15 && (pos[0] - bounds.left) / bounds.width < 14 / 15;
  const correctHeight =
    (pos[1] - bounds.top) / bounds.height > 6.5 / 15 && (pos[1] - bounds.top) / bounds.height < 8.5 / 15;
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctWidth && correctHeight;
}

function isButtonAtPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  placement: 'left' | 'right',
): boolean {
  const rightBound = placement === 'left' ? [9.625 / 15, 12.375 / 15] : [2.625 / 15, 5.375 / 15];
  const leftBound = placement === 'left' ? [2.625 / 15, 5.375 / 15] : [9.625 / 15, 12.375 / 15];
  const correctWidth =
    (orientation === 'p1' && turnPlayerIndex === 'p2') || (orientation === 'p1vflip' && turnPlayerIndex === 'p1')
      ? (pos[0] - bounds.left) / bounds.width > rightBound[0] && (pos[0] - bounds.left) / bounds.width < rightBound[1]
      : (pos[0] - bounds.left) / bounds.width > leftBound[0] && (pos[0] - bounds.left) / bounds.width < leftBound[1];
  const correctHeight =
    (pos[1] - bounds.top) / bounds.height > 6.95 / 15 && (pos[1] - bounds.top) / bounds.height < 8.05 / 15;
  return correctWidth && correctHeight;
}

export function isUndoButtonAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  myPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  cubeActions: cg.CubeAction[] = [],
): boolean {
  if (cubeActions && cubeActions.length > 0) return false;
  if (turnPlayerIndex !== myPlayerIndex) return false;
  const correctPlacement = isButtonAtPos(pos, orientation, turnPlayerIndex, bounds, 'left');
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctPlacement;
}

export function isDoubleButtonAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  myPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  cubeActions: cg.CubeAction[] = [],
): boolean {
  if (!(cubeActions && cubeActions.includes('offer'))) return false;
  if (turnPlayerIndex !== myPlayerIndex) return false;
  const correctPlacement = isButtonAtPos(pos, orientation, turnPlayerIndex, bounds, 'left');
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctPlacement;
}

export function isRollButtonAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  myPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  cubeActions: cg.CubeAction[] = [],
): boolean {
  if (!(cubeActions && cubeActions.includes('offer'))) return false;
  if (turnPlayerIndex !== myPlayerIndex) return false;
  const correctPlacement = isButtonAtPos(pos, orientation, turnPlayerIndex, bounds, 'right');
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctPlacement;
}

export function isDropButtonAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  myPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  cubeActions: cg.CubeAction[] = [],
): boolean {
  if (!(cubeActions && cubeActions.includes('reject'))) return false;
  if (turnPlayerIndex !== myPlayerIndex) return false;
  const correctPlacement = isButtonAtPos(pos, orientation, turnPlayerIndex, bounds, 'left');
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctPlacement;
}

export function isTakeButtonAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  myPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  cubeActions: cg.CubeAction[] = [],
): boolean {
  if (!(cubeActions && cubeActions.includes('accept'))) return false;
  if (turnPlayerIndex !== myPlayerIndex) return false;
  const correctPlacement = isButtonAtPos(pos, orientation, turnPlayerIndex, bounds, 'right');
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctPlacement;
}

export function isAutoRollButtonAtDomPos(
  pos: cg.NumberPair,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
  autoRoll: boolean | undefined,
): boolean {
  if (autoRoll === undefined) return false;
  const correctWidth = (pos[0] - bounds.left) / bounds.width < 8 / 15 && (pos[0] - bounds.left) / bounds.width > 7 / 15;
  const correctHeight =
    (pos[1] - bounds.top) / bounds.height > 7.65 / 15 && (pos[1] - bounds.top) / bounds.height < 8.4 / 15;
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctWidth && correctHeight;
}

export function isPocketAtDomPos(
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  turnPlayerIndex: cg.PlayerIndex,
  bounds: ClientRect,
  variant: cg.Variant = 'chess',
): boolean {
  const correctWidth = (pos[0] - bounds.left) / bounds.width < 8 / 15 && (pos[0] - bounds.left) / bounds.width > 7 / 15;
  const correctHeight =
    (orientation === 'p1' && turnPlayerIndex === 'p1') || (orientation === 'p1vflip' && turnPlayerIndex === 'p2')
      ? (pos[1] - bounds.top) / bounds.height > 1.6 / 15 && (pos[1] - bounds.top) / bounds.height < 6.5 / 15
      : (pos[1] - bounds.top) / bounds.height > 8.5 / 15 && (pos[1] - bounds.top) / bounds.height < 13.4 / 15;
  return (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') && correctWidth && correctHeight;
}

export function reorderDice(state: HeadlessState): void {
  if (state.gameButtonsActive) {
    if (state.dice.length === 2 && state.dice[0].isAvailable && state.dice[1].isAvailable) {
      state.dice = [state.dice[1], state.dice[0]];
    }
    callUserFunction(state.events.selectDice, state.dice);
  }
}

export function buttonPressed(state: HeadlessState, button: cg.Button): void {
  if (state.gameButtonsActive) {
    callUserFunction(state.events.buttonClick, button);
  }
}

export function p1Pov(s: HeadlessState): boolean {
  return s.myPlayerIndex === 'p1';
}

export function getSnappedKeyAtDomPos(
  orig: cg.Key,
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): cg.Key | undefined {
  const origPos = key2pos(orig);
  const validSnapPos = allPos(bd).filter(pos2 => {
    return queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]);
  });
  const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2key(pos2), orientation, bounds, bd));
  const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
  const [, closestSnapIndex] = validSnapDistances.reduce(
    (a, b, index) => (a[0] < b ? a : [b, index]),
    [validSnapDistances[0], 0],
  );
  return pos2key(validSnapPos[closestSnapIndex]);
}
