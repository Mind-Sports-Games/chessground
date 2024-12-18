import type * as cg from '../../types';
import { knight, queen } from '../../premove';
import { distanceSq } from '../../util';

import { allPos, computeSquareCenter, getCoordinates, getSquareDimensions, key2posAlt, pos2key } from './util';

/*
  from a position in pixels, returns the key of the square
  by default squares positions in CG are computed like this :
      -----------------
     |_ _ _ _ _ _ _ _ _| 8
     |_ _ _ _ _ _ _ _ _| 7
     |_ _ _ _ _ _ _ _ _| 6
     |_ _ _ _ _ _ _ _ _| 5
     |_ _ _ _ _ _ _ _ _| 4
     |_ _ _ _ _ _ _ _ _| 3
     |_ _ _ _ _ _ _ _ _| 2
     |_ _ _ _ _ _ _ _ _| 1
      -----------------
      a b c d e f g h i

  But as an hexagonal grid, we have to take into account the margin between the border of the board
  ... and the limit of the area :
      ----------------------
     |                      |margin
     |      _ _ _ _ _       | 9
     |    /_ _ _ _ _ _\     | 8
     |   /_ _ _ _ _ _ _\    | 7
     |  /_ _ _ _ _ _ _ _\   | 6
     | /_ _ _ _ _ _ _ _ _\  | 5
     | \ _ _ _ _ _ _ _ _ /  | 4
     |  \ _ _ _ _ _ _ _ /   | 3
     |   \ _ _ _ _ _ _ /    | 2
     |    \ _ _ _ _ _ /     | 1
     |                      |margin
      ----------------------
              \ \ \ \ \ \ \ \ \
               a b c d e f g h i

    Used to know on which square the user clicked.
*/
export const getKeyAtDomPos = (
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  bounds: ClientRect,
): cg.Key | undefined => {
  const clickCenterX = pos[0] - bounds.left;
  const clickCenterY = pos[1] - bounds.top;
  const squareDimensions = getSquareDimensions(bounds);
  const verticalCenter = bounds.height / 2;
  const horizontalCenter = bounds.width / 2;

  if (
    clickCenterY > verticalCenter - 0.5 * squareDimensions.height &&
    clickCenterY < verticalCenter + 0.5 * squareDimensions.height
  ) {
    // line "e"
    const columnIndex = Math.floor((clickCenterX - horizontalCenter) / squareDimensions.width + 4.5);
    if (columnIndex < 0 || columnIndex > 8) return undefined;
    return getCoordinates(columnIndex, 4, orientation);
  }
  if (
    clickCenterY > verticalCenter + 0.5 * squareDimensions.height &&
    clickCenterY < verticalCenter + 1.5 * squareDimensions.height
  ) {
    // line "d"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 4 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 8) return undefined;
    return getCoordinates(columnIndex, 3, orientation);
  }
  if (
    clickCenterY > verticalCenter + 1.5 * squareDimensions.height &&
    clickCenterY < verticalCenter + 2.5 * squareDimensions.height
  ) {
    // line "c"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 3.5 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 6) return undefined;
    return getCoordinates(columnIndex, 2, orientation);
  }
  if (
    clickCenterY > verticalCenter + 2.5 * squareDimensions.height &&
    clickCenterY < verticalCenter + 3.5 * squareDimensions.height
  ) {
    // line "b"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 3 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 5) return undefined;
    return getCoordinates(columnIndex, 1, orientation);
  }
  if (
    clickCenterY > verticalCenter + 3.5 * squareDimensions.height &&
    clickCenterY < verticalCenter + 4.5 * squareDimensions.height
  ) {
    // line "a"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 2.5 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 4) return undefined;
    return getCoordinates(columnIndex, 0, orientation);
  }
  if (
    clickCenterY < verticalCenter - 0.5 * squareDimensions.height &&
    clickCenterY > verticalCenter - 1.5 * squareDimensions.height
  ) {
    // line "f"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 4 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 8) return undefined;
    return getCoordinates(columnIndex + 1, 5, orientation);
  }
  if (
    clickCenterY < verticalCenter - 1.5 * squareDimensions.height &&
    clickCenterY > verticalCenter - 2.5 * squareDimensions.height
  ) {
    // line "g"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 3.5 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 8) return undefined;
    return getCoordinates(columnIndex + 2, 6, orientation);
  }
  if (
    clickCenterY < verticalCenter - 2.5 * squareDimensions.height &&
    clickCenterY > verticalCenter - 3.5 * squareDimensions.height
  ) {
    // line "h"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 3 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 8) return undefined;
    return getCoordinates(columnIndex + 3, 7, orientation);
  }
  if (
    clickCenterY < verticalCenter - 3.5 * squareDimensions.height &&
    clickCenterY > verticalCenter - 4.5 * squareDimensions.height
  ) {
    // line "i"
    const columnIndex = Math.floor(
      (clickCenterX - (horizontalCenter - 2.5 * squareDimensions.width)) / squareDimensions.width,
    );
    if (columnIndex < 0 || columnIndex > 8) return undefined;
    return getCoordinates(columnIndex + 4, 8, orientation);
  }

  return undefined;
};

export const getSnappedKeyAtDomPos = (
  orig: cg.Key,
  pos: cg.NumberPair,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): cg.Key | undefined => {
  const origPos = key2posAlt(orig);
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
};
