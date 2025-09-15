import { Key, NumberPair, Pieces, PiecesDiff, Pos, Variant } from '../../types';

import { getDirectionString } from './directions';
import type { MoveImpact, MoveVector } from './types';
import {
  add,
  div,
  areEqual,
  getNeighVectors,
  getNextCore,
  getPrevCore,
  includes,
  isCell,
  key2pos,
  mult,
  norm,
  pos2key,
  sub,
} from './util';

export const isInLineMove = (orig: Key, dest: Key): [NumberPair, number] | undefined => {
  const from = key2pos(orig);
  const to = key2pos(dest);
  const vect = sub(to, from);
  let n = norm(vect);

  if (n > 0) {
    let uvect = div(n, vect);
    const neighVectors = getNeighVectors();

    if (includes(neighVectors, uvect)) {
      return [uvect, n];
    }
  }

  return undefined;
};

// Computes the effect of a move on the board before it is made
export const computeMoveImpact = (variant: Variant, pieces: Pieces, orig: Key, dest: Key): MoveImpact | undefined => {
  if (pieces.has(orig)) {
    const from = key2pos(orig);
    const to = key2pos(dest);
    const vect = sub(to, from);
    let n = norm(vect);

    if (n > 0) {
      let uvect = div(n, vect);
      let ejection = pieces.has(dest);
      if (ejection) n++;

      const neighVectors = getNeighVectors();

      if (includes(neighVectors, uvect)) {
        // In-line move
        const diff: PiecesDiff = new Map();
        let dests = [];

        let a = from;
        let ka = orig;
        let pa = pieces.get(ka);
        let k = 0;
        diff.set(ka, undefined);

        while (k < n) {
          a = add(from, mult(++k, uvect));
          ka = pos2key(a);

          if (k < n - 1 && !pieces.has(ka)) {
            return undefined;
          }

          if (isCell(variant, a)) {
            diff.set(ka, pa);
            dests.push(ka);
          } else if (!ejection) {
            return undefined;
          }

          pa = pieces.get(ka);
        }

        return {
          diff: diff,
          capture: ejection,
          landingSquares: dests,
        } as MoveImpact;
      } else if (!ejection && --n > 0) {
        let found = false;
        let vvect: Pos = [0, 0];
        for (const _vect of neighVectors) {
          const _nvect = mult(n, _vect);
          if (pieces.get(pos2key(add(from, _nvect)))?.playerIndex === pieces.get(orig)?.playerIndex) {
            vvect = getNextCore(neighVectors, _vect);

            if (areEqual(add(_nvect, vvect), vect)) {
              uvect = _vect;
              found = true;
              break;
            } else {
              vvect = getPrevCore(neighVectors, _vect);

              if (areEqual(add(_nvect, vvect), vect)) {
                uvect = _vect;
                found = true;
                break;
              }
            }
          }
        }
        if (found) {
          // Broadside move
          const diff: PiecesDiff = new Map();
          let dests = [];

          let a = from;
          let ka = orig;
          let k = 0;
          while (k <= n) {
            if (!isCell(variant, a)) return undefined;

            const b = add(a, vvect);
            if (!isCell(variant, b)) return undefined;
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
            landingSquares: dests,
          } as MoveImpact;
        }
      }
    }
  }

  return undefined;
};

// Computes a move vector after the move has been made
export const computeMoveVectorPostMove = (pieces: Pieces, orig: Key, dest: Key): MoveVector | undefined => {
  if (!pieces.has(orig) && pieces.has(dest)) {
    const from = key2pos(orig);
    const to = key2pos(dest);
    const vect = sub(to, from);
    let n = norm(vect);

    if (n > 0) {
      var uvect = div(n, vect);
      const neighVectors = getNeighVectors();

      if (includes(neighVectors, uvect)) {
        // In-line move
        let dests: Key[] = [];

        let a = to;
        let ka = dest;
        let k = 0;

        while (k < n) {
          dests.push(ka);

          a = sub(to, mult(++k, uvect));
          ka = pos2key(a);

          if (k < n - 1 && !pieces.has(ka)) return undefined;
        }

        return {
          directionString: getDirectionString(uvect),
          landingSquares: dests,
        } as MoveVector;
      } else if (--n > 0) {
        let found = false;
        let vvect: Pos = [0, 0];
        for (var _vect of neighVectors) {
          const _nvect = mult(n, _vect);
          if (!pieces.has(pos2key(add(from, _nvect)))) {
            vvect = getNextCore(neighVectors, _vect);

            if (areEqual(add(_nvect, vvect), vect)) {
              uvect = _vect;
              found = true;
              break;
            } else {
              vvect = getPrevCore(neighVectors, _vect);

              if (areEqual(add(_nvect, vvect), vect)) {
                uvect = _vect;
                found = true;
                break;
              }
            }
          }
        }

        if (found) {
          // Broadside move
          let dests: Key[] = [];

          let a = from;
          let ka = orig;
          let k = 0;
          while (k <= n) {
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
            landingSquares: dests,
          } as MoveVector;
        }
      }
    }
  }

  return undefined;
};
