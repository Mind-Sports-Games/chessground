import * as cg from '../src/types';
import { computeSquareCenter, key2pos, adjacentKeys, calculateAreas, calculatePlayerEmptyAreas } from '../src/util';
import { expect } from 'chai';

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
    expect(expected[0]).to.equal(pos[0]);
    expect(expected[1]).to.equal(pos[1]);
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
    expect(expected[0]).to.equal(pos[0]);
    expect(expected[1]).to.equal(pos[1]);
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
    expect(expected[0]).to.equal(pos[0]);
    expect(expected[1]).to.equal(pos[1]);
  });
});

describe('key2pos() test', () => {
  it('testing a1 gives [1, 1]', () => {
    const key = 'a1';
    const pos: cg.Pos = key2pos(key);
    const expected: cg.Pos = [1, 1];
    expect(expected[0]).to.equal(pos[0]);
    expect(expected[1]).to.equal(pos[1]);
  });
});

describe('key2pos() test', () => {
  it('testing a10 gives [1, 10]', () => {
    const key = 'a10';
    const pos: cg.Pos = key2pos(key);
    const expected: cg.Pos = [1, 10];
    expect(expected[0]).to.equal(pos[0]);
    expect(expected[1]).to.equal(pos[1]);
  });
});

describe('adjacentKeys() test', () => {
  it('testing e5 gives [e6, e4, f5, d5]', () => {
    const key = 'e5' as cg.Key;
    const bd = { height: 9, width: 9 };
    const adjacent = adjacentKeys(bd, key);
    const expected: cg.Key[] = ['e6', 'e4', 'f5', 'd5'];
    expect(expected[0]).to.equal(adjacent[0]);
    expect(expected[1]).to.equal(adjacent[1]);
    expect(expected[2]).to.equal(adjacent[2]);
    expect(expected[3]).to.equal(adjacent[3]);
  });
});

describe('adjacentKeys() test', () => {
  it('testing a1 gives [a2, b1]', () => {
    const key = 'a1' as cg.Key;
    const bd = { height: 9, width: 9 };
    const adjacent = adjacentKeys(bd, key);
    const expected: cg.Key[] = ['a2', 'b1'];
    expect(expected[0]).to.equal(adjacent[0]);
    expect(expected[1]).to.equal(adjacent[1]);
  });
});

describe('adjacentKeys() test', () => {
  it('testing i9 gives [i8, h9]', () => {
    const key = 'i9' as cg.Key;
    const bd = { height: 9, width: 9 };
    const adjacent = adjacentKeys(bd, key);
    const expected: cg.Key[] = ['i8', 'h9'];
    expect(expected[0]).to.equal(adjacent[0]);
    expect(expected[1]).to.equal(adjacent[1]);
  });
});

describe('calculateAreas() test', () => {
  it('testing empty grid one group', () => {
    const emptySquares = ['a1', 'a2', 'b1', 'b2'] as cg.Key[];
    const bd = { height: 3, width: 3 };
    const areas = calculateAreas(emptySquares, bd);
    const expected: cg.Key[][] = [['a1', 'a2', 'b1', 'b2']];
    expect(expected[0][0]).to.equal(areas[0][0]);
    expect(expected[0][1]).to.equal(areas[0][1]);
    expect(expected[0][2]).to.equal(areas[0][2]);
    expect(expected[0][3]).to.equal(areas[0][3]);
  });
});

describe('calculateAreas() test', () => {
  it('testing split grid many groups', () => {
    const emptySquares = ['a1', 'a3', 'b3', 'c1', 'c2'] as cg.Key[];
    const bd = { height: 3, width: 3 };
    const areas = calculateAreas(emptySquares, bd);
    const expected: cg.Key[][] = [['c1', 'c2'], ['a3', 'b3'], ['a1']];
    expect(expected[0][0]).to.equal(areas[0][0]);
    expect(expected[0][1]).to.equal(areas[0][1]);
    expect(expected[1][0]).to.equal(areas[1][0]);
    expect(expected[1][1]).to.equal(areas[1][1]);
    expect(expected[2][0]).to.equal(areas[2][0]);
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
    expect(expected.size).to.equal(areas.size);
    expect(Array.from(expected.keys())[0]).to.equal(Array.from(areas.keys())[0]);
    expect(Array.from(expected.keys())[1]).to.equal(Array.from(areas.keys())[1]);
    expect(Array.from(expected.keys())[2]).to.equal(Array.from(areas.keys())[2]);
    expect(Array.from(expected.keys())[3]).to.equal(Array.from(areas.keys())[3]);
    expect(Array.from(expected.keys())[4]).to.equal(Array.from(areas.keys())[4]);
    expect(Array.from(expected.keys())[5]).to.equal(Array.from(areas.keys())[5]);
    expect(expected.get('a1')).to.equal('p1');
    expect(expected.get('a3')).to.equal('p1');
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
    expect(expected.size).to.equal(areas.size);
    expect(Array.from(expected.keys())[0]).to.equal(Array.from(areas.keys())[0]);
    expect(Array.from(expected.keys())[1]).to.equal(Array.from(areas.keys())[1]);
    expect(expected.get('a1')).to.equal('p1');
    expect(expected.get('c3')).to.equal('p2');
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
    expect(expected.size).to.equal(areas.size);
    expect(Array.from(expected.keys())[0]).to.equal(Array.from(areas.keys())[0]);
    expect(Array.from(expected.keys())[1]).to.equal(Array.from(areas.keys())[1]);
    expect(Array.from(expected.keys())[2]).to.equal(Array.from(areas.keys())[2]);
    expect(Array.from(expected.keys())[3]).to.equal(Array.from(areas.keys())[3]);
    expect(expected.get('a1')).to.equal('p1');
    expect(expected.get('c3')).to.equal('p1');
    expect(expected.get('c1')).to.equal('p1');
    expect(expected.get('a3')).to.equal('p1');
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
    expect(expected.size).to.equal(areas.size);
    expect(Array.from(expected.keys())[0]).to.equal(Array.from(areas.keys())[0]);
    expect(expected.get('a1')).to.equal('p1');
  });
});
