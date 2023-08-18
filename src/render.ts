import { State } from './state';
import {
  key2pos,
  createEl,
  posToTranslateRel,
  posToTranslateAbs,
  translateRel,
  translateAbs,
  calculatePlayerEmptyAreas,
} from './util';
import { p1Pov } from './board';
import { AnimCurrent, AnimVectors, AnimVector, AnimFadings } from './anim';
import { DragCurrent } from './drag';
import * as cg from './types';
import * as T from './transformations';

type PieceName = string; // `$playerIndex $role`
type SquareClasses = Map<cg.Key, string>;

// ported from https://github.com/veloce/lichobile/blob/master/src/js/chessground/view.js
// in case of bugs, blame @veloce
export function render(s: State): void {
  const orientation = s.orientation,
    asP1: boolean = p1Pov(s),
    posToTranslate = s.dom.relative ? posToTranslateRel : posToTranslateAbs(s.dom.bounds(), s.dimensions),
    translate = s.dom.relative ? translateRel : translateAbs,
    boardEl: HTMLElement = s.dom.elements.board,
    pieces: cg.Pieces = s.pieces,
    curAnim: AnimCurrent | undefined = s.animation.current,
    anims: AnimVectors = curAnim ? curAnim.plan.anims : new Map(),
    fadings: AnimFadings = curAnim ? curAnim.plan.fadings : new Map(),
    curDrag: DragCurrent | undefined = s.draggable.current,
    squares: SquareClasses = computeSquareClasses(s),
    samePieces: Set<cg.Key> = new Set(),
    sameSquares: Set<cg.Key> = new Set(),
    movedPieces: Map<PieceName, cg.PieceNode[]> = new Map(),
    movedSquares: Map<string, cg.SquareNode[]> = new Map(); // by class name

  let k: cg.Key,
    el: cg.PieceNode | cg.SquareNode | undefined,
    pieceAtKey: cg.Piece | undefined,
    elPieceName: PieceName,
    anim: AnimVector | undefined,
    fading: cg.Piece | undefined,
    pMvdset: cg.PieceNode[] | undefined,
    pMvd: cg.PieceNode | undefined,
    sMvdset: cg.SquareNode[] | undefined,
    sMvd: cg.SquareNode | undefined;

  // walk over all board dom elements, apply animations and flag moved pieces
  el = boardEl.firstChild as cg.PieceNode | cg.SquareNode | undefined;
  while (el) {
    k = el.cgKey;
    if (isPieceNode(el)) {
      pieceAtKey = pieces.get(k);
      anim = anims.get(k);
      fading = fadings.get(k);
      elPieceName = el.cgPiece;
      // if piece not being dragged anymore, remove dragging style
      if (el.cgDragging && (!curDrag || curDrag.orig !== k)) {
        el.classList.remove('dragging');
        translate(el, posToTranslate(key2pos(k), orientation, s.dimensions, s.variant));
        el.cgDragging = false;
      }
      // remove fading class if it still remains
      if (!fading && el.cgFading) {
        el.cgFading = false;
        el.classList.remove('fading');
      }
      // there is now a piece at this dom key
      if (pieceAtKey) {
        // continue animation if already animating and same piece
        // (otherwise it could animate a captured piece)
        if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey, s.myPlayerIndex)) {
          const pos = key2pos(k);
          pos[0] += anim[2];
          pos[1] += anim[3];
          el.classList.add('anim');
          translate(el, posToTranslate(pos, orientation, s.dimensions, s.variant));
        } else if (el.cgAnimating) {
          el.cgAnimating = false;
          el.classList.remove('anim');
          translate(el, posToTranslate(key2pos(k), orientation, s.dimensions, s.variant));
          if (s.addPieceZIndex) el.style.zIndex = posZIndex(key2pos(k), orientation, asP1, s.dimensions);
        }
        // same piece: flag as same
        if (elPieceName === pieceNameOf(pieceAtKey, s.myPlayerIndex) && (!fading || !el.cgFading)) {
          samePieces.add(k);
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && elPieceName === pieceNameOf(fading, s.myPlayerIndex)) {
            el.classList.add('fading');
            el.cgFading = true;
          } else {
            appendValue(movedPieces, elPieceName, el);
          }
        }
      }
      // no piece: flag as moved
      else {
        appendValue(movedPieces, elPieceName, el);
      }
    } else if (isSquareNode(el)) {
      const cn = el.className;
      if (squares.get(k) === cn) sameSquares.add(k);
      else if (movedSquares.has(cn)) appendValue(movedSquares, cn, el);
      else movedSquares.set(cn, [el]);
    }
    el = el.nextSibling as cg.PieceNode | cg.SquareNode | undefined;
  }

  // walk over all squares in current set, apply dom changes to moved squares
  // or append new squares
  for (const [sk, className] of squares) {
    if (!sameSquares.has(sk)) {
      sMvdset = movedSquares.get(className);
      sMvd = sMvdset && sMvdset.pop();
      const translation = posToTranslate(key2pos(sk), orientation, s.dimensions, s.variant);
      if (sMvd) {
        sMvd.cgKey = sk;
        translate(sMvd, translation);
      } else {
        const squareNode = createEl('square', className) as cg.SquareNode;
        squareNode.cgKey = sk;
        translate(squareNode, translation);
        boardEl.insertBefore(squareNode, boardEl.firstChild);
      }
    }
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (const [k, p] of pieces) {
    anim = anims.get(k);
    if (!samePieces.has(k)) {
      pMvdset = movedPieces.get(pieceNameOf(p, s.myPlayerIndex));
      pMvd = pMvdset && pMvdset.pop();
      // a same piece was moved
      if (pMvd) {
        // apply dom changes
        pMvd.cgKey = k;
        if (pMvd.cgFading) {
          pMvd.classList.remove('fading');
          pMvd.cgFading = false;
        }
        const pos = key2pos(k);
        if (s.addPieceZIndex) pMvd.style.zIndex = posZIndex(pos, orientation, asP1, s.dimensions);
        if (anim) {
          pMvd.cgAnimating = true;
          pMvd.classList.add('anim');
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pMvd, posToTranslate(pos, orientation, s.dimensions, s.variant));
      }
      // no piece in moved obj: insert the new piece
      // assumes the new piece is not being dragged
      else {
        const pieceName = pieceNameOf(p, s.myPlayerIndex),
          pieceNode = createEl('piece', pieceName) as cg.PieceNode,
          pos = key2pos(k);

        pieceNode.cgPiece = pieceName;
        pieceNode.cgKey = k;
        if (anim) {
          pieceNode.cgAnimating = true;
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pieceNode, posToTranslate(pos, orientation, s.dimensions, s.variant));

        if (s.addPieceZIndex) pieceNode.style.zIndex = posZIndex(pos, orientation, asP1, s.dimensions);

        boardEl.appendChild(pieceNode);
      }
    }
  }

  // remove any element that remains in the moved sets
  for (const nodes of movedPieces.values()) removeNodes(s, nodes);
  for (const nodes of movedSquares.values()) removeNodes(s, nodes);
}

