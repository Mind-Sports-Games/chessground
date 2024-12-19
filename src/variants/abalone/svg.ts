import type * as cg from '../../types';

import { abaloneFiles, getSquareDimensions, isValidKey } from './util';

// pos2px is used to convert a position from the grid (board coordinates) to a position in pixels
export const pos2px = (pos: cg.Pos, bounds: ClientRect, _bd: cg.BoardDimensions): cg.NumberPair => {
  const height = bounds.height;
  const width = bounds.width;
  const squareDimensions = getSquareDimensions(bounds);

  const computedHeight = height * 0.5 + squareDimensions.height * (5 - pos[1]);
  let computedWidth = width * 0.5 + squareDimensions.width * (pos[0] - 5);

  if (!isValidKey((abaloneFiles[pos[0] - 1] + pos[1].toString()) as cg.Key)) {
    return [10, 10];
  }

  if (pos[1] > 5) {
    computedWidth =
      width * 0.4546 + squareDimensions.width * (pos[0] - 5) - 0.5 * (pos[1] - 5) * squareDimensions.width;
  } else if (pos[1] < 5) {
    computedWidth =
      width * 0.4546 - squareDimensions.width * (5 - pos[0]) + 0.5 * (5 - pos[1]) * squareDimensions.width;
  } else {
    if (pos[0] >= 5) {
      computedWidth = width * 0.4546 + squareDimensions.width * (pos[0] - 5);
    } else if (pos[0] < 5) {
      computedWidth = width * 0.4546 - squareDimensions.width * (5 - pos[0]);
    }
  }

  return [computedWidth + width / 22, computedHeight];
};
