import * as cg from './types';
import { HeadlessState } from './state';
import { setSelected, setGoScore } from './board';
import { read as fenRead, readPocket as fenReadPocket } from './fen';
import { DrawShape, DrawBrush } from './draw';

import { configure as abaloneConfigure } from './variants/abalone/config';

export interface Config {
  fen?: cg.FEN; // chess position in Forsyth notation
  orientation?: cg.Orientation; // board orientation. p1 | p2 | left | right | p1vflip
  myPlayerIndex?: cg.PlayerIndex; // turn of player p1 | p2
  turnPlayerIndex?: cg.PlayerIndex; // turn to play. p1 | p2
  check?: cg.PlayerIndex | boolean; // true for current playerIndex, false to unset
  lastMove?: cg.Key[]; // squares part of the last move ["c3", "c4"]
  selected?: cg.Key; // square currently selected "a1"
  coordinates?: boolean; // include coords attributes
  boardScores?: boolean; //include board-scores attributes
  dice?: cg.Dice[]; // dice to display on the board
  doublingCube?: cg.DoublingCube; // doubling cube to display on the board
  canUndo?: boolean; // can user undo thier last action
  showUndoButton?: boolean; //show the undo button
  gameButtonsActive?: boolean; // can user process game buttons (e.g. swap dice, undo)
  autoCastle?: boolean; // immediately complete the castle by moving the rook after king move
  viewOnly?: boolean; // don't bind events: the user will never be able to move pieces around
  selectOnly?: boolean; // only allow user to select squares/pieces (multiple selection allowed)
  disableContextMenu?: boolean; // because who needs a context menu on a chessboard
  resizable?: boolean; // listens to chessground.resize on document.body to clear bounds cache
  addPieceZIndex?: boolean; // adds z-index values to pieces (for 3D)
  // pieceKey: boolean; // add a data-key attribute to piece elements
  highlight?: {
    lastMove?: boolean; // add last-move class to squares
    check?: boolean; // add check class to squares
  };
  animation?: {
    enabled?: boolean;
    duration?: number;
  };
  movable?: {
    free?: boolean; // all moves are valid - board editor
    playerIndex?: cg.PlayerIndex | 'both'; // playerIndex that can move. p1 | p2 | both | undefined
    dests?: cg.Dests; // valid moves. {"a2" ["a3" "a4"] "b1" ["a3" "c3"]}
    showDests?: boolean; // whether to add the move-dest class on squares
    events?: {
      after?: (orig: cg.Key, dest: cg.Key, metadata: cg.MoveMetadata) => void; // called after the move has been played
      afterNewPiece?: (role: cg.Role, key: cg.Key, metadata: cg.MoveMetadata) => void; // called after a new piece is dropped on the board
    };
    rookCastle?: boolean; // castle by moving the king to the rook
  };
  liftable?: {
    liftDests?: cg.Key[]; // squares to remove a role/stone from
    events?: {
      after?: (dest: cg.Key) => void; //called after a lift have been played
    };
  };
  premovable?: {
    enabled?: boolean; // allow premoves for playerIndex that can not move
    showDests?: boolean; // whether to add the premove-dest class on squares
    castle?: boolean; // whether to allow king castle premoves
    dests?: cg.Key[]; // premove destinations for the current selection
    events?: {
      set?: (orig: cg.Key, dest: cg.Key, metadata?: cg.SetPremoveMetadata) => void; // called after the premove has been set
      unset?: () => void; // called after the premove has been unset
    };
  };
  predroppable?: {
    enabled?: boolean; // allow predrops for playerIndex that can not move
    showDropDests?: boolean;
    dropDests?: cg.Key[];
    current?: {
      // See corresponding type in state.ts for more comments
      role: cg.Role;
      key: cg.Key;
    };
    events?: {
      set?: (role: cg.Role, key: cg.Key) => void; // called after the predrop has been set
      unset?: () => void; // called after the predrop has been unset
    };
  };
  draggable?: {
    enabled?: boolean; // allow moves & premoves to use drag'n drop
    distance?: number; // minimum distance to initiate a drag; in pixels
    autoDistance?: boolean; // lets chessground set distance to zero when user drags pieces
    centerPiece?: boolean; // center the piece on cursor at drag start
    showGhost?: boolean; // show ghost of piece being dragged
    deleteOnDropOff?: boolean; // delete a piece when it is dropped off the board
  };
  selectable?: {
    // disable to enforce dragging over click-click move
    enabled?: boolean;
  };
  events?: {
    change?: () => void; // called after the situation changes on the board
    // called after a piece has been moved.
    // capturedPiece is undefined or like {playerIndex: 'p1'; 'role': 'queen'}
    move?: (orig: cg.Key, dest: cg.Key, capturedPiece?: cg.Piece) => void;
    dropNewPiece?: (piece: cg.Piece, key: cg.Key) => void;
    select?: (key: cg.Key) => void; // called when a square is selected
    insert?: (elements: cg.Elements) => void; // when the board DOM has been (re)inserted
    selectDice?: (dice: cg.Dice[]) => void; //when the dice have been selected (to swap order)
    undoButton?: () => void; //when the undo button hass been selected for backgammon
  };
  dropmode?: {
    active?: boolean;
    piece?: cg.Piece;
    showDropDests?: boolean; // whether to add the move-dest class on squares for drops
    dropDests?: cg.DropDests; // see corresponding state.ts type for comments
    events?: {
      cancel?: () => void; // at least temporary - i need to refresh pocket on cancel of drop mode (mainly to clear the highlighting of the selected pocket piece) and pocket is currently outside chessgroundx so need to provide callback here
    };
  };
  drawable?: {
    enabled?: boolean; // can draw
    visible?: boolean; // can view
    defaultSnapToValidMove?: boolean;
    eraseOnClick?: boolean;
    shapes?: DrawShape[];
    autoShapes?: DrawShape[];
    brushes?: DrawBrush[];
    pieces?: {
      baseUrl?: string;
    };
    onChange?: (shapes: DrawShape[]) => void; // called after drawable shapes change
  };
  dimensions?: cg.BoardDimensions;
  variant?: cg.Variant;
  chess960?: boolean;
  notation?: cg.Notation;
  onlyDropsVariant?: boolean;
  singleClickMoveVariant?: boolean;
}

