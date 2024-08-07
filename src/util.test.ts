import { describe, expect, it } from '@jest/globals';
import * as cg from './types.js';
import {
  computeSquareCenter,
  key2pos,
  adjacentKeys,
  calculateAreas,
  calculatePlayerEmptyAreas,
  calculatePieceGroup,
  calculateGoScores,
  calculateBackgammonScores,
} from './util.js';

describe('computeSquareCenter() test', () => {
  it('testing a1 square p1', () => {
    const key = 'a1';
    const orientation = 'p1';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: cg.BoardDimensions = { width: 8, height: 8 };

    const expected = [0.5, 7.5];
    const pos = computeSquareCenter(key, orientation, bounds, bd);
    expect(expected[0]).toEqual(pos[0]);
    expect(expected[1]).toEqual(pos[1]);
  });
});

describe('computeSquareCenter() test', () => {
  it('testing a1 square p2', () => {
    const key = 'a1';
    const orientation = 'p2';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: cg.BoardDimensions = { width: 8, height: 8 };

    const expected = [7.5, 0.5];
    const pos = computeSquareCenter(key, orientation, bounds, bd);
    expect(expected[0]).toEqual(pos[0]);
    expect(expected[1]).toEqual(pos[1]);
  });
});

describe('computeSquareCenter() test', () => {
  it('testing a1 square right', () => {
    const key = 'a1';
    const orientation = 'right';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: cg.BoardDimensions = { width: 8, height: 8 };

    const expected = [0.5, 0.5];
    const pos = computeSquareCenter(key, orientation, bounds, bd);
    expect(expected[0]).toEqual(pos[0]);
    expect(expected[1]).toEqual(pos[1]);
  });
});

describe('key2pos() test', () => {
  it('testing a1 gives [1, 1]', () => {
    const key = 'a1';
    const pos: cg.Pos = key2pos(key);
    const expected: cg.Pos = [1, 1];
    expect(expected[0]).toEqual(pos[0]);
    expect(expected[1]).toEqual(pos[1]);
  });
});

describe('key2pos() test', () => {
  it('testing a10 gives [1, 10]', () => {
    const key = 'a10';
    const pos: cg.Pos = key2pos(key);
    const expected: cg.Pos = [1, 10];
    expect(expected[0]).toEqual(pos[0]);
    expect(expected[1]).toEqual(pos[1]);
  });
});

describe('adjacentKeys() test', () => {
  it('testing e5 gives [e6, e4, f5, d5]', () => {
    const key = 'e5' as cg.Key;
    const bd = { height: 9, width: 9 };
    const adjacent = adjacentKeys(bd, key);
    const expected: cg.Key[] = ['e6', 'e4', 'f5', 'd5'];
    expect(expected[0]).toEqual(adjacent[0]);
    expect(expected[1]).toEqual(adjacent[1]);
    expect(expected[2]).toEqual(adjacent[2]);
    expect(expected[3]).toEqual(adjacent[3]);
  });
});

describe('adjacentKeys() test', () => {
  it('testing a1 gives [a2, b1]', () => {
    const key = 'a1' as cg.Key;
    const bd = { height: 9, width: 9 };
    const adjacent = adjacentKeys(bd, key);
    const expected: cg.Key[] = ['a2', 'b1'];
    expect(expected[0]).toEqual(adjacent[0]);
    expect(expected[1]).toEqual(adjacent[1]);
  });
});

describe('adjacentKeys() test', () => {
  it('testing i9 gives [i8, h9]', () => {
    const key = 'i9' as cg.Key;
    const bd = { height: 9, width: 9 };
    const adjacent = adjacentKeys(bd, key);
    const expected: cg.Key[] = ['i8', 'h9'];
    expect(expected[0]).toEqual(adjacent[0]);
    expect(expected[1]).toEqual(adjacent[1]);
  });
});

describe('calculateAreas() test', () => {
  it('testing empty grid one group', () => {
    const emptySquares = ['a1', 'a2', 'b1', 'b2'] as cg.Key[];
    const bd = { height: 3, width: 3 };
    const areas = calculateAreas(emptySquares, bd);
    const expected: cg.Key[][] = [['a1', 'a2', 'b1', 'b2']];
    expect(expected[0][0]).toEqual(areas[0][0]);
    expect(expected[0][1]).toEqual(areas[0][1]);
    expect(expected[0][2]).toEqual(areas[0][2]);
    expect(expected[0][3]).toEqual(areas[0][3]);
  });
});

