import * as cg from '../src/types';
import { computeSquareCenter, key2pos } from '../src/util';
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
