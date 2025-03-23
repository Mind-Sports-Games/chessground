import type * as cg from '../../types';
import {files, Pos, ranks, ranks19} from "../../types";
import {SquareDimensions, TranslateBase} from './types';

export const pos2key = (pos: cg.Pos): cg.Key => {
	return (ranks19[pos[1]] + files[pos[0]]) as cg.Key;
};

export const key2pos = (k: cg.Key): cg.Pos => {
	const rank = parseInt(k.slice(1));//FIXME Alex
	const file = k.charCodeAt(0) - 96;//FIXME Alex
	
	return [file, rank] as cg.Pos;
};

const computeShift = (k: cg.Key): cg.Pos => {
	const bt = {width: 9, height: 9};//FIXME Alex
	const radiush = bt.width/2
	const rank = parseInt(k.slice(1));//FIXME Alex
	const file = k.charCodeAt(0) - 96;//FIXME Alex
	const xScale = 100;
	const yScale = 100*(0 < rank && rank < bt.height? 1: 10);
	const x = file + shift[rank - 1] - 1;
	const y = bt.height - rank + (rank < radiush? -1: rank == radiush? 0: 1);
	
	return [x*xScale, y*yScale];
};

// from a key, determine a position
export const key2posAlt = (k: cg.Key): cg.Pos => {
	return computeShift(k);
};

// shift is used by analysis page and miniboards
const shift = [2, 1.5, 1, 0.5, 0, -0.5, -1, -1.5, -2];//FIXME Alex size 9...

// translateBase defines where the translation of a piece should be placed on the board.
// It is used to render the piece at the correct place.
const createTranslateBase = (): Record<cg.Orientation, cg.TranslateBase> => {
	const squareWidth = 102.5;
	const squareHeight = 88;
	const bottomLeft = [295, 854];
	const shift = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4];//FIXME Alex size 9...
	
	return {
		p1: (pos: cg.Pos, _xScale: number, _yScale: number, _bt: cg.BoardDimensions) => {
			if (pos[1] < 6) {
				return [
					bottomLeft[0] + squareWidth*pos[0] - (shift[pos[1] - 1] + 1)*squareWidth,
					bottomLeft[1] - (pos[1] - 1)*squareHeight,
				];
			}
			return [
				bottomLeft[0] + squareWidth*pos[0] - (shift[pos[1] - 1] + 1)*squareWidth,
				bottomLeft[1] - (pos[1] - 1)*squareHeight,
			];
		},
		p2: (pos: cg.Pos, _xScale: number, _yScale: number, _bt: cg.BoardDimensions) => {
			if (pos[1] < 6) {
				return [
					bottomLeft[0] + squareWidth*pos[0] - (shift[pos[1] - 1] + 1)*squareWidth,
					bottomLeft[1] - (pos[1] - 1)*squareHeight,
				];
			}
			return [
				bottomLeft[0] + squareWidth*pos[0] - (shift[pos[1] - 1] + 1)*squareWidth,
				bottomLeft[1] - (pos[1] - 1)*squareHeight,
			];
		},
		right: (pos: cg.Pos, xScale: number, yScale: number, _) => [(pos[1] - 1)*xScale, (pos[0] - 1)*yScale],
		left: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
			(bt.width - pos[0])*xScale,
			(pos[1] - 1)*yScale,
		],
		p1vflip: (pos: cg.Pos, xScale: number, yScale: number, _) => [(pos[0] - 1)*xScale, (pos[1] - 1)*yScale],
	};
};

const translateBase = createTranslateBase();

export const posToTranslateRel = (
	pos: cg.Pos,
	orientation: cg.Orientation,
	_bt: cg.BoardDimensions,
	_v: cg.Variant,
): cg.NumberPair => {
	return translateBase[orientation](pos, 100, 100, {width: 9, height: 9});//FIXME Alex size 9...
};