export function updateBounds(s: State): void {
  if (s.dom.relative) return;
  const orientation = s.orientation,
    posToTranslate = posToTranslateAbs(s.dom.bounds(), s.dimensions);
  let el = s.dom.elements.board.firstChild as cg.PieceNode | cg.SquareNode | undefined;
  while (el) {
    if ((isPieceNode(el) && !el.cgAnimating) || isSquareNode(el)) {
      translateAbs(el, posToTranslate(key2pos(el.cgKey), orientation));
    }
    el = el.nextSibling as cg.PieceNode | cg.SquareNode | undefined;
  }
}

function isPieceNode(el: cg.PieceNode | cg.SquareNode): el is cg.PieceNode {
  return el.tagName === 'PIECE';
}
function isSquareNode(el: cg.PieceNode | cg.SquareNode): el is cg.SquareNode {
  return el.tagName === 'SQUARE';
}

function removeNodes(s: State, nodes: HTMLElement[]): void {
  for (const node of nodes) s.dom.elements.board.removeChild(node);
}

function posZIndex(pos: cg.Pos, orientation: cg.Orientation, asP1: boolean, bd: cg.BoardDimensions): string {
  pos = T.mapToP1[orientation](pos, bd);
  let z = 2 + (pos[1] - 1) * bd.height + (bd.width - pos[0]);
  if (asP1) z = 67 - z;
  return z + '';
}

