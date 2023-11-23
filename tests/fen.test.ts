import { BoardDimensions } from '../src/types';
import { read, write } from '../src/fen';
import * as cg from '../src/types';
import { expect } from 'chai';

describe('fen.read() test', () => {
  it('testing flipello fen has 4 pieces', () => {
    const fenString =
      '8/8/8/3pP3/3Pp3/8/8/8[PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPpppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp] w - - 0 1';
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 4;
    const pieces = read(fenString, bd, 'flipello');
    expect(expected).to.equal(pieces.size);
  });
  it('testing flipello fen has two pieces each', () => {
    const fenString =
      '8/8/8/3pP3/3Pp3/8/8/8[PPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPpppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp] w - - 0 1';
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 2;
    const pieces = read(fenString, bd, 'flipello');
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(expected).to.equal(p1Pieces.length);
    expect(expected).to.equal(p2Pieces.length);
  });
});

describe('fen.read() test', () => {
  it('testing loa fen has 9 pieces', () => {
    const fenString = '5LL1/8/8/8/8/l6l/l6l/4LLL1 w - - 0 1';
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 9;
    const pieces = read(fenString, bd, 'linesOfAction');
    expect(expected).to.equal(pieces.size);
  });
  it('testing loa player peices from fen', () => {
    const fenString = '5LL1/8/8/8/8/l6l/l6l/4LLL1 w - - 0 1';
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expectedP1 = 5;
    const expectedP2 = 4;
    const pieces = read(fenString, bd, 'linesOfAction');
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(expectedP1).to.equal(p1Pieces.length);
    expect(expectedP2).to.equal(p2Pieces.length);
  });
});

describe('fen.read() test', () => {
  it('testing chess fen has 32 pieces', () => {
    const fenString = 'rnb1kbnr/pppp2pp/4p3/5p2/5PPq/P7/1PPPP2P/RNBQKBNR w KQkq - 1 4';
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 32;
    const pieces = read(fenString, bd, 'chess');
    expect(expected).to.equal(pieces.size);
  });
});

describe('fen.read() test', () => {
  it('testing shogi fen has 35 pieces', () => {
    const fenString = 'lns4l1/3kg4/1p1ppp1+B1/p1p4+S1/6p2/2P5+R/PP1PPPPPP/7R1/bNSGKGSNL[GNLPP] w - - 1 17';
    const bd: BoardDimensions = { width: 9, height: 9 };

    const expected = 35;
    const pieces = read(fenString, bd, 'shogi');
    expect(expected).to.equal(pieces.size);
  });
});

describe('fen.read() test', () => {
  it('testing mini shogi fen has 8 pieces', () => {
    const fenString = '4k/2+S+Sp/1+b3/3+p1/K3R[GRBg] b - - 5 15';
    const bd: BoardDimensions = { width: 5, height: 5 };

    const expected = 8;
    const pieces = read(fenString, bd, 'minishogi');
    expect(expected).to.equal(pieces.size);
  });
  it('testing mini shogi player pieces from fen', () => {
    const fenString = '4k/2+S+Sp/1+b3/3+p1/K3R[GRBg] b - - 5 15';
    const bd: BoardDimensions = { width: 5, height: 5 };

    const expectedP1 = 4;
    const expectedP2 = 4;
    const pieces = read(fenString, bd, 'minishogi');
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(expectedP1).to.equal(p1Pieces.length);
    expect(expectedP2).to.equal(p2Pieces.length);
  });
});

describe('fen.read() test', () => {
  it('testing xiangqi fen has 31 pieces', () => {
    const fenString = 'rnbak1bn1/4a3r/1c5c1/p1p3p1p/4P4/9/P1P3P1P/4C2C1/9/RNBAKABNR w - - 3 4';
    const bd: BoardDimensions = { width: 9, height: 10 };

    const expected = 31;
    const pieces = read(fenString, bd, 'xiangqi');
    expect(expected).to.equal(pieces.size);
  });
});

describe('fen.read() test', () => {
  it('testing mini xiangqi fen has 8 pieces', () => {
    const fenString = 'rcnk1Rr/pp4p/1p3nN/7/4P2/P1PP2P/RCNK3 b - - 16 15';
    const bd: BoardDimensions = { width: 7, height: 7 };

    const expected = 21;
    const pieces = read(fenString, bd, 'minixiangqi');
    expect(expected).to.equal(pieces.size);
  });
});

describe('fen.read() test', () => {
  it('testing oware fen has 12 pieces', () => {
    const fenString = '4S,4S,4S,4S,4S,4S/4S,4S,4S,4S,4S,4S 0 0 S 1';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expected = 12;
    const pieces = read(fenString, bd, 'oware');
    expect(expected).to.equal(pieces.size);
  });
  it('testing oware player pieces from fen', () => {
    const fenString = '4S,4S,4S,4S,4S,4S/4S,4S,4S,4S,4S,4S 0 0 S 1';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expectedP1 = 6;
    const expectedP2 = 6;
    const pieces = read(fenString, bd, 'oware');
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(expectedP1).to.equal(p1Pieces.length);
    expect(expectedP2).to.equal(p2Pieces.length);
  });
  it('testing oware player pieces from fen with gaps (two 1s)', () => {
    const fenString = '1,6S,1,1S,5S,7S/7S,1S,3S,8S,2S,8S 0 0 S 50';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expectedP1 = 6;
    const expectedP2 = 4;
    const pieces = read(fenString, bd, 'oware');
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(expectedP1).to.equal(p1Pieces.length);
    expect(expectedP2).to.equal(p2Pieces.length);
  });
  it('testing oware player pieces from fen with gaps (one 2)', () => {
    const fenString = '2,6S,1S,5S,7S/7S,1S,3S,8S,2S,8S 0 0 S 50';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expectedP1 = 6;
    const expectedP2 = 4;
    const pieces = read(fenString, bd, 'oware');
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(expectedP1).to.equal(p1Pieces.length);
    expect(expectedP2).to.equal(p2Pieces.length);
  });
});

