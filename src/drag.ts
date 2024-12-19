import { State } from './state';
import * as board from './board';
import * as util from './util';
import { clear as drawClear } from './draw';
import * as cg from './types';
import { anim } from './anim';
import predrop from './predrop';
import * as T from './transformations';

import { processDrag as abaloneProcessDrag } from './variants/abalone/drag';

export interface DragCurrent {
  orig: cg.Key; // orig key of dragging piece
  origPos: cg.Pos;
  piece: cg.Piece;
  rel: cg.NumberPair; // x; y of the piece at original position
  epos: cg.NumberPair; // initial event position
  pos: cg.NumberPair; // relative current position
  dec: cg.NumberPair; // piece center decay
  started: boolean; // whether the drag has started; as per the distance setting
  element: cg.PieceNode | (() => cg.PieceNode | undefined);
  newPiece?: boolean; // it it a new piece from outside the board
  force?: boolean; // can the new piece replace an existing one (editor)
  previouslySelected?: cg.Key;
  originTarget: EventTarget | null;
}

export function start(s: State, e: cg.MouchEvent): void {
  if (!e.isTrusted || (e.button !== undefined && e.button !== 0)) return; // only touch or left click
  if (e.touches && e.touches.length > 1) return; // support one finger touch only
  const bounds = s.dom.bounds(),
    position = util.eventPosition(e)!,
    orig = board.getKeyAtDomPos(position, s.orientation, bounds, s.dimensions, s.variant);
  if (!orig) return;
  const piece = s.pieces.get(orig);
  const previouslySelected = s.selected;
  if (
    !previouslySelected &&
    s.drawable.enabled &&
    (s.drawable.eraseOnClick || !piece || piece.playerIndex !== s.turnPlayerIndex)
  )
    drawClear(s);
  // Prevent touch scroll and create no corresponding mouse event, if there
  // is an intent to interact with the board. If no playerIndex is movable
  // (and the board is not for viewing only), touches are likely intended to
  // select squares.
  if (
    e.cancelable !== false &&
    (!e.touches || !s.movable.playerIndex || piece || previouslySelected || pieceCloseTo(s, position))
  )
    e.preventDefault();
  const hadPremove = !!s.premovable.current;
  const hadPredrop = !!s.predroppable.current;
  s.stats.ctrlKey = e.ctrlKey;
  if (s.selected && board.canMove(s, s.selected, orig) && !s.selectOnly) {
    anim(state => board.selectSquare(state, orig), s);
  } else {
    board.selectSquare(s, orig);
  }
  const stillSelected = s.selected === orig;
  const element = pieceElementByKey(s, orig);
  if (piece && element && stillSelected && board.isDraggable(s, orig) && !s.selectOnly) {
    const squareBounds = computeSquareBounds(orig, bounds, s.dimensions, s.orientation);
    s.draggable.current = {
      orig,
      origPos: util.key2pos(orig),
      piece,
      rel: position,
      epos: position,
      pos: [0, 0],
      dec: s.draggable.centerPiece
        ? [
            position[0] - (squareBounds.left + squareBounds.width / 2),
            position[1] - (squareBounds.top + squareBounds.height / 2),
          ]
        : [0, 0],
      started: s.draggable.autoDistance && s.stats.dragged,
      element,
      previouslySelected,
      originTarget: e.target,
    };
    element.cgDragging = true;
    element.classList.add('dragging');
    // place ghost
    const ghost = s.dom.elements.ghost;
    if (ghost) {
      const promoted = piece.promoted ? 'promoted ' : '';
      const side = piece.playerIndex === s.myPlayerIndex ? 'ally' : 'enemy';
      ghost.className = `ghost ${piece.playerIndex} ${promoted}${piece.role} ${side}`;
      util.translateAbs(
        ghost,
        util.posToTranslateAbs(bounds, s.dimensions, s.variant)(util.key2pos(orig), s.orientation),
      );
      util.setVisible(ghost, true);
    }
    processDrag(s);
  } else {
    if (hadPremove) board.unsetPremove(s);
    if (hadPredrop) board.unsetPredrop(s);
  }
  s.dom.redraw();
}

function pieceCloseTo(s: State, pos: cg.NumberPair): boolean {
  const orientation = s.orientation,
    bounds = s.dom.bounds(),
    radiusSq = Math.pow(bounds.width / 8, 2);
  for (const key in s.pieces) {
    const squareBounds = computeSquareBounds(key as cg.Key, bounds, s.dimensions, orientation),
      center: cg.NumberPair = [squareBounds.left + squareBounds.width / 2, squareBounds.top + squareBounds.height / 2];
    if (util.distanceSq(center, pos) <= radiusSq) return true;
  }
  return false;
}

