import { Mobility } from '../../premove';
import * as cg from '../../types';
import { pos2key } from './util';

// @VFR: TODO: update this, the code is just a wrong copy paste
export const marble = (pieces: cg.Pieces, playerIndex: cg.PlayerIndex): Mobility => {
  return (x1, y1 /*, x2, y2*/) => {
    const pos = pos2key([x1, y1 + (playerIndex === 'p1' ? 1 : -1)]) as cg.Key;
    if (pieces.has(pos) && pieces.get(pos)?.playerIndex === playerIndex) return false;
    return false;
  };
};