describe('calculateAreas() test', () => {
  it('testing split grid many groups', () => {
    const emptySquares = ['a1', 'a3', 'b3', 'c1', 'c2'] as cg.Key[];
    const bd = { height: 3, width: 3 };
    const areas = calculateAreas(emptySquares, bd);
    const expected: cg.Key[][] = [['c1', 'c2'], ['a3', 'b3'], ['a1']];
    expect(expected[0][0]).toEqual(areas[0][0]);
    expect(expected[0][1]).toEqual(areas[0][1]);
    expect(expected[1][0]).toEqual(areas[1][0]);
    expect(expected[1][1]).toEqual(areas[1][1]);
    expect(expected[2][0]).toEqual(areas[2][0]);
  });
});

describe('calculatePlayeremptyAreas() test', () => {
  it('testing simple grid 1 group', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    //const p2Piece = {role:'s-piece',playerIndex: 'p2'} as cg.Piece
    pieces.set('a2', p1Piece);
    pieces.set('b2', p1Piece);
    pieces.set('b1', p1Piece);
    const bd = { height: 3, width: 3 };
    const areas = calculatePlayerEmptyAreas(pieces, bd, deadStones);
    const expected = new Map<cg.Key, cg.PlayerIndex>();
    expected.set('a3', 'p1');
    expected.set('b3', 'p1');
    expected.set('c3', 'p1');
    expected.set('c2', 'p1');
    expected.set('c1', 'p1');
    expected.set('a1', 'p1');
    expect(expected.size).toEqual(areas.size);
    expect(Array.from(expected.keys())[0]).toEqual(Array.from(areas.keys())[0]);
    expect(Array.from(expected.keys())[1]).toEqual(Array.from(areas.keys())[1]);
    expect(Array.from(expected.keys())[2]).toEqual(Array.from(areas.keys())[2]);
    expect(Array.from(expected.keys())[3]).toEqual(Array.from(areas.keys())[3]);
    expect(Array.from(expected.keys())[4]).toEqual(Array.from(areas.keys())[4]);
    expect(Array.from(expected.keys())[5]).toEqual(Array.from(areas.keys())[5]);
    expect(expected.get('a1')).toEqual('p1');
    expect(expected.get('a3')).toEqual('p1');
  });
});

describe('calculatePlayeremptyAreas() test', () => {
  it('testing complex grid all types', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('b3', p2Piece);
    pieces.set('c2', p2Piece);
    const bd = { height: 3, width: 3 };
    const areas = calculatePlayerEmptyAreas(pieces, bd, deadStones);
    const expected = new Map<cg.Key, cg.PlayerIndex>();
    expected.set('c3', 'p2');
    expected.set('a1', 'p1');
    expect(expected.size).toEqual(areas.size);
    expect(Array.from(expected.keys())[0]).toEqual(Array.from(areas.keys())[0]);
    expect(Array.from(expected.keys())[1]).toEqual(Array.from(areas.keys())[1]);
    expect(expected.get('a1')).toEqual('p1');
    expect(expected.get('c3')).toEqual('p2');
  });
});

describe('calculatePlayeremptyAreas() test', () => {
  it('testing complex grid with dead stones', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('b3', p2Piece);
    pieces.set('c2', p2Piece);
    deadStones.set('b3', p2Piece);
    deadStones.set('c2', p2Piece);
    const bd = { height: 3, width: 3 };
    const areas = calculatePlayerEmptyAreas(pieces, bd, deadStones);
    const expected = new Map<cg.Key, cg.PlayerIndex>();
    expected.set('a3', 'p1');
    expected.set('c3', 'p1');
    expected.set('c1', 'p1');
    expected.set('a1', 'p1');
    expect(expected.size).toEqual(areas.size);
    expect(Array.from(expected.keys())[0]).toEqual(Array.from(areas.keys())[0]);
    expect(Array.from(expected.keys())[1]).toEqual(Array.from(areas.keys())[1]);
    expect(Array.from(expected.keys())[2]).toEqual(Array.from(areas.keys())[2]);
    expect(Array.from(expected.keys())[3]).toEqual(Array.from(areas.keys())[3]);
    expect(expected.get('a1')).toEqual('p1');
    expect(expected.get('c3')).toEqual('p1');
    expect(expected.get('c1')).toEqual('p1');
    expect(expected.get('a3')).toEqual('p1');
  });
});

