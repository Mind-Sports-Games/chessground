import type * as cg from '../../types';
import type { PieceName, SquareClasses } from '../../render';
import { p1Pov } from '../../board';
import { State } from '../../state';
import { createEl, opposite } from '../../util';
import { AnimCurrent, AnimFadings, AnimVector, AnimVectors } from '../../anim';
import { DragCurrent } from '../../drag';
import { appendValue, isPieceNode, isSquareNode, posZIndex, removeNodes } from '../../render';

import { translateAbs, translateRel } from './util';
import { computeMoveVectorPostMove } from './engine';
import { getDirectionString, isMoveInLine } from './directions';

// @TODO: remove parts unrelated to Abalone
export const render = (s: State): void => {
  const orientation = s.orientation,
    asP1: boolean = p1Pov(s),
    posToTranslate = s.dom.relative
      ? s.posToTranslateRelative
      : s.posToTranslateAbsolute(s.dom.bounds(), s.dimensions, s.variant),
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
        translate(el, posToTranslate(s.key2pos(k), orientation, s.dimensions, s.variant));
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
          const pos = s.key2pos(k);
          pos[0] += anim[2];
          pos[1] += anim[3];
          el.classList.add('anim');
          translate(el, posToTranslate(s.key2pos(k), orientation, s.dimensions, s.variant));
        } else if (el.cgAnimating) {
          el.cgAnimating = false;
          el.classList.remove('anim');
          translate(el, posToTranslate(s.key2pos(k), orientation, s.dimensions, s.variant));
          if (s.addPieceZIndex) el.style.zIndex = posZIndex(s.key2pos(k), orientation, asP1, s.dimensions);
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
    if (!sameSquares.has(sk)) {
      sMvdset = movedSquares.get(className);
      sMvd = sMvdset && sMvdset.pop();
      const translation = posToTranslate(s.key2pos(sk), orientation, s.dimensions, s.variant);
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
        const pos = s.key2pos(k);
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
        const pieceName = pieceNameOf(p, s.myPlayerIndex, s.orientation),
          pieceNode = createEl('piece', pieceName) as cg.PieceNode,
          pos = s.key2pos(k); // used here to compute position

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
};

const pieceNameOf = (piece: cg.Piece, myPlayerIndex: cg.PlayerIndex, orientation: cg.Orientation): string => {
  const side =
    (piece.playerIndex === myPlayerIndex && orientation === myPlayerIndex) ||
    (piece.playerIndex !== myPlayerIndex && orientation !== myPlayerIndex)
      ? 'ally'
      : 'enemy';

  return `${piece.playerIndex} ${piece.role} ${side}`;
};

const addSquare = (squares: SquareClasses, key: cg.Key, klass: string): void => {
  const classes = squares.get(key);
  if (classes) squares.set(key, `${classes} ${klass}`);
  else squares.set(key, klass);
};

export const computeSquareClasses = (s: State): SquareClasses => {
  const squares: SquareClasses = new Map();

  // highlight.lastMove is false on board editor, so it makes sense to check for it
  if (s.highlight.lastMove && s.lastMove && s.lastMove.length === 2) {
    const moveImpact = computeMoveVectorPostMove(s.pieces, s.lastMove[0], s.lastMove[1]);
    const lastMovePlayer = s.pieces.get(s.lastMove[1])?.playerIndex || s.myPlayerIndex;
    const player = opposite(lastMovePlayer);
    moveImpact?.landingSquares.forEach(coordinates => {
      addSquare(squares, coordinates, `last-move to ${player}${moveImpact.directionString}`);
    });
  }

  if (s.selected) {
    const orig = s.selected;
    addSquare(squares, orig, 'selected');
    if (s.movable.showDests) {
      const dests = s.movable.dests?.get(orig);
      if (dests)
        for (const dest of dests) {
          let classes = 'move-dest';
          const directionString = getDirectionString(orig, dest);
          if (!directionString) break;
          if (isMoveInLine(orig, dest, directionString)) {
            classes += ` inline`;
          } else {
            classes += ` aside`;
          }
          if (s.pieces.has(dest)) classes += ' oc';
          addSquare(squares, dest, classes);
        }
      const pDests = s.premovable.dests;
      if (pDests)
        for (const k of pDests) {
          addSquare(squares, k, 'premove-dest' + (s.pieces.has(k) ? ' oc' : ''));
        }
    }
  }
  if (s.movable.showDests) s.premovable.current?.forEach(k => addSquare(squares, k, 'current-premove'));

  return squares;
};
