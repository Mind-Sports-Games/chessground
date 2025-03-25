import type * as cg from '../../types';

import {candidateLineDirs, deducePotentialSideDirs, DiagonalDirectionString, getDirectionString, inverseDirection, isMoveInLine, move,} from './directions';
import type {MoveImpact, MoveVector} from './types';
import {add, div, getRotatedKeepNorm, isCell, key2pos, mult, norm, pos2key, sub} from "./util";

// Computes the effect of a move on the board before it is made
export const computeMoveImpact2 = (d: cg.BoardDimensions, pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): MoveImpact | undefined => {
	if (pieces.has(orig)) {
		const from = key2pos(orig);
		const to = key2pos(dest);
		const vect = sub(to, from);
		var n = norm(vect);
		
		if (n > 0) {
			var uvect = div(n, vect);
			const neighVectors = neighVectors();
			
			if (neighVectors.includes(uvect)) {// In-line move
				const diff: cg.PiecesDiff = new Map(pieces);
				var dests: cg.Key[] = [];
				var ejection = false;
				
				var a = from;
				var ka = orig;
				var pa = pieces.get(ka);
				var k = 0;
				diff.set(ka, undefined);
				
				while (k < n) {
					a = add(from, mult(++k, uvect));
					ka = pos2key(a);
					
					if (k < n - 1 && !pieces.has(ka)) return undefined;
					
					if (isCell(d, a)) {
						diff.set(ka, pa);
						dests.push(ka);
					} else {
						ejection = true;
					}
					
					pa = pieces.get(ka);
				}
				
				return {
					diff: diff,
					capture: ejection,
					moveVector: {
						directionString: getDirectionString(uvect),
						landingSquares: dests
					}
				} as MoveImpact;
			} else if (--n > 0) {
				const rot = 360/neighVectors.length;
				var found = false;
				var vvect;
				for (var _vect in neighVectors) {
					const _nvect = mult(n, _vect);
					vvect = getRotatedKeepNorm(_vect, rot);
					
					if (add(_nvect, vvect) === vect) {
						uvect = _vect;
						found = true;
						break;
					} else {
						vvect = getRotatedKeepNorm(_vect, -rot);
						
						if (add(_nvect, vvect) === vect) {
							uvect = _vect;
							found = true;
							break;
						}
					}
				}
				
				if (found) {// Broadside move
					const diff: cg.PiecesDiff = new Map(pieces);
					var dests: cg.Key[] = [];
					
					var a = from;
					var ka = orig;
					var pa = pieces.get(ka);
					var k = 0;
					
					while (k < n) {
						if (!isCell(d, a)) return undefined;
						
						const b = add(a, vvect);
						if (!isCell(d, b)) return undefined;
						const kb = pos2key(b);
						if (pieces.has(kb)) return undefined;
						
						diff.set(ka, undefined);
						diff.set(kb, pa);
						dests.push(kb);
						
						a = add(from, mult(++k, uvect));
						ka = pos2key(a);
						pa = pieces.get(ka);
					}
					
					return {
						diff: diff,
						capture: false,
						moveVector: {
							directionString: getDirectionString(vvect),
							landingSquares: dests
						}
					} as MoveImpact;
				}
			}
		}
	}
	
	return undefined;
};

// compute a move vector after a move has been made
export const computeMoveVectorPostMove = (pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): MoveVector | undefined => {
	//TODO? Alex: the direction is just (dest - orig)/its norm (well, for in-line moves), but directionString is used in xhtml classes
	const directionString = getDirectionString(dest, orig);
	if (!directionString) return undefined;
	const isAMoveInLine = isMoveInLine(dest, orig, directionString);
	const inverseDirectionString = inverseDirection(directionString);
	
	if (isAMoveInLine) {
		return {
			directionString: inverseDirectionString,
			landingSquares: [dest],//TODO Alex I think we should draw arrows on all moving marbles, hence all marbles from orig to dest (with the special case of the broadside moves)
		};
	}
	
	// side move
	for (const lineDir of candidateLineDirs(directionString as DiagonalDirectionString)) {
		const sideDirs = deducePotentialSideDirs(directionString as DiagonalDirectionString, lineDir);
		const secondPos = move(dest, lineDir);
		if (secondPos === undefined) continue;
		for (const sideDir of sideDirs) {
			const side2ndPos = move(secondPos, sideDir);
			if (side2ndPos) {
				const side1stPos = move(dest, sideDir);
				if (side1stPos === undefined) continue;
				if (side1stPos && pieces.get(secondPos)) {
					if (side2ndPos === orig) {
						return {
							directionString: inverseDirection(sideDir),
							landingSquares: [secondPos, dest],
						};
					} else {
						// 3 marbles are moving
						const thirdPos = move(secondPos, lineDir);
						if (thirdPos === undefined) continue;
						const side3rdPos = move(thirdPos, sideDir);
						if (side3rdPos === undefined) continue;
						if (pieces.get(thirdPos) && side3rdPos === orig) {
							return {
								directionString: inverseDirection(sideDir),
								landingSquares: [secondPos, thirdPos, dest],
							};
						}
					}
				}
			}
		}
	}
	
	return undefined;
};