export const translateAbs = (el: HTMLElement, pos: cg.NumberPair): void => {
	el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateRel = (el: HTMLElement, percents: cg.NumberPair): void => {
	el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
};

const getFiles = (n: number) => {
	return files.slice(0, n);
};

const getRanks = (n: number) => {
	return ranks19.slice(0, n);
};

const allKeys = (bd: cg.BoardDimensions = {width: 9, height: 9}): cg.Key[] => {
	return Array.prototype.concat(...getRanks(bd.height).map(r => getFiles(bd.width).map(f => r + f)));
};

export const allPos = (bd: cg.BoardDimensions): cg.Pos[] => allKeys(bd).map(key2posAlt);

const posToTranslateBase2 = (bounds: ClientRect, pos: cg.Pos, orientation: cg.Orientation): cg.NumberPair => {
	return translateBase2[orientation](pos, bounds);
};
export const posToTranslateAbs2 = (): ((
	bounds: ClientRect,
	pos: cg.Pos,
	orientation: cg.Orientation,
) => cg.NumberPair) => {
	return (bounds, pos, orientation) => posToTranslateBase2(bounds, pos, orientation);
};
const translateBase2: Record<cg.Orientation, TranslateBase> = {
	p1: (pos: cg.Pos, bounds: ClientRect) => {
		const height = bounds.height;
		const width = bounds.width;
		const squareDimensions = getSquareDimensions(bounds);
		
		const computedHeight = height*0.4546 + squareDimensions.height*(5 - pos[1]);
		let computedWidth = width*0.4546 + squareDimensions.width*(5 - pos[0]);
		
		if (pos[1] > 5) {
			computedWidth =
				width*0.4546 + squareDimensions.width*(pos[0] - 5) - 0.5*(pos[1] - 5)*squareDimensions.width;
		} else if (pos[1] < 5) {
			computedWidth =
				width*0.4546 - squareDimensions.width*(5 - pos[0]) + 0.5*(5 - pos[1])*squareDimensions.width;
		} else {
			if (pos[0] >= 5) {
				computedWidth = width*0.4546 + squareDimensions.width*(pos[0] - 5);
			} else if (pos[0] < 5) {
				computedWidth = width*0.4546 - squareDimensions.width*(5 - pos[0]);
			}
		}
		return [computedWidth, computedHeight];
	},
	p2: (pos: cg.Pos, bounds: ClientRect) => {
		const height = bounds.height;
		const width = bounds.width;
		const squareDimensions = getSquareDimensions(bounds);
		
		const computedHeight = height*0.4546 + squareDimensions.height*(pos[1] - 5);
		let computedWidth = width*0.4546 + squareDimensions.width*(5 - pos[0]);
		
		if (pos[1] < 5) {
			computedWidth =
				width*0.4546 + squareDimensions.width*(5 - pos[0]) - 0.5*(5 - pos[1])*squareDimensions.width;
		} else if (pos[1] > 5) {
			computedWidth =
				width*0.4546 - squareDimensions.width*(pos[0] - 5) + 0.5*(pos[1] - 5)*squareDimensions.width;
		} else {
			if (pos[0] <= 5) {
				computedWidth = width*0.4546 + squareDimensions.width*(5 - pos[0]);
			} else if (pos[0] > 5) {
				computedWidth = width*0.4546 - squareDimensions.width*(pos[0] - 5);
			}
		}
		return [computedWidth, computedHeight];
	},
	right: (pos: cg.Pos, bounds: ClientRect) => [(pos[1] - 1)*bounds.x, (pos[0] - 1)*bounds.x],
	left: (pos: cg.Pos, bounds: ClientRect) => [(pos[1] - 1)*bounds.x, (pos[0] - 1)*bounds.x],
	p1vflip: (pos: cg.Pos, bounds: ClientRect) => [(pos[1] - 1)*bounds.x, (pos[0] - 1)*bounds.x],
};

export const getSquareDimensions = (bounds: ClientRect): SquareDimensions => ({
	width: bounds.width*0.093,
	height: bounds.height*0.081,
});

//FIXME isCell, with BoardDimensions
export const getCoordinates = (x: number, y: number, orientation: cg.Orientation): cg.Key | undefined => {
	const file = files[x] as cg.File;
	const rank = ranks19[y] as cg.Rank;
	
	const key = (rank + file) as cg.Key;
	
	return isValidKey(key)?
		orientation === 'p1'?
			key:
			rotate180(file, rank) as cg.Key:
		undefined;
};

//FIXME board size; string?
const rotate180 = (file: string, rank: string): string => {
	const files = 'abcdefghi';//FIXME Alex size 9
	const ranks = '123456789';//FIXME Alex size 9
	const rotatedFile = files[files.length - 1 - files.indexOf(file)];
	const rotatedRank = ranks[ranks.length - 1 - ranks.indexOf(rank)];
	return rotatedFile + rotatedRank;//FIXME Alex
};

//FIXME delete
/** @deprecated */
export const isValidKey = (key: cg.Key): boolean => {//FIXME Alex size 9
	return /^(a[1-5]|b[1-6]|c[1-7]|d[1-8]|e[1-9]|f[2-9]|g[3-9]|h[4-9]|i[5-9])$/.test(key);
};

export const isCell = (dim: cg.BoardDimensions, pos: Pos): boolean => {
	return dist([dim.width/2, dim.height/2] as Pos, pos) < dim.width/2;
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
//TODO in fact, here Pos refers to the drawn coordinates... in some cases