import * as cg from '../../types';
import * as T from '../../transformations';
import { knight, queen } from '../../premove';
import { distanceSq } from '../../util';

import { allPos, computeSquareCenter, key2pos, pos2key } from './util';

export const getKeyAtDomPos = (
    pos: cg.NumberPair,
    orientation: cg.Orientation,
    bounds: ClientRect,
    bd: cg.BoardDimensions
  ): cg.Key | undefined => {
  let file = Math.ceil(bd.width * ((pos[0] - bounds.left) / bounds.width));
  const rank = Math.ceil(bd.height - bd.height * ((pos[1] - bounds.top) / bounds.height));

  if (rank === undefined || file === undefined) return undefined;
  pos = [file, rank];
  pos = T.mapToP1[orientation](pos, bd);
  return pos[0] > 0 && pos[0] < bd.width + 1 && pos[1] > 0 && pos[1] < bd.height + 1 ? pos2key(pos) : undefined;
}

export const getSnappedKeyAtDomPos = (
  orig: cg.Key,
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): cg.Key | undefined => {
  const origPos = key2pos(orig);
  const validSnapPos = allPos(bd).filter(pos2 => {
    return queen(origPos[0], origPos[1], pos2[0], pos2[1]) || knight(origPos[0], origPos[1], pos2[0], pos2[1]);
  });
  const validSnapCenters = validSnapPos.map(pos2 => computeSquareCenter(pos2key(pos2), orientation, bounds, bd));
  const validSnapDistances = validSnapCenters.map(pos2 => distanceSq(pos, pos2));
  const [, closestSnapIndex] = validSnapDistances.reduce(
    (a, b, index) => (a[0] < b ? a : [b, index]),
    [validSnapDistances[0], 0],
  );
  return pos2key(validSnapPos[closestSnapIndex]);
}