export function configure(state: HeadlessState, config: Config): void {
  // don't merge destinations and autoShapes. Just override.
  if (config.movable && config.movable.dests) state.movable.dests = undefined;
  if (config.dropmode?.dropDests) state.dropmode.dropDests = undefined;
  if (config.drawable?.autoShapes) state.drawable.autoShapes = [];
  if (config.dice) state.dice = [];
  if (config.doublingCube) state.doublingCube = undefined;

  merge(state, config);

  if (config.dimensions) state.dimensions = config.dimensions;

  // if a fen was provided, replace the pieces
  if (config.fen) {
    const pieces = fenRead(config.fen, state.dimensions, state.variant);
    const pocketPieces = fenReadPocket(config.fen, state.variant);
    // prevent to cancel() already started piece drag from pocket!
    if (state.pieces.get('a0') !== undefined) pieces.set('a0', state.pieces.get('a0')!);
    state.pieces = pieces;
    state.pocketPieces = pocketPieces;
    state.drawable.shapes = [];
  }

  // apply config values that could be undefined yet meaningful
  if ('check' in config) setCheck(state, config.check || false);
  if ('lastMove' in config && !config.lastMove) state.lastMove = undefined;
  // in case of ZH drop last move, there's a single square.
  // if the previous last move had two squares,
  // the merge algorithm will incorrectly keep the second square.
  else if (config.lastMove) state.lastMove = config.lastMove;

  // fix move/premove dests
  if (state.selected) setSelected(state, state.selected);

  //fix go scores
  setGoScore(state);

  // no need for such short animations
  if (!state.animation.duration || state.animation.duration < 100) state.animation.enabled = false;

  if (!state.movable.rookCastle && state.movable.dests) {
    const rank = state.movable.playerIndex === 'p1' ? 1 : 8,
      kingStartPos = ('e' + rank) as cg.Key,
      dests = state.movable.dests.get(kingStartPos),
      king = state.pieces.get(kingStartPos);
    if (!dests || !king || king.role !== 'k-piece') return;
    state.movable.dests.set(
      kingStartPos,
      dests.filter(
        d =>
          !(d === 'a' + rank && dests.includes(('c' + rank) as cg.Key)) &&
          !(d === 'h' + rank && dests.includes(('g' + rank) as cg.Key)),
      ),
    );
  }

  // configure variants
  if (state.variant === 'abalone') {
    abaloneConfigure(state);
  }
}

function setCheck(state: HeadlessState, playerIndex: cg.PlayerIndex | boolean): void {
  state.check = undefined;
  if (playerIndex === true) playerIndex = state.turnPlayerIndex;
  if (playerIndex)
    for (const [k, p] of state.pieces) {
      if (p.role === 'k-piece' && p.playerIndex === playerIndex) {
        state.check = k;
      }
    }
}

function merge(base: any, extend: any): void {
  for (const key in extend) {
    if (isObject(base[key]) && isObject(extend[key])) merge(base[key], extend[key]);
    else base[key] = extend[key];
  }
}

function isObject(o: unknown): boolean {
  return typeof o === 'object';
}
