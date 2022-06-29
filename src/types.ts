export type Variant =
  | 'chess'
  | 'crazyhouse'
  | 'chess960'
  | 'kingOfTheHill'
  | 'threeCheck'
  | 'antichess'
  | 'atomic'
  | 'horde'
  | 'racingKings'
  | 'linesOfAction'
  | 'makruk'
  | 'cambodian'
  | 'sittuyin'
  | 'placement'
  | 'shogi'
  | 'minishogi'
  | 'kyotoshogi'
  | 'dobutsu'
  | 'gorogoro'
  | 'torishogi'
  | 'xiangqi'
  | 'minixiangqi'
  | 'capablanca'
  | 'seirawan'
  | 'capahouse'
  | 'shouse'
  | 'grand'
  | 'grandhouse'
  | 'gothic'
  | 'gothhouse'
  | 'shako'
  | 'shogun'
  | 'janggi'
  | 'makpong'
  | 'orda'
  | 'synochess'
  | 'manchu'
  | 'musketeer'
  | 'hoppelpoppel'
  | 'shinobi'
  | 'empire'
  | 'ordamirror'
  | 'flipello'
  | 'flipello10'
  | 'oware'
  | undefined;
export type PlayerIndex = typeof playerIndexs[number];
export type Letter = typeof letters[number];
export type Role = `${Letter}-piece` | `p${Letter}-piece`;
export type File = typeof files[number];
export type Rank = typeof ranks10[number];
export type Key = 'a0' | `${File}${Rank}`;
export type FEN = string;
export type Pos = [number, number];
export interface Piece {
  role: Role;
  playerIndex: PlayerIndex;
  promoted?: boolean;
}
export interface Drop {
  role: Role;
  key: Key;
}
export type Pieces = Map<Key, Piece>;
export type PiecesDiff = Map<Key, Piece | undefined>;

export type KeyPair = [Key, Key];

export type NumberPair = [number, number];

export type NumberQuad = [number, number, number, number];

export type Orientation = typeof orientations[number];
export type TransformToP1 = (_: Pos, bt: BoardDimensions) => Pos;
export type TranslateBase = (pos: Pos, xFactor: number, yFactor: number, bt: BoardDimensions) => NumberPair;

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type Dests = Map<Key, Key[]>;

export type DropDests = Map<Role, Key[]>;

export interface Elements {
  board: HTMLElement;
  container: HTMLElement;
  ghost?: HTMLElement;
  svg?: SVGElement;
  customSvg?: SVGElement;
}
export interface Dom {
  elements: Elements;
  bounds: Memo<ClientRect>;
  redraw: () => void;
  redrawNow: (skipSvg?: boolean) => void;
  unbind?: Unbind;
  destroyed?: boolean;
  relative?: boolean; // don't compute bounds, use relative % to place pieces
}
export interface Exploding {
  stage: number;
  keys: readonly Key[];
}

export interface MoveMetadata {
  premove: boolean;
  ctrlKey?: boolean;
  holdTime?: number;
  captured?: Piece;
  predrop?: boolean;
}
export interface SetPremoveMetadata {
  ctrlKey?: boolean;
}

export type WindowEvent = 'onscroll' | 'onresize';

export type MouchEvent = Event & Partial<MouseEvent & TouchEvent>;

export interface KeyedNode extends HTMLElement {
  cgKey: Key;
}
export interface PieceNode extends KeyedNode {
  tagName: 'PIECE';
  cgPiece: string;
  cgAnimating?: boolean;
  cgFading?: boolean;
  cgDragging?: boolean;
}
export interface SquareNode extends KeyedNode {
  tagName: 'SQUARE';
}

export interface Memo<A> {
  (): A;
  clear: () => void;
}

export interface Timer {
  start: () => void;
  cancel: () => void;
  stop: () => number;
}

export type Redraw = () => void;
export type Unbind = () => void;
export type Milliseconds = number;
export type KHz = number;

export const orientations = ['p1', 'p2', 'left', 'right'] as const; // where the player is sat on the board with p1 at the bottom
export const playerIndexs = ['p1', 'p2'] as const;
export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'] as const;
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ':'] as const;
export const ranks10 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
export const letters = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

export interface BoardDimensions {
  width: number;
  height: number;
}

export const enum Notation {
  DEFAULT,
  SAN,
  LAN,
  SHOGI_HOSKING,
  SHOGI_HODGES,
  SHOGI_HODGES_NUMBER,
  JANGGI,
  XIANGQI_WXF,
}

export const shogiVariants: Variant[] = ['shogi', 'minishogi', 'kyotoshogi', 'dobutsu', 'gorogoro', 'torishogi'];
export const xiangqiVariants: Variant[] = ['xiangqi', 'minixiangqi', 'manchu', 'janggi'];
