import { cancel } from '../../drag';
import { State } from '../../state';
import { distanceSq, samePiece } from '../../util';

import { translateAbs } from './util';

export const processDrag = (s: State): void => {
  requestAnimationFrame(() => {
    const cur = s.draggable.current;
    if (!cur) return;
    // cancel animations while dragging
    if (s.animation.current?.plan.anims.has(cur.orig)) s.animation.current = undefined;
    // if moving piece is gone, cancel
    const origPiece = s.pieces.get(cur.orig);
    if (!origPiece || !samePiece(origPiece, cur.piece)) cancel(s);
    else {
      if (!cur.started && distanceSq(cur.epos, cur.rel) >= Math.pow(s.draggable.distance, 2)) cur.started = true;
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
        const translation = s.posToTranslateAbsolute(s.dom.bounds(), s.dimensions, 'chess')(cur.origPos, s.orientation);
        translation[0] += cur.pos[0];
        translation[1] += cur.pos[1];
        translateAbs(cur.element, translation);
      }
    }
    s.processDrag(s);
  });
};