describe('fen.write() test', () => {
  it('testing chess read fen and then write match', () => {
    const fenString = 'rnb1kbnr/pppp2pp/4p3/5p2/5PPq/P7/1PPPP2P/RNBQKBNR w KQkq - 1 4';
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = fenString.split(' ')[0];
    const pieces = read(fenString, bd, 'chess');
    const writtenFen = write(pieces, bd, 'chess');
    expect(expected).to.equal(writtenFen);
  });
});

describe('fen.write() test', () => {
  it('testing oware read initial fen and then write match', () => {
    const fenString = '4S,4S,4S,4S,4S,4S/4S,4S,4S,4S,4S,4S 0 0 S 1';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expected = fenString.split(' ')[0];
    const pieces = read(fenString, bd, 'oware');
    const writtenFen = write(pieces, bd, 'oware');
    expect(expected).to.equal(writtenFen);
  });
  it('testing oware read fen and then write match', () => {
    const fenString = '28S,2S,4S,1,4S,4S/27S,4S,4S,6S,1,4S 3 0 S 50';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expected = fenString.split(' ')[0];
    const pieces = read(fenString, bd, 'oware');
    const writtenFen = write(pieces, bd, 'oware');
    expect(expected).to.equal(writtenFen);
  });
  it('testing oware read fen and then write match for gaps', () => {
    const fenString = '1,6S,1,1S,5S,7S/7S,1S,3S,8S,2S,8S 0 0 S 50';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expected = fenString.split(' ')[0];
    const pieces = read(fenString, bd, 'oware');
    const writtenFen = write(pieces, bd, 'oware');
    expect(expected).to.equal(writtenFen);
  });
  it('testing oware read fen and then write match for gaps', () => {
    const fenString = '2,6S,1S,5S,7S/7S,1S,3S,8S,2S,8S 0 0 S 50';
    const bd: BoardDimensions = { width: 6, height: 2 };

    const expected = fenString.split(' ')[0];
    const pieces = read(fenString, bd, 'oware');
    const writtenFen = write(pieces, bd, 'oware');
    expect(expected).to.equal(writtenFen);
  });
});

describe('fen.write() test', () => {
  it('testing go read fen and then write match for gaps', () => {
    const fenString =
      '19/19/19/19/19/19/19/19/19/19/19/19/19/19/19/19/19/19/Ss2S2s11[SSSSSSSSSSssssssssss] b - 2 8 6 3';
    const bd: BoardDimensions = { width: 19, height: 19 };

    let expected = fenString.split(' ')[0];
    if (expected.indexOf('[') !== -1) expected = expected.slice(0, expected.indexOf('['));
    const pieces = read(fenString, bd, 'go19x19');
    const writtenFen = write(pieces, bd, 'go19x19');
    expect(expected).to.equal(writtenFen);
  });
  it('testing go read fen and then write match for gaps', () => {
    const fenString =
      '19/19/19/19/11Ss2S2s/19/19/19/19/14S3s/19/19/19/19/19/19/19/19/19[SSSSSSSSSSssssssssss] b - 3 9 6 4';
    const bd: BoardDimensions = { width: 19, height: 19 };

    let expected = fenString.split(' ')[0];
    if (expected.indexOf('[') !== -1) expected = expected.slice(0, expected.indexOf('['));
    const pieces = read(fenString, bd, 'go19x19');
    const writtenFen = write(pieces, bd, 'go19x19');
    expect(expected).to.equal(writtenFen);
  });
});
//todo Confirm structure of Backgammon fen...
describe('fen.read() test', () => {
  it('testing backgammon fen has 8 pieces', () => {
    const fenString = '5S,3,3s,1,5s,4,2S/5s,3,3S,1,5S,4,2s[] w - - 1';
    const bd: BoardDimensions = { width: 12, height: 2 };

    const expected = 8;
    const pieces = read(fenString, bd, 'backgammon');
    expect(expected).to.equal(pieces.size);
    const p1Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p1');
    const p2Pieces = [...pieces.values()].filter((item: cg.Piece) => item.playerIndex === 'p2');
    expect(4).to.equal(p1Pieces.length);
    expect(4).to.equal(p2Pieces.length);
  });
});
describe('fen.write() test', () => {
  it('testing backgammon read initial fen and then write match', () => {
    const fenString = '5S,3,3s,1,5s,4,2S/5s,3,3S,1,5S,4,2s[] w - - 1';
    const bd: BoardDimensions = { width: 12, height: 2 };

    let expected = fenString.split(' ')[0];
    if (expected.indexOf('[') !== -1) expected = expected.slice(0, expected.indexOf('['));
    const pieces = read(fenString, bd, 'backgammon');
    const writtenFen = write(pieces, bd, 'backgammon');
    expect(expected).to.equal(writtenFen);
  });
});