describe('calculatePlayeremptyAreas() test', () => {
  it('testing complex grid with dead stones 2', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('a3', p2Piece);
    pieces.set('b3', p2Piece);
    pieces.set('c2', p2Piece);
    deadStones.set('b3', p2Piece);
    deadStones.set('c2', p2Piece);
    const bd = { height: 3, width: 3 };
    const areas = calculatePlayerEmptyAreas(pieces, bd, deadStones);
    const expected = new Map<cg.Key, cg.PlayerIndex>();
    expected.set('a1', 'p1');
    expect(expected.size).toEqual(areas.size);
    expect(Array.from(expected.keys())[0]).toEqual(Array.from(areas.keys())[0]);
    expect(expected.get('a1')).toEqual('p1');
  });
});

describe('calculatePieceGroup() test', () => {
  it('testing piecegroups for go position', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('a3', p2Piece);
    pieces.set('b3', p2Piece);
    pieces.set('c2', p2Piece);
    const bd = { height: 3, width: 3 };
    const pieceGroup = calculatePieceGroup('a3', pieces, bd);
    const expected: cg.Key[] = ['a3', 'b3'];

    expect(expected.length).toEqual(pieceGroup.length);
    expect(Array.from(pieceGroup)[0]).toEqual(Array.from(expected)[0]);
    expect(Array.from(pieceGroup)[1]).toEqual(Array.from(expected)[1]);
  });
});

describe('calculatePieceGroup() test', () => {
  it('testing piecegroups for go position', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('c3', p1Piece);
    pieces.set('d4', p1Piece);
    pieces.set('a3', p2Piece);
    pieces.set('b3', p2Piece);
    pieces.set('b4', p2Piece);
    pieces.set('c1', p2Piece);
    pieces.set('c2', p2Piece);
    pieces.set('c4', p2Piece);
    pieces.set('d2', p2Piece);
    const bd = { height: 4, width: 4 };
    const pieceGroup = calculatePieceGroup('b3', pieces, bd);
    const expected: cg.Key[] = ['b3', 'b4', 'a3', 'c4'];

    expect(expected.length).toEqual(pieceGroup.length);
    expect(Array.from(pieceGroup)[0]).toEqual(Array.from(expected)[0]);
    expect(Array.from(pieceGroup)[1]).toEqual(Array.from(expected)[1]);
    expect(Array.from(pieceGroup)[2]).toEqual(Array.from(expected)[2]);
    expect(Array.from(pieceGroup)[3]).toEqual(Array.from(expected)[3]);
  });
});

describe('calculateGoScores() test', () => {
  it('testing go score from simple game with dead stones', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('a3', p2Piece);
    pieces.set('b3', p2Piece);
    pieces.set('c2', p2Piece);
    deadStones.set('b3', p2Piece);
    deadStones.set('c2', p2Piece);
    deadStones.set('a3', p2Piece);
    const bd = { height: 3, width: 3 };
    const goScores = calculateGoScores(deadStones, pieces, bd);
    const expected = { p1: 9, p2: 0 };

    expect(expected.p1).toEqual(goScores.p1);
    expect(expected.p2).toEqual(goScores.p2);
  });
});

describe('calculateGoScores() test', () => {
  it('testing go score from simple game with dead stones', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('a3', p2Piece);
    pieces.set('b3', p2Piece);
    pieces.set('c2', p2Piece);
    deadStones.set('b3', p2Piece);
    deadStones.set('c2', p2Piece);

    const bd = { height: 3, width: 3 };
    const goScores = calculateGoScores(deadStones, pieces, bd);
    const expected = { p1: 3, p2: 1 };

    expect(expected.p1).toEqual(goScores.p1);
    expect(expected.p2).toEqual(goScores.p2);
  });
});

