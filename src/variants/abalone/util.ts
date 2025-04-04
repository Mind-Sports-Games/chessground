import {BoardDimensions, files, Key, NumberPair, Orientation, Piece, PlayerIndex, Pos, ranks19, Variant} from "../../types";
import {SquareDimensions} from './types';

export const getBoardSize = (variant: Variant): BoardDimensions => {
	switch (variant) {
		default:
		case 'abalone':
			return {width: 9, height: 9};
		case 'grandabalone':
			return {width: 11, height: 11};
	}
}

export const isUsable = (variant: Variant, piece: Piece, player: PlayerIndex): boolean => {
	return piece.playerIndex === player;
}
export const isPushable = (variant: Variant, piece: Piece, player: PlayerIndex): boolean => {
	return isEjectable(variant, piece, player);
}
export const isEjectable = (variant: Variant, piece: Piece, player: PlayerIndex): boolean => {
	return piece.playerIndex !== player;
}

export const getMaxUsable = (variant: Variant): number | undefined => {
	switch (variant) {
		default:
			return undefined;
		case 'abalone':
			return 3;
		case 'grandabalone':
			return 4;
	}
}
export const getWinningScore = (variant: Variant): number => {
	switch (variant) {
		default:
		case 'abalone':
			return 6;
		case 'grandabalone':
			return 10;
	}
}
export const hasPrevPlayer = (variant: Variant): boolean => {
	switch (variant) {
		default:
		case 'abalone':
			return false;
		case 'grandabalone':
			return true;
	}
}

export const getCellList = (variant: Variant): Pos[] => {
	const size = getBoardSize(variant);
	const res: Pos[] = [];
	
	for (let y = 0; y < size.height; y++) {
		for (let x = 0; x < size.width; x++) {
			const pos: Pos = [x, y];
			if (isCellCore(size, pos)) res.push(pos);
		}
	}
	
	return res;
}

export const pos2key = (pos: Pos): Key => {
	return (ranks19[pos[1]] + files[pos[0]]) as Key;
};

export const key2pos = (k: Key): Pos => {
	return [parseInt(k.slice(1)), k.charCodeAt(0) - 96] as Pos;
};

//TODO delete
// const computeShift = (k: Key): Pos => {
// 	const bt = {width: 9, height: 9};//FIXME Alex
// 	const radiush = bt.width/2
// 	const rank = parseInt(k.slice(1));//FIXME Alex
// 	const file = k.charCodeAt(0) - 96;//FIXME Alex
// 	const xScale = 100;
// 	const yScale = 100*(0 < rank && rank < bt.height? 1: 10);
// 	const x = file + shift[rank - 1] - 1;
// 	const y = bt.height - rank + (rank < radiush? -1: rank === radiush? 0: 1);
//
// 	return [x*xScale, y*yScale];
// };

//TODO delete
// // from a key, determine a position
// export const key2posAlt = (k: Key): Pos => {//TODO? or delete
// 	return computeShift(k);
// };

//TODO delete?
// // shift is used by analysis page and miniboards
// const shift = [2, 1.5, 1, 0.5, 0, -0.5, -1, -1.5, -2];//FIXME Alex size 9...//TODO delete, even

export const posToTranslateRel = (
	variant: Variant,
	pos: Pos,
	orientation: Orientation
): NumberPair => {
	return cellToDrawn(variant, pos);//TODO shouldn't it depend on the orientation?
}

export const translateAbs = (el: HTMLElement, pos: NumberPair): void => {
	el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
}

export const translateRel = (el: HTMLElement, percents: NumberPair): void => {
	el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
}

export const posToTranslateAbs = (variant: Variant, bounds: ClientRect, pos: Pos, orientation: Orientation): NumberPair => {
	let res = cellToPxrel(variant, bounds, pos);
	
	if (orientation == "p2") {
		res = mult(-1, res);
	}
	
	return pxrelToPx(variant, bounds, res);
}

export const getSquareDimensions = (bounds: ClientRect): SquareDimensions => ({
	width: bounds.width*0.093,
	height: bounds.height*0.081,
})

//FIXME delete
/** @deprecated */
export const isValidKey = (key: Key): boolean => {//FIXME Alex size 9
	return /^(a[1-5]|b[1-6]|c[1-7]|d[1-8]|e[1-9]|f[2-9]|g[3-9]|h[4-9]|i[5-9])$/.test(key);
}

//
// Drawn
const bottomLeft = [295, 854];

export const drawnToBasic = (variant: Variant, pos: Pos): Pos => {
	return sub(div(100., pos), bottomLeft);
}
export const drawnToCell = (variant: Variant, pos: Pos): Pos => {
	return basicToCell(drawnToBasic(variant, pos));
}

//
// Basic
export const basicToDrawn = (variant: Variant, pos: Pos): Pos => {
	return add(bottomLeft, mult(100, pos));
}
export const basicToCell = (pos: Pos): Pos => {
	const res = [pos[0] + pos[1]/sr3, pos[1]*2/sr3];
	return [Math.round(res[0]), Math.round(res[1])];
}

//
// Px
export const pxToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return sub(
		sub(pos, [bounds.left, bounds.top]),// Taking into account the T & L margins//TODO is it necessary?
		div(2., [bounds.width, bounds.height]));
}
export const pxToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pxrelToP(variant, bounds, pxToPxrel(variant, bounds, pos));
}
export const pxToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pxrelToCellrel(variant, bounds, pxToPxrel(variant, bounds, pos));
}
export const pxToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pxrelToCell(variant, bounds, pxToPxrel(variant, bounds, pos));
}