function pieceNameOf(piece: cg.Piece, myPlayerIndex: cg.PlayerIndex): string {
  const promoted = piece.promoted ? 'promoted ' : '';
  const side = piece.playerIndex === myPlayerIndex ? 'ally' : 'enemy';
  return `${piece.playerIndex} ${promoted}${piece.role} ${side}`;
}

function computeSquareClasses(s: State): SquareClasses {
  const squares: SquareClasses = new Map();
  if (s.lastMove && s.highlight.lastMove) {
    let first = true;
    for (const k of s.lastMove) {
      if (k !== 'a0') {
        if (first) {
          addSquare(squares, k, 'last-move from' + togyzkumalakHightlighClass(s.variant, k));
          first = false;
        } else {
          addSquare(squares, k, 'last-move to' + togyzkumalakHightlighClass(s.variant, k));
        }
      } else {
        first = false;
      }
    }
  }
  if (s.check && s.highlight.check) addSquare(squares, s.check, 'check');
  if (s.selectOnly) {
    for (const key of s.selectedPieces.keys()) {
      addSquare(squares, key, 'selected');
    }
    //area highlight for go games
    if (s.variant && ['go9x9', 'go13x13', 'go19x19'].includes(s.variant)) {
      const areas = calculatePlayerEmptyAreas(s.pieces, s.dimensions, s.selectedPieces);
      for (const [s, p] of areas) {
        addSquare(squares, s, 'area ' + p);
      }
    }
  }
  if (s.selected) {
    addSquare(squares, s.selected, 'selected' + togyzkumalakHightlighClass(s.variant, s.selected));
    if (s.movable.showDests) {
      const dests = s.movable.dests?.get(s.selected);
      if (dests)
        for (const k of dests) {
          addSquare(
            squares,
            k,
            'move-dest' + (s.pieces.has(k) ? ' oc' : '') + togyzkumalakHightlighClass(s.variant, k)
          );
        }
      const pDests = s.premovable.dests;
      if (pDests)
        for (const k of pDests) {
          addSquare(
            squares,
            k,
            'premove-dest' + (s.pieces.has(k) ? ' oc' : '') + togyzkumalakHightlighClass(s.variant, k)
          );
        }
    }
  } else if (s.dropmode.active || s.draggable.current?.orig === 'a0') {
    const piece = s.dropmode.active ? s.dropmode.piece : s.draggable.current?.piece;

    if (piece) {
      // TODO: there was a function called isPredroppable that was used in drag.ts or drop.ts or both.
      //       Maybe use the same here to decide what to render instead of potentially making it possible both
      //       kinds of highlighting to happen if something was not cleared up in the state.
      //       In other place (pocket.ts) this condition is used ot decide similar question: ctrl.myplayerIndex === ctrl.turnPlayerIndex
      if (s.dropmode.showDropDests) {
        const dests = s.dropmode.dropDests?.get(piece.role);
        if (dests)
          for (const k of dests) {
            addSquare(squares, k, 'move-dest');
          }
      }
      if (s.predroppable.showDropDests) {
        const pDests = s.predroppable.dropDests;
        if (pDests)
          for (const k of pDests) {
            addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
          }
      }
    }
  }
  const premove = s.premovable.current;
  if (premove) for (const k of premove) addSquare(squares, k, 'current-premove');
  else if (s.predroppable.current) addSquare(squares, s.predroppable.current.key, 'current-premove');

  const o = s.exploding;
  if (o) for (const k of o.keys) addSquare(squares, k, 'exploding' + o.stage);

  return squares;
}

function addSquare(squares: SquareClasses, key: cg.Key, klass: string): void {
  const classes = squares.get(key);
  if (classes) squares.set(key, `${classes} ${klass}`);
  else squares.set(key, klass);
}

function appendValue<K, V>(map: Map<K, V[]>, key: K, value: V): void {
  const arr = map.get(key);
  if (arr) arr.push(value);
  else map.set(key, [value]);
}

function togyzkumalakHightlighClass(variant: cg.Variant, k: cg.Key): string {
  return variant === 'togyzkumalak' ? (k[1] === '1' ? ' p1' : ' p2') : '';
}
