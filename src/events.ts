import { State } from './state';
import * as drag from './drag';
import * as draw from './draw';
import { cancelDropMode, drop } from './drop';
import { eventPosition, isRightButton } from './util';
import * as cg from './types';
import { getKeyAtDomPos } from './board';
import { Piece } from './types';

type MouchBind = (e: cg.MouchEvent) => void;
type StateMouchBind = (d: State, e: cg.MouchEvent) => void;

export function bindBoard(s: State, boundsUpdated: () => void): void {
  const boardEl = s.dom.elements.board;

  if (!s.dom.relative && s.resizable && 'ResizeObserver' in window) {
    const observer = new (window as any)['ResizeObserver'](boundsUpdated);
    observer.observe(boardEl);
  }

  if (s.viewOnly) return;

  // Cannot be passive, because we prevent touch scrolling and dragging of
  // selected elements.
  const onStart = startDragOrDraw(s);
  boardEl.addEventListener('touchstart', onStart as EventListener, { passive: false });
  boardEl.addEventListener('mousedown', onStart as EventListener, { passive: false });

  if (s.disableContextMenu || s.drawable.enabled) {
    boardEl.addEventListener('contextmenu', e => e.preventDefault());
  }
}

// returns the unbind function
export function bindDocument(s: State, boundsUpdated: () => void): cg.Unbind {
  const unbinds: cg.Unbind[] = [];

  // Old versions of Edge and Safari do not support ResizeObserver. Send
  // chessground.resize if a user action has changed the bounds of the board.
  if (!s.dom.relative && s.resizable && !('ResizeObserver' in window)) {
    unbinds.push(unbindable(document.body, 'chessground.resize', boundsUpdated));
  }

  if (!s.viewOnly) {
    const onmove = dragOrDraw(s, drag.move, draw.move);
    const onend = dragOrDraw(s, drag.end, draw.end);

    for (const ev of ['touchmove', 'mousemove']) unbinds.push(unbindable(document, ev, onmove as EventListener));
    for (const ev of ['touchend', 'mouseup']) unbinds.push(unbindable(document, ev, onend as EventListener));

    const onScroll = () => s.dom.bounds.clear();
    unbinds.push(unbindable(document, 'scroll', onScroll, { capture: true, passive: true }));
    unbinds.push(unbindable(window, 'resize', onScroll, { passive: true }));
  }

  return () => unbinds.forEach(f => f());
}

function unbindable(
  el: EventTarget,
  eventName: string,
  callback: EventListener,
  options?: AddEventListenerOptions
): cg.Unbind {
  el.addEventListener(eventName, callback, options);
  return () => el.removeEventListener(eventName, callback, options);
}

// slightly misleading name - because it also handles click-moving/dropping of pieces. generally it seems to handle all click events on the board.
function startDragOrDraw(s: State): MouchBind {
  return e => {
    if (s.draggable.current) drag.cancel(s);
    else if (s.drawable.current) draw.cancel(s);
    else if (e.shiftKey || isRightButton(e)) {
      if (s.drawable.enabled) draw.start(s, e);
    } else if (!s.viewOnly) {
      if (s.dropmode.active && undefined === squareOccupied(s, e)) {
        // this case covers normal drop when it is our turn or pre-drop on empty scare
        drop(s, e);
      } else if (
        s.dropmode.active &&
        s.movable.playerIndex !== s.turnPlayerIndex /*not our turn*/ &&
        squareOccupied(s, e)?.playerIndex === s.turnPlayerIndex /*occupied by opp's piece*/
      ) {
        // this case is for predrop on opp's piece
        drop(s, e);
      } else {
        // if it is occupied by our piece - cancel drop mode and start dragging that piece instead.
        // if it is occupied by opp's piece - just cancel drop mode. drag.start() will do nothing
        cancelDropMode(s);
        drag.start(s, e);
      }
    }
  };
}

function dragOrDraw(s: State, withDrag: StateMouchBind, withDraw: StateMouchBind): MouchBind {
  return e => {
    if (s.drawable.current) {
      if (s.drawable.enabled) withDraw(s, e);
    } else if (!s.viewOnly) withDrag(s, e);
  };
}

function squareOccupied(s: State, e: cg.MouchEvent): Piece | undefined {
  const position = eventPosition(e);
  const dest = position && getKeyAtDomPos(position, s.orientation, s.dom.bounds(), s.dimensions);
  if (dest && s.pieces.get(dest)) return s.pieces.get(dest);
  return undefined;
}
