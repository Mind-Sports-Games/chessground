import { describe, expect, it } from '@jest/globals';
import { getKeyAtDomPos, getSnappedKeyAtDomPos } from './board.js';
import { NumberPair, BoardDimensions } from './types.js';

describe('getSnappedKeyAtDomPos() test', () => {
  it('testing a8 squares p1', () => {
    const bpos: NumberPair = [0.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const snappedKey = getSnappedKeyAtDomPos('a8', bpos, orientation, bounds, bd);
    expect(expected).toEqual(snappedKey);
  });
});

describe('getSnappedKeyAtDomPos() test', () => {
  it('testing h1 squares p2', () => {
    const bpos: NumberPair = [0.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const snappedKey = getSnappedKeyAtDomPos('h1', bpos, orientation, bounds, bd);
    expect(expected).toEqual(snappedKey);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares p1', () => {
    const bpos: NumberPair = [0.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares p1', () => {
    const bpos: NumberPair = [0.5, 7.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares p1', () => {
    const bpos: NumberPair = [7.5, 7.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares p1', () => {
    const bpos: NumberPair = [7.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares p2', () => {
    const bpos: NumberPair = [0.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares p2', () => {
    const bpos: NumberPair = [0.5, 7.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares p2', () => {
    const bpos: NumberPair = [7.5, 7.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares p2', () => {
    const bpos: NumberPair = [7.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares right', () => {
    const bpos: NumberPair = [0.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares right', () => {
    const bpos: NumberPair = [0.5, 7.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares right', () => {
    const bpos: NumberPair = [7.5, 7.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares right', () => {
    const bpos: NumberPair = [7.5, 0.5];
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
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).toEqual(key);
  });
});

describe('getKeyAtDomPos() backgammon test', () => {
  it('testing clicking left border from p1 view', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = undefined;
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking right border from p1 view', () => {
    const bpos: NumberPair = [14.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = undefined;
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking top border from p1 view', () => {
    const bpos: NumberPair = [0.5, 0.01];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = undefined;
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking bar from p1 view', () => {
    const bpos: NumberPair = [7.5, 1];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = undefined;
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking top left square from p1 view', () => {
    const bpos: NumberPair = [2.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = 'b2';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking bottom left square from p1 view', () => {
    const bpos: NumberPair = [4.5, 1.5];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = 'd1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking top right square from p1 view', () => {
    const bpos: NumberPair = [12.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = 'k2';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking bottom right square from p1 view', () => {
    const bpos: NumberPair = [9.5, 1.5];
    const orientation = 'p1';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
  it('testing clicking top right square from p1 view', () => {
    const bpos: NumberPair = [12.5, 0.5];
    const orientation = 'p1vflip';
    const bounds = {
      height: 15 / 6.5,
      width: 15,
      x: 0,
      y: 0,
      bottom: 15 / 6.5,
      left: 0,
      right: 15,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = 'k1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd, 'backgammon');
    expect(expected).toEqual(key);
  });
});
