import type * as cg from '../../types';
import {BoardDimensions, File, files, Key, NumberPair, Orientation, Pos, Rank, ranks19, Variant} from "../../types";
import {SquareDimensions, TranslateBase} from './types';

export const getBoardSize = (variant: Variant): BoardDimensions => {
	switch (variant) {
		default:
		case 'abalone':
			return {width: 9, height: 9};
		case 'grandabalone':
			return {width: 11, height: 11};
	}
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

const computeShift = (k: Key): Pos => {
	const bt = {width: 9, height: 9};//FIXME Alex
	const radiush = bt.width/2
	const rank = parseInt(k.slice(1));//FIXME Alex
	const file = k.charCodeAt(0) - 96;//FIXME Alex
	const xScale = 100;
	const yScale = 100*(0 < rank && rank < bt.height? 1: 10);
	const x = file + shift[rank - 1] - 1;
	const y = bt.height - rank + (rank < radiush? -1: rank === radiush? 0: 1);
	
	return [x*xScale, y*yScale];
};

// from a key, determine a position
export const key2posAlt = (k: Key): Pos => {
	return computeShift(k);
};

// shift is used by analysis page and miniboards
const shift = [2, 1.5, 1, 0.5, 0, -0.5, -1, -1.5, -2];//FIXME Alex size 9...


export const posToTranslateRel = (
	pos: Pos,
	orientation: Orientation,
	_bt: BoardDimensions,
	_v: Variant,
): NumberPair => {
	return translateBase[orientation](pos, 100, 100, {width: 9, height: 9});//FIXME Alex size 9...
};

export const translateAbs = (el: HTMLElement, pos: NumberPair): void => {
	el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateRel = (el: HTMLElement, percents: NumberPair): void => {
	el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
};

const getFiles = (n: number) => {
	return files.slice(0, n);
};

const getRanks = (n: number) => {
	return ranks19.slice(0, n);
};

const allKeys = (d: BoardDimensions): Key[] => {
	return Array.prototype.concat(...getRanks(d.height).map(r => getFiles(d.width).map(f => r + f)));
};

export const allPos = (d: BoardDimensions): Pos[] => allKeys(d).map(key2posAlt);

const posToTranslateBase2 = (bounds: ClientRect, pos: Pos, orientation: Orientation): NumberPair => {
	return translateBase2[orientation](pos, bounds);
};
export const posToTranslateAbs2 = (): ((
	bounds: ClientRect,
	pos: Pos,
	orientation: Orientation,
) => NumberPair) => {
	return (bounds, pos, orientation) => posToTranslateBase2(bounds, pos, orientation);
};
const translateBase2: Record<Orientation, TranslateBase> = {
	//TODO Alex centre instead of (5, 5)
	p1: (pos: Pos, bounds: ClientRect) => {
		const height = bounds.height;
		const width = bounds.width;
		const squareDimensions = getSquareDimensions(bounds);
		
		const computedHeight = height*0.4546 + squareDimensions.height*(5 - pos[1]);
		let computedWidth = computedWidth = width*0.4546 + squareDimensions.width*(pos[0] - 5) - 0.5*(pos[1] - 5)*squareDimensions.width;
		
		return [computedWidth, computedHeight];
	},
	p2: (pos: Pos, bounds: ClientRect) => {
		const height = bounds.height;
		const width = bounds.width;
		const squareDimensions = getSquareDimensions(bounds);
		
		const computedHeight = height*0.4546 + squareDimensions.height*(pos[1] - 5);
		let computedWidth = computedWidth = width*0.4546 + squareDimensions.width*(5 - pos[0]) - 0.5*(5 - pos[1])*squareDimensions.width;
		
		return [computedWidth, computedHeight];
	},
	right: (pos: Pos, bounds: ClientRect) => [(pos[1] - 1)*bounds.x, (pos[0] - 1)*bounds.x],
	left: (pos: Pos, bounds: ClientRect) => [(pos[1] - 1)*bounds.x, (pos[0] - 1)*bounds.x],
	p1vflip: (pos: Pos, bounds: ClientRect) => [(pos[1] - 1)*bounds.x, (pos[0] - 1)*bounds.x],
};

export const getSquareDimensions = (bounds: ClientRect): SquareDimensions => ({
	width: bounds.width*0.093,
	height: bounds.height*0.081,
});

//FIXME isCell, with BoardDimensions
export const getCoordinates = (x: number, y: number, orientation: Orientation): Key | undefined => {
	const file = files[x] as File;
	const rank = ranks19[y] as Rank;
	
	const key = (rank + file) as Key;
	
	return isValidKey(key)?
		orientation === 'p1'?
			key:
			rotate180(file, rank) as Key:
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
export const isValidKey = (key: Key): boolean => {//FIXME Alex size 9
	return /^(a[1-5]|b[1-6]|c[1-7]|d[1-8]|e[1-9]|f[2-9]|g[3-9]|h[4-9]|i[5-9])$/.test(key);
};

//
// Drawn
const bottomLeft = [295, 854];

const createTranslateBase = (): Record<Orientation, cg.TranslateBase> => {
	return {
		p1: (pos: Pos, xScale: number, yScale: number, _bt: BoardDimensions) => {
			const basic = cellToBasic(pos);
			return [bottomLeft[0] + xScale*basic[0], bottomLeft[1] + yScale*basic[1]];
		},
		p2: (pos: Pos, xScale: number, yScale: number, _bt: BoardDimensions) => {
			const basic = cellToBasic(pos);
			return [bottomLeft[0] + xScale*basic[0], bottomLeft[1] + yScale*basic[1]];
		},
		right: (pos: Pos, xScale: number, yScale: number, _) => [pos[1]*xScale, pos[0]*yScale],// Not used
		left: (pos: Pos, xScale: number, yScale: number, bt: BoardDimensions) => [(bt.width - pos[0] - 1)*xScale, pos[1]*yScale],// Not used
		p1vflip: (pos: Pos, xScale: number, yScale: number, _) => [pos[0]*xScale, pos[1]*yScale],// Not used
	};
};
const translateBase = createTranslateBase();

export const drawnToCell = (d: BoardDimensions, pos: Pos): Pos => {
	return drawnToCellCore(d, pos[0], pos[1]);
}
export const drawnToCellCore = (d: BoardDimensions, x: number, y: number): Pos => {
	return basicToCell(drawnToBasicCore(d, x, y));
}

export const drawnToBasicCore = (d: BoardDimensions, x: number, y: number): Pos => {
	return [0, 0] as Pos;//TODO
}

//
// Basic
const sr3 = Math.sqrt(3);

export const basicToDrawn = (d: BoardDimensions, pos: Pos): Pos => {
	return basicToDrawnCore(d, pos[0], pos[1]);
}
export const basicToDrawnCore = (d: BoardDimensions, x: number, y: number): Pos => {
	const centre = cellToBasicCore(Math.floor(d.width/2), Math.floor(d.height/2));
	const xScale = 100;
	const yScale = 100;
	
	return [xScale*(x - centre[0]), yScale*(y - centre[1])];
}

export const basicToCell = (pos: Pos): Pos => {
	return basicToCellCore(pos[0], pos[1]);
}
export const basicToCellCore = (x: number, y: number): Pos => {
	return [x + y/sr3, y*2/sr3] as Pos;
}

//
// Cell
export const cellToBasic = (pos: Pos): Pos => {
	return cellToBasicCore(pos[0], pos[1]);
}
export const cellToBasicCore = (x: number, y: number): Pos => {
	return [x - y/2.0, y*sr3/2] as Pos;
}

export const cellToDrawn = (d: BoardDimensions, pos: Pos): Pos => {
	return cellToDrawnCore(d, pos[0], pos[1]);
}
export const cellToDrawnCore = (d: BoardDimensions, x: number, y: number): Pos => {
	return basicToDrawn(d, cellToBasicCore(x, y));
}

export const isCell = (variant: Variant, pos: Pos): boolean => {
	return isCellCore(getBoardSize(variant), pos);
}
const isCellCore = (dim: BoardDimensions, pos: Pos): boolean => {
	return dist([dim.width/2, dim.height/2] as Pos, pos) < dim.width/2;
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
	return [n*a[0], n*a[1]];
}
export const div = (n: number, a: Pos): Pos => {
	return mult(1/n, a);
}

export const vectTo3 = (a: Pos): Pos => {
	return cellToBasic(a);
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