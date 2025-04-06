import {Key, Piece, Pieces, Pos, Variant} from "../../types";
import {add, getMaxUsable, getNeighVectors, getNextCore, getPrevCore, isCell, isEjectable, isPushable, isUsable, key2pos, pos2key, sub} from "./util";

export const validDestinations = (variant: Variant, pieces: Pieces, orig: Key): Key[] => {
	const res: Key[] = [];
	
	const a = key2pos(orig);
	const ap = pieces.get(orig);
	
	if (ap) {
		const maxUsable = getMaxUsable(variant);
		
		if (!maxUsable || 0 < maxUsable) {
			const player = ap.playerIndex;// Somewhat bad, but I have nothing better
			const neighVectors = getNeighVectors();
			
			for (const vect of neighVectors) {
				let b = add(a, vect);
				let dest = pos2key(b);
				let bp = pieces.get(dest);
				
				let u = 1;
				let max = false;
				
				// In-line move
				{
					while (bp) {
						if (!isUsable(variant, bp, player)) break;
						
						u++;
						if (maxUsable && u > maxUsable) {
							max = true;
							break;
						}
						
						b = add(b, vect);
						dest = pos2key(b);
						bp = pieces.get(dest);
					}
					
					if (!max) {
						let p = 0;
						while (bp) {
							if (!isPushable(variant, bp, player)) break;
							
							if (++p >= u) {
								max = true;
								break;
							}
							
							b = add(b, vect);
							dest = pos2key(b);
							bp = pieces.get(dest);
						}
						
						if (!max && !bp) { // !bp <=> there is an immovable piece that blocks the line
							if (isCell(variant, b)) {
								res.push(dest);
							} else {
								b = sub(b, vect);
								dest = pos2key(b);
								bp = pieces.get(dest);
								
								if (isEjectable(variant, bp, player)) {
									res.push(dest);
								}
							}
						}
					}
				}
				
				// Broadside moves
				{
					const pvect = getPrevCore(neighVectors, vect);
					const nvect = getNextCore(neighVectors, vect);
					
					let pj = canJumpTo(variant, pieces, add(a, pvect));
					let nj = canJumpTo(variant, pieces, add(a, nvect));
					
					if (pj || nj) {
						b = add(a, vect);
						bp = pieces.get(pos2key(b));
						
						u = 1;
						
						while (bp) {
							// Remark: when u = 1, the only possible moves are already accounted for as in-line
							if (!isUsable(variant, bp, player) || maxUsable && ++u > maxUsable) break;
							
							if (pj) {
								const d = add(b, pvect);
								
								if (pj = canJumpTo(variant, pieces, d)) res.push(pos2key(d));
							}
							if (nj) {
								const d = add(b, nvect);
								
								if (nj = canJumpTo(variant, pieces, d)) res.push(pos2key(d));
							}
							
							if (!pj && !nj) break;
							
							b = add(b, vect);
							bp = pieces.get(pos2key(b));
						}
					}
				}
			}
		}
	}
	
	return res;
}

const canJumpTo = (variant: Variant, pieces: Pieces, a: Pos): boolean => {
	return !pieces.get(pos2key(a)) && isCell(variant, a);
}