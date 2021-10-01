import * as cg from './types';

export const mapToWhite: Record<cg.Orientation, cg.TransformToWhite> = {
  white: pos => pos,
  black: pos => [7 - pos[0], 7 - pos[1]],
  right: pos => [7 - pos[1], pos[0]],
  left: pos => [pos[1], 7 - pos[0]],
};

export const mapToWhiteInverse: Record<cg.Orientation, cg.TransformToWhite> = {
  white: pos => pos,
  black: pos => [7 - pos[0], 7 - pos[1]],
  right: pos => [pos[1], 7 - pos[0]],
  left: pos => [7 - pos[0], pos[1]],
};

export const translateBase: Record<cg.Orientation, cg.TranslateBase> = {
  white: (pos: cg.Pos,
          xScale: number,
          yScale: number,
          asWhite:Boolean,
          bt: cg.BoardDimensions
          ) => [
            (asWhite ? pos[0] - 1 : bt.width - pos[0]) * xScale,
            (asWhite ? bt.height - pos[1] : pos[1] - 1) * yScale
          ],
  black: (pos: cg.Pos,
          xScale: number,
          yScale: number,
          asWhite:Boolean,
          bt: cg.BoardDimensions
          ) => [
            (asWhite ? pos[0] - 1 : bt.width - pos[0]) * xScale,
            (asWhite ? bt.height - pos[1] : pos[1] - 1) * yScale
          ],
  right: (pos: cg.Pos,
          xScale: number,
          yScale: number,
          _,
          __
          ) => [pos[1] * xScale, pos[0] * yScale],
  left: (pos: cg.Pos,
         xScale: number,
         yScale: number,
         _,
         bt: cg.BoardDimensions
         ) => [(bt.width - pos[0]) * xScale, pos[1] * yScale],
};
