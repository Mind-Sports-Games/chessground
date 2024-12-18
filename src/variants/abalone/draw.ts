import type * as cg from '../../types';
import { cancelMove, unselect } from '../../board';
import { eventBrush } from '../../draw';
import { State } from '../../state';
import { eventPosition } from '../../util';

import { getKeyAtDomPos, getSnappedKeyAtDomPos } from './board';

// @TODO: using HOF would allow not repeating the same code here. This code is generic, not Abalone specific. We just invoke getKeyAtDomPos and getSnappedKeyAtDomPos

export const start = (state: State, e: cg.MouchEvent): void => {
  // support one finger touch only
  if (e.touches && e.touches.length > 1) return;
  e.stopPropagation();
  e.preventDefault();
  e.ctrlKey ? unselect(state) : cancelMove(state);
  const pos = eventPosition(e)!,
    orig = getKeyAtDomPos(pos, state.orientation, state.dom.bounds());
  if (!orig) return;
  state.drawable.current = {
    orig,
    pos,
    brush: eventBrush(e),
    snapToValidMove: state.drawable.defaultSnapToValidMove,
  };

  processDraw(state);
};

export const processDraw = (state: State): void => {
  requestAnimationFrame(() => {
    const cur = state.drawable.current;
    if (cur) {
      const keyAtDomPos = getKeyAtDomPos(cur.pos, state.orientation, state.dom.bounds());
      if (!keyAtDomPos) {
        cur.snapToValidMove = false;
      }
      const mouseSq = cur.snapToValidMove
        ? getSnappedKeyAtDomPos(cur.orig, cur.pos, state.orientation, state.dom.bounds(), state.dimensions)
        : keyAtDomPos;
      if (mouseSq !== cur.mouseSq) {
        cur.mouseSq = mouseSq;
        cur.dest = mouseSq !== cur.orig ? mouseSq : undefined;
        state.dom.redrawNow();
      }
      processDraw(state);
    }
  });
};
