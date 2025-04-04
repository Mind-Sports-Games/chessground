import type * as cg from '../../types';
import {Key, Pos} from "../../types";

import type {DirectionString} from './types';
import {getAngle360, isValidKey, norm, vectTo3} from './util';

export enum DiagonalDirectionString {
	UpLeft = 'NW',
	UpRight = 'NE',
	DownRight = 'SE',
	DownLeft = 'SW',
}

export enum HorizontalDirectionString {
	Left = 'W',
	Right = 'E',
}

export const move = (key: Key, direction: DirectionString): Key | undefined => {
	const transformedKey = directionMappings[direction](key);
	if (isValidKey(transformedKey)) return transformedKey;
	return undefined;
};

export const getDirectionString = (vect: Pos): DirectionString | undefined => {
	if (norm(vect) == 1) {
		const angle = getAngle360(vectTo3(vect));
		
		if (angle < 60) return HorizontalDirectionString.Right;
		if (angle < 120) return DiagonalDirectionString.UpRight;
		if (angle < 180) return DiagonalDirectionString.UpLeft;
		if (angle < 240) return HorizontalDirectionString.Left;
		if (angle < 300) return DiagonalDirectionString.DownLeft;
		return DiagonalDirectionString.DownRight;
	}
	
	return undefined;
};

export const candidateLineDirs = (origToDestDirection: DiagonalDirectionString): DirectionString[] => {
	const directionMap: { [key in DiagonalDirectionString]: DirectionString[] } = {
		[DiagonalDirectionString.UpLeft]: [HorizontalDirectionString.Left, DiagonalDirectionString.UpLeft],
		[DiagonalDirectionString.UpRight]: [
			DiagonalDirectionString.UpLeft,
			DiagonalDirectionString.UpRight,
			HorizontalDirectionString.Right,
		],
		[DiagonalDirectionString.DownRight]: [HorizontalDirectionString.Right, DiagonalDirectionString.DownRight],
		[DiagonalDirectionString.DownLeft]: [
			DiagonalDirectionString.DownRight,
			DiagonalDirectionString.DownLeft,
			HorizontalDirectionString.Left,
		],
	};
	return directionMap[origToDestDirection];
};

export const deducePotentialSideDirs = (
	origToDestDirection: DiagonalDirectionString,
	lineDirection: DirectionString,
): DirectionString[] => {
	switch (origToDestDirection) {
		case DiagonalDirectionString.DownLeft:
			switch (lineDirection) {
				case DiagonalDirectionString.DownLeft:
					return [HorizontalDirectionString.Left, DiagonalDirectionString.DownRight];
				case DiagonalDirectionString.DownRight:
					return [DiagonalDirectionString.DownLeft];
				case HorizontalDirectionString.Left:
					return [DiagonalDirectionString.DownLeft];
				default:
					return [];
			}
		case DiagonalDirectionString.UpRight:
			switch (lineDirection) {
				case DiagonalDirectionString.UpLeft:
					return [DiagonalDirectionString.UpRight];
				case DiagonalDirectionString.UpRight:
					return [HorizontalDirectionString.Right, DiagonalDirectionString.UpLeft];
				case HorizontalDirectionString.Right:
					return [DiagonalDirectionString.UpRight];
				default:
					return [];
			}
		case DiagonalDirectionString.UpLeft:
			switch (lineDirection) {
				case DiagonalDirectionString.UpLeft:
					return [HorizontalDirectionString.Left];
				case HorizontalDirectionString.Left:
					return [DiagonalDirectionString.UpLeft];
				default:
					return [];
			}
		case DiagonalDirectionString.DownRight:
			switch (lineDirection) {
				case DiagonalDirectionString.DownRight:
					return [HorizontalDirectionString.Right];
				case HorizontalDirectionString.Right:
					return [DiagonalDirectionString.DownRight];
				default:
					return [];
			}
		default:
			return [];
	}
};

export const listPotentialSideDirs = (lineDirection: DirectionString): DirectionString[] => {
	switch (lineDirection) {
		case HorizontalDirectionString.Right:
			return [DiagonalDirectionString.UpRight, DiagonalDirectionString.DownRight];
		case HorizontalDirectionString.Left:
			return [DiagonalDirectionString.UpLeft, DiagonalDirectionString.DownLeft];
		case DiagonalDirectionString.UpLeft:
			return [HorizontalDirectionString.Left, DiagonalDirectionString.UpRight];
		case DiagonalDirectionString.DownLeft:
			return [HorizontalDirectionString.Left, DiagonalDirectionString.DownRight];
		case DiagonalDirectionString.DownRight:
			return [HorizontalDirectionString.Right, DiagonalDirectionString.DownLeft];
		case DiagonalDirectionString.UpRight:
			return [HorizontalDirectionString.Right, DiagonalDirectionString.UpLeft];
		default:
			return [];
	}
};

const directionMappings: { [key in DirectionString]: (key: Key) => Key } = {
	NW: (key: Key) => (String.fromCharCode(key[0].charCodeAt(0)) + (parseInt(key[1]) + 1).toString()) as Key,
	NE: (key: Key) => (String.fromCharCode(key[0].charCodeAt(0) + 1) + (parseInt(key[1]) + 1).toString()) as Key,
	SW: (key: Key) => (String.fromCharCode(key[0].charCodeAt(0) - 1) + (parseInt(key[1]) - 1).toString()) as Key,
	SE: (key: Key) => (String.fromCharCode(key[0].charCodeAt(0)) + (parseInt(key[1]) - 1).toString()) as Key,
	W: (key: Key) => (String.fromCharCode(key[0].charCodeAt(0) - 1) + key[1]) as Key,
	E: (key: Key) => (String.fromCharCode(key[0].charCodeAt(0) + 1) + key[1]) as Key,
};
