import type * as cg from '../../types';
import type { PieceName, SquareClasses } from '../../render';
import { p1Pov } from '../../board';
import { State } from '../../state';
import { createEl } from '../../util';
import { AnimCurrent, AnimFadings, AnimVector, AnimVectors } from '../../anim';
import { DragCurrent } from '../../drag';
import { appendValue, isPieceNode, isSquareNode, posZIndex, removeNodes } from '../../render';

import { key2pos, translateAbs, translateRel, posToTranslateAbs2, posToTranslateRel2 } from './util';
import { computeMoveVectorPostMove } from './engine';

// @TODO: remove parts unrelated to Abalone
export const render = (s: State): void => {
  const orientation = s.orientation,
    asP1: boolean = p1Pov(s),
    posToTranslate = s.dom.relative ? posToTranslateRel2 : posToTranslateAbs2(),
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
        translate(el, posToTranslate(s.dom.bounds(), key2pos(k), orientation));
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
        if (anim && el.cgAnimating && elPieceName === pieceNameOf(pieceAtKey, s.myPlayerIndex, s.orientation)) {
          const pos = key2pos(k);
          pos[0] += anim[2];
          pos[1] += anim[3];
          el.classList.add('anim');
          translate(el, posToTranslate(s.dom.bounds(), pos, orientation));
        } else if (el.cgAnimating) {
          el.cgAnimating = false;
          el.classList.remove('anim');
          translate(el, posToTranslate(s.dom.bounds(), key2pos(k), orientation));
          if (s.addPieceZIndex) el.style.zIndex = posZIndex(key2pos(k), orientation, asP1, s.dimensions);
        }
        // same piece: flag as same
        if (elPieceName === pieceNameOf(pieceAtKey, s.myPlayerIndex, s.orientation) && (!fading || !el.cgFading)) {
          samePieces.add(k);
        }
        // different piece: flag as moved unless it is a fading piece
        else {
          if (fading && elPieceName === pieceNameOf(fading, s.myPlayerIndex, s.orientation)) {
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
    // if (!sameSquares.has(sk)) {
    sMvdset = movedSquares.get(className);
    sMvd = sMvdset && sMvdset.pop();
    const translation = posToTranslate(s.dom.bounds(), key2pos(sk), orientation);
    if (sMvd) {
      sMvd.cgKey = sk;
      translate(sMvd, translation);
    } else {
      const squareNode = createEl('square', className) as cg.SquareNode;
      squareNode.cgKey = sk;
      translate(squareNode, translation);
      boardEl.insertBefore(squareNode, boardEl.firstChild);
    }
    // }
  }

  // walk over all pieces in current set, apply dom changes to moved pieces
  // or append new pieces
  for (const [k, p] of pieces) {
    anim = anims.get(k);
    if (!samePieces.has(k)) {
      pMvdset = movedPieces.get(pieceNameOf(p, s.myPlayerIndex, s.orientation));
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
        translate(pMvd, posToTranslate(s.dom.bounds(), pos, orientation));
      }
      // no piece in moved obj: insert the new piece
      // assumes the new piece is not being dragged
      else {
        const pieceName = pieceNameOf(p, s.myPlayerIndex, s.orientation),
          pieceNode = createEl('piece', pieceName) as cg.PieceNode,
          pos = key2pos(k); // used here to compute position

        pieceNode.cgPiece = pieceName;
        pieceNode.cgKey = k;
        if (anim) {
          pieceNode.cgAnimating = true;
          pos[0] += anim[2];
          pos[1] += anim[3];
        }
        translate(pieceNode, posToTranslate(s.dom.bounds(), pos, orientation));

        if (s.addPieceZIndex) pieceNode.style.zIndex = posZIndex(pos, orientation, asP1, s.dimensions);

        boardEl.appendChild(pieceNode);
      }
    }
  }

  // remove any element that remains in the moved sets
  for (const nodes of movedPieces.values()) removeNodes(s, nodes);
  for (const nodes of movedSquares.values()) removeNodes(s, nodes); // do not compute movedSquares ???
};

function pieceNameOf(piece: cg.Piece, myPlayerIndex: cg.PlayerIndex, orientation: cg.Orientation): string {
  const side =
    (piece.playerIndex === myPlayerIndex && orientation === myPlayerIndex) ||
    (piece.playerIndex !== myPlayerIndex && orientation !== myPlayerIndex)
      ? 'ally'
      : 'enemy';

  return `${piece.playerIndex} ${piece.role} ${side}`;
}

function addSquare(squares: SquareClasses, key: cg.Key, klass: string): void {
  const classes = squares.get(key);
  if (classes) squares.set(key, `${classes} ${klass}`);
  else squares.set(key, klass);
}

// @TODO: clean this up to remove any notion non related to Abalone
export function computeSquareClasses(s: State): SquareClasses {
  const squares: SquareClasses = new Map();

  if (s.lastMove && s.lastMove.length === 2) {
    const moveImpact = computeMoveVectorPostMove(s.pieces, s.lastMove[0], s.lastMove[1]);
    const player = s.turnPlayerIndex;
    moveImpact?.landingSquares.forEach(coordinates => {
      addSquare(squares, coordinates, `last-move to ${player}${moveImpact.directionString}`);
    });
  }

  if (s.lastMove && s.highlight.lastMove) {
    // if (s.variants.abalone.lastMove) {
    //   for (const k of s.variants.abalone.lastMove.piecesMoving) {
    //     addSquare(squares, k, 'last-move from ww');
    //   }
    // }
    // let first = true;
    // for (const k of s.lastMove) {
    //   if (k !== 'a0') {
    //     if (first) {
    //       console.log(s.variants);
    //       addSquare(squares, k, 'last-move from ww'); // + variantSpecificHighlightClass(s.variant, k, s.orientation));
    //       first = false;
    //     } else {
    //       addSquare(squares, k, 'last-move to ww'); // + variantSpecificHighlightClass(s.variant, k, s.orientation));
    //     }
    //   } else {
    //     first = false;
    //   }
    // }
  }
  if (s.selectOnly) {
    for (const key of s.selectedPieces.keys()) {
      addSquare(squares, key, 'selected');
    }
  }
  if (s.selected) {
    addSquare(squares, s.selected, 'selected');
    if (s.movable.showDests) {
      const dests = s.movable.dests?.get(s.selected);
      if (dests)
        for (const k of dests) {
          addSquare(squares, k, 'move-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
      const pDests = s.premovable.dests;
      if (pDests)
        for (const k of pDests) {
          addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
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
