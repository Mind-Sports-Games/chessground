import * as cg from './types';

export const mapToP1: Record<cg.Orientation, cg.TransformToP1> = {
  p1: (pos: cg.Pos, _: cg.BoardDimensions) => pos,
  p2: (pos: cg.Pos, bt: cg.BoardDimensions) => [bt.width + 1 - pos[0], bt.height + 1 - pos[1]],
  right: (pos: cg.Pos, bt: cg.BoardDimensions) => [bt.height + 1 - pos[1], pos[0]],
  left: (pos: cg.Pos, bt: cg.BoardDimensions) => [pos[1], bt.width + 1 - pos[0]],
  p1vflip: (pos: cg.Pos, bt: cg.BoardDimensions) => [pos[0], bt.height + 1 - pos[1]],
};

export const mapToP1Inverse: Record<cg.Orientation, cg.TransformToP1> = {
  p1: (pos: cg.Pos, _: cg.BoardDimensions) => pos,
  p2: (pos: cg.Pos, bt: cg.BoardDimensions) => [bt.width + 1 - pos[0], bt.height + 1 - pos[1]],
  right: (pos: cg.Pos, bt: cg.BoardDimensions) => [pos[1], bt.width + 1 - pos[0]],
  left: (pos: cg.Pos, bt: cg.BoardDimensions) => [bt.width + 1 - pos[0], pos[1]],
  p1vflip: (pos: cg.Pos, bt: cg.BoardDimensions) => [pos[0], bt.height + 1 - pos[1]],
};

export const translateBase: Record<cg.Orientation, cg.TranslateBase> = {
  p1: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
    (pos[0] - 1) * xScale,
    (bt.height - pos[1]) * yScale,
  ],
  p2: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
    (bt.width - pos[0]) * xScale,
    (pos[1] - 1) * yScale,
  ],
  right: (pos: cg.Pos, xScale: number, yScale: number, _) => [(pos[1] - 1) * xScale, (pos[0] - 1) * yScale],
  left: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
    (bt.width - pos[0]) * xScale,
    (pos[1] - 1) * yScale,
  ],
  p1vflip: (pos: cg.Pos, xScale: number, yScale: number, _) => [(pos[0] - 1) * xScale, (pos[1] - 1) * yScale],
};
