import { configure } from '../src/config';
import { State, defaults } from '../src/state';
import { premove } from '../src/premove';
import { expect } from 'chai';

describe('premove() test', () => {
  it('chess p1 king', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 8, height: 8 }, variant: 'chess', fen: '8/8/8/8/8/8/8/R3K2R w QK' });
    console.log(state.variant, state.pieces);
    const expected = ['a1', 'c1', 'd1', 'd2', 'e2', 'f2', 'f1', 'g1', 'h1'];
    const premoves = premove(
      state.pieces,
      'e1',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('chess p1 Rook', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 8, height: 8 }, variant: 'chess', fen: '8/8/8/8/8/8/8/R3K2R w QK' });

    console.log(state.variant, state.pieces);
    const expected = ['b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
    const premoves = premove(
      state.pieces,
      'a1',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('chess p1 Bishop', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 8, height: 8 }, variant: 'chess', fen: '8/8/8/8/8/8/8/2B1K3 w QK' });

    console.log(state.variant, state.pieces);
    const expected = ['b2', 'a3', 'd2', 'e3', 'f4', 'g5', 'h6'];
    const premoves = premove(
      state.pieces,
      'c1',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('chess p1 Pawn', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 8, height: 8 }, variant: 'chess', fen: '8/8/8/8/8/8/PPPPPPPP/2B1K3 w QK' });

    console.log(state.variant, state.pieces);
    const expected = ['a3', 'b3', 'b4', 'c3'];
    const premoves = premove(
      state.pieces,
      'b2',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('chess p1 Knight', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 8, height: 8 }, variant: 'chess', fen: '8/8/8/8/8/8/8/1N2K3 w QK' });

    console.log(state.variant, state.pieces);
    const expected = ['a3', 'c3', 'd2'];
    const premoves = premove(
      state.pieces,
      'b1',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('chess p1 Queen', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 8, height: 8 }, variant: 'chess', fen: '8/8/8/8/8/8/8/2BQK3 w QK' });

    console.log(state.variant, state.pieces);
    const expected = [
      'a1',
      'a4',
      'b1',
      'b3',
      'c1',
      'c2',
      'd2',
      'd3',
      'd4',
      'd5',
      'd6',
      'd7',
      'd8',
      'e1',
      'e2',
      'f1',
      'f3',
      'g1',
      'g4',
      'h1',
      'h5',
    ];
    const premoves = premove(
      state.pieces,
      'd1',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('janggi p1 king', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 9, height: 10 }, variant: 'janggi', fen: '9/9/9/9/9/9/9/9/4K4/9' });

    console.log(state.variant, state.pieces);
    const expected = ['d1', 'd2', 'd3', 'e1', 'e3', 'f1', 'f2', 'f3'];
    const premoves = premove(
      state.pieces,
      'e2',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('janggi p2 pawn', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 9, height: 10 }, variant: 'janggi', fen: '9/9/9/9/9/9/9/9/4p4/9' });

    console.log(state.variant, state.pieces);
    const expected = ['d1', 'd2', 'e1', 'f1', 'f2'];
    const premoves = premove(
      state.pieces,
      'e2',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('janggi p2 rook', () => {
    const state = defaults() as State;
    configure(state, { dimensions: { width: 9, height: 10 }, variant: 'janggi', fen: '9/9/9/9/9/9/9/5r3/9/9' });

    console.log(state.variant, state.pieces);
    const expected = [
      'a3',
      'b3',
      'c3',
      'd1',
      'd3',
      'e2',
      'e3',
      'f1',
      'f2',
      'f4',
      'f5',
      'f6',
      'f7',
      'f8',
      'f9',
      'f10',
      'g3',
      'h3',
      'i3',
    ];
    const premoves = premove(
      state.pieces,
      'f3',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});

describe('premove() test', () => {
  it('breakthroughTroyka pawns can premove forward diagonally and in front of them when there is no piece', () => {
    const state = defaults() as State;
    configure(state, {
      dimensions: { width: 8, height: 8 },
      variant: 'breakthroughtroyka',
      fen: 'pppppppp/pppppppp/8/8/8/8/PPPPPPPP/PPPPPPPP',
    });

    const expected = ['e6', 'f6', 'g6'];
    const premoves = premove(
      state.pieces,
      'f7',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });

  it('breakthroughTroyka pawns on the edge can not premove outside the board', () => {
    const state = defaults() as State;
    configure(state, {
      dimensions: { width: 8, height: 8 },
      variant: 'breakthroughtroyka',
      fen: 'pppppppp/pppppppp/8/8/8/8/PPPPPPPP/PPPPPPPP',
    });

    const expected = ['g6', 'h6'];
    const premoves = premove(
      state.pieces,
      'h7',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });

  it('breakthroughTroyka pawns can premove to opponent pawn in front of them', () => {
    const state = defaults() as State;
    configure(state, {
      dimensions: { width: 8, height: 8 },
      variant: 'breakthroughtroyka',
      fen: 'pppppppp/ppp1pppp/8/4p3/4P3/8/PPPP1PPP/PPPPPPPP',
    });

    const expected = ['d4', 'e4', 'f4'];
    const premoves = premove(
      state.pieces,
      'e5',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });

  it('breakthroughTroyka pawns can not premove to friendly pawn in front of them', () => {
    const state = defaults() as State;
    configure(state, {
      dimensions: { width: 8, height: 8 },
      variant: 'breakthroughtroyka',
      fen: 'pppppppp/ppp1p1pp/4p3/4p3/4P3/4P3/PPP2PPP/PPPPPPPP',
    });

    const expected = ['d5', 'f5'];
    const premoves = premove(
      state.pieces,
      'e6',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });

  it('breakthroughTroyka pawns can premove to friendly and opponent pawn in diagonal', () => {
    const state = defaults() as State;
    configure(state, {
      dimensions: { width: 8, height: 8 },
      variant: 'breakthroughtroyka',
      fen: 'pppppppp/ppp1p1pp/8/4p3/3pPP2/4P3/PPP3PP/PPPPPPPP',
    });

    const expected = ['d4', 'e4', 'f4'];
    const premoves = premove(
      state.pieces,
      'e5',
      state.premovable.castle,
      state.dimensions,
      state.variant,
      state.chess960
    );
    expect(premoves).to.have.members(expected);
  });
});
