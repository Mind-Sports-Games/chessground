import type * as cg from '../../types';
import {Pos} from "../../types";

import {candidateLineDirs, deducePotentialSideDirs, DiagonalDirectionString, getDirectionString, inverseDirection, isMoveInLine, move,} from './directions';
import type {MoveImpact, MoveVector} from './types';
import {add, div, getNeighVectors, getRotatedKeepNorm, isCell, key2pos, mult, norm, pos2key, sub} from "./util";

// Computes the effect of a move on the board before it is made
export const computeMoveImpact = (d: cg.BoardDimensions, pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): MoveImpact | undefined => {
	if (pieces.has(orig) && !pieces.has(dest)) {
		const from = key2pos(orig);
		const to = key2pos(dest);
		const vect = sub(to, from);
		var n = norm(vect);
		
		if (n > 0) {
			var uvect = div(n, vect);
			const neighVectors = getNeighVectors();
			
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
				for (var _vect: Pos in neighVectors) {
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
					var k = 0;
					
					while (k < n) {
						if (!isCell(d, a)) return undefined;
						
						const b = add(a, vvect);
						if (!isCell(d, b)) return undefined;
						const kb = pos2key(b);
						if (pieces.has(kb)) return undefined;
						
						diff.set(ka, undefined);
						diff.set(kb, pieces.get(ka));
						dests.push(kb);
						
						a = add(from, mult(++k, uvect));
						ka = pos2key(a);
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

// Computes a move vector after the move has been made
export const computeMoveVectorPostMove = (pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): MoveVector | undefined => {
	if (!pieces.has(orig) && pieces.has(dest)) {
		const from = key2pos(orig);
		const to = key2pos(dest);
		const vect = sub(to, from);
		var n = norm(vect);
		
		if (n > 0) {
			var uvect = div(n, vect);
			const neighVectors = getNeighVectors();
			
			if (neighVectors.includes(uvect)) {// In-line move
				var dests: cg.Key[] = [];
				
				var a = to;
				var ka = dest;
				var k = 0;
				
				while (k < n) {
					dests.push(ka);
					
					a = sub(to, mult(++k, uvect));
					ka = pos2key(a);
					
					if (k < n - 1 && !pieces.has(ka)) return undefined;
				}
				
				return {
					directionString: getDirectionString(uvect),
					landingSquares: dests
				} as MoveVector;
			} else if (--n > 0) {
				const rot = 360/neighVectors.length;
				var found = false;
				var vvect;
				for (var _vect: Pos in neighVectors) {
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
					var dests: cg.Key[] = [];
					
					var a = from;
					var ka = orig;
					var k = 0;
					
					while (k < n) {
						const b = add(a, vvect);
						const kb = pos2key(b);
						if (!pieces.has(kb)) return undefined;
						
						dests.push(kb);
						
						a = add(from, mult(++k, uvect));
						ka = pos2key(a);
						if (k < n - 1 && pieces.has(ka)) return undefined;
					}
					
					return {
						directionString: getDirectionString(vvect),
						landingSquares: dests
					} as MoveVector;
				}
			}
		}
	}
	
	return undefined;
};