//
// Pxrel
export const pxrelToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return add(
		[bounds.left, bounds.top],// Taking into account the T & L margins//TODO is it necessary?
		add(
			div(2., [bounds.width, bounds.height]),
			pos
		)
	);
}
export const pxrelToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	const d = getSquareDimensions(bounds);
	return div2(d.width, d.height, pos);
}
export const pxrelToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pToCellrel(variant, bounds, pxrelToP(variant, bounds, pos));
}
export const pxrelToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pToCell(variant, bounds, pxrelToP(variant, bounds, pos));
}

//
// P
export const pToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pxrelToPx(variant, bounds, pToPxrel(variant, bounds, pos));
}
export const pToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	const d = getSquareDimensions(bounds);
	return mult2(d.width, d.height, pos);
}
export const pToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return cellrelToP(variant, bounds, pos);// Involution
}
export const pToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return cellrelToCell(variant, bounds, pToCellrel(variant, bounds, pos));
}

//
// Cellrel
export const cellrelToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pToPx(variant, bounds, cellrelToP(variant, bounds, pos));
}
export const cellrelToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return pToPxrel(variant, bounds, cellrelToP(variant, bounds, pos));
}
export const cellrelToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return [pos[0] - pos[1]/2, -pos[1]];
}
export const cellrelToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	const res = add(pos, getCentre(variant));
	return [Math.round(res[0]), Math.round(res[1])];
}

//
// Cell
export const cellToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return cellrelToPx(variant, bounds, cellToCellrel(variant, bounds, pos));
}
export const cellToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return cellrelToPxrel(variant, bounds, cellToCellrel(variant, bounds, pos));
}
export const cellToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return cellrelToP(variant, bounds, cellToCellrel(variant, bounds, pos));
}
export const cellToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
	return sub(pos, getCentre(variant));
}

export const cellToDrawn = (variant: Variant, pos: Pos): Pos => {
	return basicToDrawn(variant, cellToBasic(variant, pos));
}
export const cellToBasic = (variant: Variant, pos: Pos): Pos => {
	return vectTo3(pos);
}

export const sr3 = Math.sqrt(3);

export const getCentre = (variant: Variant): Pos => {
	const s = getBoardSize(variant);
	return [Math.floor(s.width/2), Math.floor(s.height/2)];
}

export const isCell = (variant: Variant, pos: Pos): boolean => {
	return isCellCore(getBoardSize(variant), pos);
}
const isCellCore = (d: BoardDimensions, pos: Pos): boolean => {
	return dist([d.width/2, d.height/2] as Pos, pos) < d.width/2;
}

//
// Geometry
export const add = (a: Pos, b: Pos): Pos => {
	return [a[0] + b[0], a[1] + b[1]];
}
export const sub = (a: Pos, b: Pos): Pos => {
	return add(a, mult(-1, b));
}
export const mult = (n: number, a: Pos): Pos => {
	return mult2(n, n, a);
}
export const mult2 = (n: number, p: number, a: Pos): Pos => {
	return [n*a[0], p*a[1]];
}
export const div = (n: number, a: Pos): Pos => {
	return mult(1/n, a);
}
export const div2 = (n: number, p: number, a: Pos): Pos => {
	return mult2(1/n, 1/p, a);
}

export const vectTo3 = (a: Pos): Pos => {
	return [a[0] - a[1]/2., a[1]*sr3/2];
}
export const cross = (a: Pos, b: Pos): number => {
	return a[0]*b[1] - a[1]*b[0];
}

export const getRotated = (a: Pos, deg: number): Pos => {
	const rot = deg*180/Math.PI;
	const cos = Math.cos(rot)
	const sin = Math.sin(rot)
	return [cos*a[0] - sin*a[1], sin*a[0] + cos*a[1]];
}
export const getRotatedKeepNorm = (a: Pos, deg: number): Pos => {
	const p = getRotated(a, deg);
	
	let n = norm(p);
	if (n > 0) {
		n = norm(a)/n
	}
	
	return mult(n, p);
}
export const getPrev = (vect: Pos): Pos => {
	return getPrevCore(getNeighVectors(), vect);
}
export const getPrevCore = (neighVectors: Pos[], vect: Pos): Pos => {
	return getRotatedKeepNorm(vect, -360/neighVectors.length);
}
export const getNext = (vect: Pos): Pos => {
	return getNextCore(getNeighVectors(), vect);
}
export const getNextCore = (neighVectors: Pos[], vect: Pos): Pos => {
	return getRotatedKeepNorm(vect, 360/neighVectors.length);
}

export const getAngle = (a: Pos): number => {
	return Math.atan2(a[1], a[0])*180/Math.PI;
}
export const getAngle360 = (a: Pos): number => {
	return rest(getAngle(a), 360);
}
export const rest = (todiv: number, divby: number): number => {
	let res = todiv%divby;
	
	if (res < 0) res += divby > 0? divby: -divby;
	//if (res === -0) res = 0;
	if (res < 0) res = 0;
	
	return res;
}
export const divint = (todiv: number, divby: number): number => {
	let res = todiv/divby;
	if (todiv < 0 && todiv%divby != 0) res += divby > 0? -1: 1;
	
	return res;
}

export const dist = (pos0: Pos, pos1: Pos): number => {
	return normCore(pos0[0] - pos1[0], pos0[1] - pos1[1]);
}
export const norm = (pos: Pos): number => {
	return normCore(pos[0], pos[1]);
}
export const normCore = (x: number, y: number): number => {
	return x*y < 0?
		Math.abs(x) + Math.abs(y):
		Math.max(Math.abs(x), Math.abs(y));
}

const normRadius = 1;
export const getNeighVectors = (): Pos[] => {
	const res = [];
	
	for (let i = -normRadius; i <= normRadius; i++) {
		for (let j = -normRadius; j <= normRadius; j++) {
			if (normCore(i, j) === 1) {
				res.push([i, j] as Pos)
			}
		}
	}
	
	return res;
}