export function dragNewPiece(s: State, piece: cg.Piece, e: cg.MouchEvent, force?: boolean): void {
  const key: cg.Key = 'a0';
  s.pieces.set(key, piece);
  s.dom.redraw();

  const position = util.eventPosition(e)!,
    asP1 = board.p1Pov(s),
    bounds = s.dom.bounds(),
    squareBounds = computeSquareBounds(key, bounds, s.dimensions, s.orientation);

  const rel: cg.NumberPair = [
    (asP1 ? 0 : s.dimensions.width - 1) * squareBounds.width + bounds.left,
    (asP1 ? s.dimensions.height : -1) * squareBounds.height + bounds.top,
  ];

  s.draggable.current = {
    orig: key,
    origPos: util.key2pos('a0'),
    piece,
    rel,
    epos: position,
    pos: [position[0] - rel[0], position[1] - rel[1]],
    dec: [-squareBounds.width / 2, -squareBounds.height / 2],
    started: true,
    element: () => pieceElementByKey(s, key),
    originTarget: e.target,
    newPiece: true,
    force: !!force,
  };

  if (piece && board.isPredroppable(s)) {
    s.predroppable.dropDests = predrop(s.pieces, piece, s.dimensions, s.variant);
  }

  processDrag(s);
}

function processDrag(s: State): void {
  requestAnimationFrame(() => {
    if (s.variant === 'abalone') return abaloneProcessDrag(s); // "working" WIP: have to use HOF
    const cur = s.draggable.current;
    if (!cur) return;
    // cancel animations while dragging
    if (s.animation.current?.plan.anims.has(cur.orig)) s.animation.current = undefined;
    // if moving piece is gone, cancel
    const origPiece = s.pieces.get(cur.orig);
    if (!origPiece || !util.samePiece(origPiece, cur.piece)) cancel(s);
    else {
      if (!cur.started && util.distanceSq(cur.epos, cur.rel) >= Math.pow(s.draggable.distance, 2)) cur.started = true;
      if (cur.started) {
        // support lazy elements
        if (typeof cur.element === 'function') {
          const found = cur.element();
          if (!found) return;
          found.cgDragging = true;
          found.classList.add('dragging');
          cur.element = found;
        }

        cur.pos = [cur.epos[0] - cur.rel[0], cur.epos[1] - cur.rel[1]];

        // move piece
        const translation = util.posToTranslateAbs(s.dom.bounds(), s.dimensions, s.variant)(cur.origPos, s.orientation); // because of util.translateAbs, it has to remain invoked from util.
        translation[0] += cur.pos[0] + cur.dec[0];
        translation[1] += cur.pos[1] + cur.dec[1];
        util.translateAbs(cur.element, translation);
      }
    }
    processDrag(s);
  });
}

export function move(s: State, e: cg.MouchEvent): void {
  // support one finger touch only
  if (s.draggable.current && (!e.touches || e.touches.length < 2)) {
    s.draggable.current.epos = util.eventPosition(e)!;
  }
}

export function end(s: State, e: cg.MouchEvent): void {
  const cur = s.draggable.current;
  if (!cur) return;
  // create no corresponding mouse event
  if (e.type === 'touchend' && e.cancelable !== false) e.preventDefault();
  // comparing with the origin target is an easy way to test that the end event
  // has the same touch origin
  if (e.type === 'touchend' && cur && cur.originTarget !== e.target && !cur.newPiece) {
    s.draggable.current = undefined;
    return;
  }
  board.unsetPremove(s);
  board.unsetPredrop(s);
  // touchend has no position; so use the last touchmove position instead
  const eventPos = util.eventPosition(e) || cur.epos;
  const dest = board.getKeyAtDomPos(eventPos, s.orientation, s.dom.bounds(), s.dimensions, s.variant);
  if (dest && cur.started && cur.orig !== dest) {
    if (cur.newPiece) board.dropNewPiece(s, cur.orig, dest, cur.force);
    else {
      s.stats.ctrlKey = e.ctrlKey;
      if (board.userMove(s, cur.orig, dest)) s.stats.dragged = true;
    }
  } else if (cur.newPiece) {
    s.pieces.delete(cur.orig);
  } else if (s.draggable.deleteOnDropOff && !dest) {
    s.pieces.delete(cur.orig);
    util.callUserFunction(s.events.change);
  }
  if (cur && cur.orig === cur.previouslySelected && (cur.orig === dest || !dest)) board.unselect(s);
  else if (!s.selectable.enabled) board.unselect(s);

  removeDragElements(s);

  s.draggable.current = undefined;
  s.dom.redraw();
}

export function cancel(s: State): void {
  const cur = s.draggable.current;
  if (cur) {
    if (cur.newPiece) s.pieces.delete(cur.orig);
    s.draggable.current = undefined;
    board.unselect(s);
    removeDragElements(s);
    s.dom.redraw();
  }
}

function removeDragElements(s: State): void {
  const e = s.dom.elements;
  if (e.ghost) util.setVisible(e.ghost, false);
}

function computeSquareBounds(key: cg.Key, bounds: ClientRect, bd: cg.BoardDimensions, orientation: cg.Orientation) {
  const pos = T.mapToP1Inverse[orientation](util.key2pos(key), bd);
  return {
    left: bounds.left + (bounds.width * (pos[0] - 1)) / bd.width,
    top: bounds.top + (bounds.height * (bd.height - pos[1])) / bd.height,
    width: bounds.width / bd.width,
    height: bounds.height / bd.height,
  };
}

function pieceElementByKey(s: State, key: cg.Key): cg.PieceNode | undefined {
  let el = s.dom.elements.board.firstChild;
  while (el) {
    if ((el as cg.KeyedNode).cgKey === key && (el as cg.KeyedNode).tagName === 'PIECE') return el as cg.PieceNode;
    el = el.nextSibling;
  }
  return;
}