describe('calculateGoScores() test', () => {
  it('testing go score from simple game with dead stones', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const deadStones = new Map<cg.Key, cg.Piece>();
    const p1Piece = { role: 's-piece', playerIndex: 'p1' } as cg.Piece;
    const p2Piece = { role: 's-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1Piece);
    pieces.set('b1', p1Piece);
    pieces.set('c3', p1Piece);
    pieces.set('d4', p1Piece);
    pieces.set('a3', p2Piece);
    pieces.set('b3', p2Piece);
    pieces.set('b4', p2Piece);
    pieces.set('c1', p2Piece);
    pieces.set('c2', p2Piece);
    pieces.set('c4', p2Piece);
    pieces.set('d2', p2Piece);
    deadStones.set('c3', p2Piece);
    deadStones.set('d4', p2Piece);
    deadStones.set('c4', p1Piece);

    const bd = { height: 4, width: 4 };
    const goScores = calculateGoScores(deadStones, pieces, bd);
    const expected = { p1: 3, p2: 12 };

    expect(expected.p1).toEqual(goScores.p1);
    expect(expected.p2).toEqual(goScores.p2);
  });
});

describe('calculateBackgammonScores() test', () => {
  it('testing backgammon score from starting fen', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const pocketPieces: cg.Piece[] = [];

    const p1_5Piece = { role: 's5-piece', playerIndex: 'p1' } as cg.Piece;
    const p1_2Piece = { role: 's2-piece', playerIndex: 'p1' } as cg.Piece;
    const p1_3Piece = { role: 's3-piece', playerIndex: 'p1' } as cg.Piece;
    const p2_5Piece = { role: 's5-piece', playerIndex: 'p2' } as cg.Piece;
    const p2_2Piece = { role: 's2-piece', playerIndex: 'p2' } as cg.Piece;
    const p2_3Piece = { role: 's3-piece', playerIndex: 'p2' } as cg.Piece;
    pieces.set('a2', p1_5Piece);
    pieces.set('l2', p1_2Piece);
    pieces.set('e1', p1_3Piece);
    pieces.set('g1', p1_5Piece);
    pieces.set('e2', p2_3Piece);
    pieces.set('g2', p2_5Piece);
    pieces.set('a1', p2_5Piece);
    pieces.set('l1', p2_2Piece);

    const bd = { height: 2, width: 12 };
    const backgammonScores = calculateBackgammonScores(pieces, pocketPieces, bd);
    const expected = { p1: 167, p2: 167 };

    expect(expected.p1).toEqual(backgammonScores.p1);
    expect(expected.p2).toEqual(backgammonScores.p2);
  });
});

describe('calculateBackgammonScores() test', () => {
  it('testing backgammon score with captured pieces', () => {
    const pieces = new Map<cg.Key, cg.Piece>();
    const pocketPieces: cg.Piece[] = [];

    const p1_5Piece = { role: 's5-piece', playerIndex: 'p1' } as cg.Piece;
    const p1_2Piece = { role: 's2-piece', playerIndex: 'p1' } as cg.Piece;
    const p1_3Piece = { role: 's3-piece', playerIndex: 'p1' } as cg.Piece;
    const p2_5Piece = { role: 's5-piece', playerIndex: 'p2' } as cg.Piece;
    const p2_2Piece = { role: 's2-piece', playerIndex: 'p2' } as cg.Piece;
    const p2_3Piece = { role: 's3-piece', playerIndex: 'p2' } as cg.Piece;
    //pieces.set('a2', p1_5Piece);
    pieces.set('l2', p1_2Piece);
    pieces.set('e1', p1_3Piece);
    pieces.set('g1', p1_5Piece);
    pieces.set('e2', p2_3Piece);
    pieces.set('g2', p2_5Piece);
    pieces.set('a1', p2_5Piece);
    //pieces.set('l1', p2_2Piece);

    pocketPieces.push(p2_2Piece);
    pocketPieces.push(p1_5Piece);

    const bd = { height: 2, width: 12 };
    const backgammonScores = calculateBackgammonScores(pieces, pocketPieces, bd);
    const expected = { p1: 227, p2: 169 };

    expect(expected.p1).toEqual(backgammonScores.p1);
    expect(expected.p2).toEqual(backgammonScores.p2);
  });
});
