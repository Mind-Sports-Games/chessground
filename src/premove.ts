import * as util from './util';
import * as cg from './types';

type Mobility = (x1: number, y1: number, x2: number, y2: number) => boolean;

function diff(a: number, b: number): number {
  return Math.abs(a - b);
}

function pawn(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) =>
    diff(x1, x2) < 2 &&
    (playerIndex === 'p1'
      ? // allow 2 squares from 1 and 8, for horde
        y2 === y1 + 1 || (y1 <= 2 && y2 === y1 + 2 && x1 === x2)
      : y2 === y1 - 1 || (y1 >= 7 && y2 === y1 - 2 && x1 === x2));
}

export const knight: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 && yd === 2) || (xd === 2 && yd === 1);
};

const bishop: Mobility = (x1, y1, x2, y2) => {
  return diff(x1, x2) === diff(y1, y2);
};

const rook: Mobility = (x1, y1, x2, y2) => {
  return x1 === x2 || y1 === y2;
};

export const queen: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
};

export const loachecker: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2);
};

function king(playerIndex: cg.PlayerIndex, rookFiles: number[], canCastle: boolean): Mobility {
  return (x1, y1, x2, y2) =>
    (diff(x1, x2) < 2 && diff(y1, y2) < 2) ||
    (canCastle &&
      y1 === y2 &&
      y1 === (playerIndex === 'p1' ? 1 : 8) &&
      ((x1 === 5 && ((util.containsX(rookFiles, 1) && x2 === 3) || (util.containsX(rookFiles, 8) && x2 === 7))) ||
        util.containsX(rookFiles, x2)));
}

function rookFilesOf(pieces: cg.Pieces, playerIndex: cg.PlayerIndex) {
  const backrank = playerIndex === 'p1' ? '1' : '8';
  const files = [];
  for (const [key, piece] of pieces) {
    if (key[1] === backrank && piece && piece.playerIndex === playerIndex && piece.role === 'r-piece') {
      files.push(util.key2pos(key)[0]);
    }
  }
  return files;
}

// king without castling
const kingNoCastling: Mobility = (x1, y1, x2, y2) => {
  return diff(x1, x2) < 2 && diff(y1, y2) < 2;
};

// 960 king (can only castle with king takes rook)
function king960(playerIndex: cg.PlayerIndex, rookFiles: number[], canCastle: boolean): Mobility {
  return (x1, y1, x2, y2) =>
    kingNoCastling(x1, y1, x2, y2) ||
    (canCastle && y1 === y2 && y1 === (playerIndex === 'p1' ? 1 : 8) && util.containsX(rookFiles, x2));
}

// capablanca king (different castling files from standard chess king)
function kingCapa(playerIndex: cg.PlayerIndex, rookFiles: number[], canCastle: boolean): Mobility {
  return (x1, y1, x2, y2) =>
    kingNoCastling(x1, y1, x2, y2) ||
    (canCastle &&
      y1 === y2 &&
      y1 === (playerIndex === 'p1' ? 1 : 8) &&
      x1 === 6 &&
      ((x2 === 9 && util.containsX(rookFiles, 10)) || (x2 === 3 && util.containsX(rookFiles, 1))));
}

// shako king (different castling files and ranks from standard chess king)
function kingShako(playerIndex: cg.PlayerIndex, rookFiles: number[], canCastle: boolean): Mobility {
  return (x1, y1, x2, y2) =>
    kingNoCastling(x1, y1, x2, y2) ||
    (canCastle &&
      y1 === y2 &&
      y1 === (playerIndex === 'p1' ? 2 : 9) &&
      x1 === 6 &&
      ((x2 === 8 && util.containsX(rookFiles, 9)) || (x2 === 4 && util.containsX(rookFiles, 2))));
}
function rookFilesOfShako(pieces: cg.Pieces, playerIndex: cg.PlayerIndex) {
  const backrank = playerIndex === 'p1' ? '2' : '9';
  const files = [];
  for (const [key, piece] of pieces) {
    if (key[1] === backrank && piece && piece.playerIndex === playerIndex && piece.role === 'r-piece') {
      files.push(util.key2pos(key)[0]);
    }
  }
  return files;
}

// wazir
const wazir: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 && yd === 0) || (xd === 0 && yd === 1);
};

// ferz, met
const ferz: Mobility = (x1, y1, x2, y2) => diff(x1, x2) === diff(y1, y2) && diff(x1, x2) === 1;

// shatranj elephant
const elephant: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return xd === yd && xd === 2;
};

// archbishop (knight + bishop)
const archbishop: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || knight(x1, y1, x2, y2);
};

// chancellor (knight + rook)
const chancellor: Mobility = (x1, y1, x2, y2) => {
  return rook(x1, y1, x2, y2) || knight(x1, y1, x2, y2);
};

// amazon (knight + queen)
const amazon: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || rook(x1, y1, x2, y2) || knight(x1, y1, x2, y2);
};

// shogun general (knight + king)
const centaur: Mobility = (x1, y1, x2, y2) => {
  return kingNoCastling(x1, y1, x2, y2) || knight(x1, y1, x2, y2);
};

// grand pawn (10x10 board, can move two squares on third row)
function grandPawn(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) =>
    diff(x1, x2) < 2 &&
    (playerIndex === 'p1'
      ? y2 === y1 + 1 || (y1 <= 3 && y2 === y1 + 2 && x1 === x2)
      : y2 === y1 - 1 || (y1 >= 8 && y2 === y1 - 2 && x1 === x2));
}

// shogi lance
function shogiLance(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => x2 === x1 && (playerIndex === 'p1' ? y2 > y1 : y2 < y1);
}

// shogi silver, makruk khon, sittuyin elephant
function shogiSilver(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) =>
    ferz(x1, y1, x2, y2) || (x1 === x2 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1));
}

// shogi gold, promoted pawn/knight/lance/silver
function shogiGold(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) =>
    wazir(x1, y1, x2, y2) || (diff(x1, x2) < 2 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1));
}

// shogi pawn
function shogiPawn(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => x2 === x1 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1);
}

// shogi knight
function shogiKnight(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => (x2 === x1 - 1 || x2 === x1 + 1) && (playerIndex === 'p1' ? y2 === y1 + 2 : y2 === y1 - 2);
}

// shogi promoted rook (dragon king)
const shogiDragon: Mobility = (x1, y1, x2, y2) => {
  return rook(x1, y1, x2, y2) || ferz(x1, y1, x2, y2);
};

// shogi promoted bishop (dragon horse)
const shogiHorse: Mobility = (x1, y1, x2, y2) => {
  return bishop(x1, y1, x2, y2) || wazir(x1, y1, x2, y2);
};

// Define xiangqi palace based on geometry/dimensions
// The palace is the 3x3 squares in the middle files at each side's end of the board
type Palace = cg.Pos[];

function palace(bd: cg.BoardDimensions, playerIndex: cg.PlayerIndex): Palace {
  const middleFile = Math.floor((bd.width + 1) / 2);
  const startingRank = playerIndex === 'p1' ? 1 : bd.height - 2;

  return [
    [middleFile - 1, startingRank + 2],
    [middleFile, startingRank + 2],
    [middleFile + 1, startingRank + 2],
    [middleFile - 1, startingRank + 1],
    [middleFile, startingRank + 1],
    [middleFile + 1, startingRank + 1],
    [middleFile - 1, startingRank],
    [middleFile, startingRank],
    [middleFile + 1, startingRank],
  ];
}

// xiangqi pawn
function xiangqiPawn(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) =>
    (x2 === x1 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1)) ||
    (y2 === y1 && diff(x1, x2) < 2 && (playerIndex === 'p1' ? y1 > 5 : y1 < 6));
}

// minixiangqi pawn
function minixiangqiPawn(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) =>
    (x2 === x1 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1)) || (y2 === y1 && diff(x1, x2) < 2);
}

// xiangqi elephant
function xiangqiElephant(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => elephant(x1, y1, x2, y2) && (playerIndex === 'p1' ? y2 < 6 : y2 > 5);
}

// xiangqi advisor
function xiangqiAdvisor(playerIndex: cg.PlayerIndex, bd: cg.BoardDimensions): Mobility {
  const myPalace = palace(bd, playerIndex);
  return (x1, y1, x2, y2) => ferz(x1, y1, x2, y2) && myPalace.some(point => point[0] === x2 && point[1] === y2);
}

// xiangqi general (king)
function xiangqiKing(playerIndex: cg.PlayerIndex, bd: cg.BoardDimensions): Mobility {
  const myPalace = palace(bd, playerIndex);
  return (x1, y1, x2, y2) => wazir(x1, y1, x2, y2) && myPalace.some(point => point[0] === x2 && point[1] === y2);
}

// shako elephant
const shakoElephant: Mobility = (x1, y1, x2, y2) => {
  return diff(x1, x2) === diff(y1, y2) && diff(x1, x2) < 3;
};

// janggi elephant
const janggiElephant: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 2 && yd === 3) || (xd === 3 && yd === 2);
};

// janggi pawn
function janggiPawn(playerIndex: cg.PlayerIndex, bd: cg.BoardDimensions): Mobility {
  const oppPalace = palace(bd, util.opposite(playerIndex));
  return (x1, y1, x2, y2) => {
    const palacePos = oppPalace.findIndex(point => point[0] === x1 && point[1] === y1);
    let additionalMobility: Mobility;
    switch (palacePos) {
      case 0:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 + 1 && playerIndex === 'p2' && y2 === y1 - 1;
        break;
      case 2:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 - 1 && playerIndex === 'p2' && y2 === y1 - 1;
        break;
      case 4:
        additionalMobility = (x1, y1, x2, y2) =>
          diff(x1, x2) === 1 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1);
        break;
      case 6:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 + 1 && playerIndex === 'p1' && y2 === y1 + 1;
        break;
      case 8:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 - 1 && playerIndex === 'p1' && y2 === y1 + 1;
        break;
      default:
        additionalMobility = () => false;
    }
    return (
      (x2 === x1 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1)) ||
      (y2 === y1 && diff(x1, x2) < 2) ||
      additionalMobility(x1, y1, x2, y2)
    );
  };
}

// janggi rook
function janggiRook(bd: cg.BoardDimensions): Mobility {
  const wPalace = palace(bd, 'p1');
  const bPalace = palace(bd, 'p2');
  return (x1, y1, x2, y2) => {
    let additionalMobility: Mobility;
    const wPalacePos = wPalace.findIndex(point => point[0] === x1 && point[1] === y1);
    const bPalacePos = bPalace.findIndex(point => point[0] === x1 && point[1] === y1);
    const palacePos = wPalacePos !== -1 ? wPalacePos : bPalacePos;
    const xd = diff(x1, x2);
    const yd = diff(y1, y2);
    switch (palacePos) {
      case 0:
        additionalMobility = (x1, y1, x2, y2) => xd === yd && x2 > x1 && x2 <= x1 + 2 && y2 < y1 && y2 >= y1 - 2;
        break;
      case 2:
        additionalMobility = (x1, y1, x2, y2) => xd === yd && x2 < x1 && x2 >= x1 - 2 && y2 < y1 && y2 >= y1 - 2;
        break;
      case 4:
        additionalMobility = ferz;
        break;
      case 6:
        additionalMobility = (x1, y1, x2, y2) => xd === yd && x2 > x1 && x2 <= x1 + 2 && y2 > y1 && y2 <= y1 + 2;
        break;
      case 8:
        additionalMobility = (x1, y1, x2, y2) => xd === yd && x2 < x1 && x2 >= x1 - 2 && y2 > y1 && y2 <= y1 + 2;
        break;
      default:
        additionalMobility = () => false;
    }
    return rook(x1, y1, x2, y2) || additionalMobility(x1, y1, x2, y2);
  };
}

// janggi general (king)
function janggiKing(playerIndex: cg.PlayerIndex, bd: cg.BoardDimensions): Mobility {
  const myPalace = palace(bd, playerIndex);
  return (x1, y1, x2, y2) => {
    const palacePos = myPalace.findIndex(point => point[0] === x1 && point[1] === y1);
    let additionalMobility: Mobility;
    switch (palacePos) {
      case 0:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 + 1 && y2 === y1 - 1;
        break;
      case 2:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 - 1 && y2 === y1 - 1;
        break;
      case 4:
        additionalMobility = ferz;
        break;
      case 6:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 + 1 && y2 === y1 + 1;
        break;
      case 8:
        additionalMobility = (x1, y1, x2, y2) => x2 === x1 - 1 && y2 === y1 + 1;
        break;
      default:
        additionalMobility = () => false;
    }
    return (
      (wazir(x1, y1, x2, y2) || additionalMobility(x1, y1, x2, y2)) &&
      myPalace.some(point => point[0] === x2 && point[1] === y2)
    );
  };
}

// musketeer leopard
const musketeerLeopard: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === 1 || xd === 2) && (yd === 1 || yd === 2);
};
// musketeer hawk
const musketeerHawk: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (
    (xd === 0 && (yd === 2 || yd === 3)) ||
    (yd === 0 && (xd === 2 || xd === 3)) ||
    (xd === yd && (xd === 2 || xd === 3))
  );
};
// musketeer elephant
const musketeerElephant: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return xd === 1 || yd === 1 || (xd === 2 && (yd === 0 || yd === 2)) || (xd === 0 && yd === 2);
};
// musketeer cannon
const musketeerCannon: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return xd < 3 && (yd < 2 || (yd === 2 && xd === 0));
};
// musketeer unicorn
const musketeerUnicorn: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return knight(x1, y1, x2, y2) || (xd === 1 && yd === 3) || (xd === 3 && yd === 1);
};
// musketeer dragon
const musketeerDragon: Mobility = (x1, y1, x2, y2) => {
  return knight(x1, y1, x2, y2) || queen(x1, y1, x2, y2);
};
// musketeer fortress
const musketeerFortress: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return (xd === yd && xd < 4) || (yd === 0 && xd === 2) || (yd === 2 && xd < 2);
};
// musketeer spider
const musketeerSpider: Mobility = (x1, y1, x2, y2) => {
  const xd = diff(x1, x2);
  const yd = diff(y1, y2);
  return xd < 3 && yd < 3 && !(xd === 1 && yd === 0) && !(xd === 0 && yd === 1);
};

// tori shogi goose (promoted swallow)
function toriGoose(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    return playerIndex === 'p1'
      ? (xd === 2 && y2 === y1 + 2) || (xd === 0 && y2 === y1 - 2)
      : (xd === 2 && y2 === y1 - 2) || (xd === 0 && y2 === y1 + 2);
  };
}

// tori shogi left quail
function toriLeftQuail(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    const yd = diff(y1, y2);
    return playerIndex === 'p1'
      ? (x2 === x1 && y2 > y1) || (xd === yd && x2 > x1 && y2 < y1) || (x2 === x1 - 1 && y2 === y1 - 1)
      : (x2 === x1 && y2 < y1) || (xd === yd && x2 < x1 && y2 > y1) || (x2 === x1 + 1 && y2 === y1 + 1);
  };
}

// tori shogi right quail
function toriRightQuail(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    const yd = diff(y1, y2);
    return playerIndex === 'p1'
      ? (x2 === x1 && y2 > y1) || (xd === yd && x2 < x1 && y2 < y1) || (x2 === x1 + 1 && y2 === y1 - 1)
      : (x2 === x1 && y2 < y1) || (xd === yd && x2 > x1 && y2 > y1) || (x2 === x1 - 1 && y2 === y1 + 1);
  };
}

// tori shogi pheasant
function toriPheasant(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    return playerIndex === 'p1'
      ? (x2 === x1 && y2 === y1 + 2) || (xd === 1 && y2 === y1 - 1)
      : (x2 === x1 && y2 === y1 - 2) || (xd === 1 && y2 === y1 + 1);
  };
}

// tori shogi crane
const toriCrane: Mobility = (x1, y1, x2, y2) => {
  return kingNoCastling(x1, y1, x2, y2) && y2 !== y1;
};

// tori shogi falcon
function toriFalcon(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => {
    return playerIndex === 'p1'
      ? kingNoCastling(x1, y1, x2, y2) && !(x2 === x1 && y2 === y1 - 1)
      : kingNoCastling(x1, y1, x2, y2) && !(x2 === x1 && y2 === y1 + 1);
  };
}

// tori shogi eagle (promoted falcon)
function toriEagle(playerIndex: cg.PlayerIndex): Mobility {
  return (x1, y1, x2, y2) => {
    const xd = diff(x1, x2);
    const yd = diff(y1, y2);
    return playerIndex === 'p1'
      ? kingNoCastling(x1, y1, x2, y2) || (xd === yd && (y2 > y1 || (y2 < y1 && yd <= 2))) || (x2 === x1 && y2 < y1)
      : kingNoCastling(x1, y1, x2, y2) || (xd === yd && (y2 < y1 || (y2 > y1 && yd <= 2))) || (x2 === x1 && y2 > y1);
  };
}

function emptysquares(pieces: cg.Pieces): Mobility {
  return (_, __, x2, y2) => {
    const pos = util.pos2key([x2, y2]) as cg.Key;
    return !pieces.has(pos);
  };
}

function amazonsQueen(pieces: cg.Pieces): Mobility {
  return (x1, y1, x2, y2) => {
    if (x2 > x1 && y1 === y2) {
      for (let i = 1; x1 + i < x2; i++) {
        const pos = util.pos2key([x1 + i, y2]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (x2 < x1 && y1 === y2) {
      for (let i = 1; x1 - i > x2; i++) {
        const pos = util.pos2key([x1 - i, y2]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (y2 > y1 && x1 === x2) {
      for (let i = 1; y1 + i < y2; i++) {
        const pos = util.pos2key([x2, y1 + i]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (y2 < y1 && x1 === x2) {
      for (let i = 1; y1 - i > y2; i++) {
        const pos = util.pos2key([x2, y1 - i]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (x2 > x1 && y2 > y1) {
      for (let i = 1; x1 + i < x2; i++) {
        const pos = util.pos2key([x1 + i, y1 + i]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (x2 < x1 && y2 < y1) {
      for (let i = 1; x1 - i > x2; i++) {
        const pos = util.pos2key([x1 - i, y1 - i]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (x2 < x1 && y2 > y1) {
      for (let i = 1; x1 - i > x2; i++) {
        const pos = util.pos2key([x1 - i, y1 + i]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    if (x2 > x1 && y2 < y1) {
      for (let i = 1; x1 + i < x2; i++) {
        const pos = util.pos2key([x1 + i, y1 - i]) as cg.Key;
        if (pieces.has(pos)) return false;
      }
    }
    return queen(x1, y1, x2, y2) && emptysquares(pieces)(x1, y1, x2, y2);
  };
}

const breakthroughPawn = (pieces: cg.Pieces, playerIndex: cg.PlayerIndex): Mobility => {
  return (x1, y1, x2, y2) => {
    if (!diff(x1, x2)) {
      // prevents a premove in front of us on a friendly pawn
      const pos = util.pos2key([x1, y1 + (playerIndex === 'p1' ? 1 : -1)]) as cg.Key;
      if (pieces.has(pos) && pieces.get(pos)?.playerIndex === playerIndex) return false;
    }
    return diff(x1, x2) < 2 && (playerIndex === 'p1' ? y2 === y1 + 1 : y2 === y1 - 1);
  };
};

const noMovement: Mobility = (_, __, ___, ____) => {
  return false;
};

export function premove(
  pieces: cg.Pieces,
  key: cg.Key,
  canCastle: boolean,
  bd: cg.BoardDimensions,
  variant: cg.Variant,
  chess960: boolean,
): cg.Key[] {
  const piece = pieces.get(key)!;
  const role = piece.role;
  const playerIndex = piece.playerIndex;
  if (!piece) return [];
  const pos = util.key2pos(key);
  let mobility: Mobility;

  switch (variant) {
    case 'xiangqi':
    case 'manchu':
      switch (role) {
        case 'p-piece':
          mobility = xiangqiPawn(playerIndex);
          break; // pawn
        case 'c-piece': // cannon
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // horse
        case 'b-piece':
          mobility = xiangqiElephant(playerIndex);
          break; // elephant
        case 'a-piece':
          mobility = xiangqiAdvisor(playerIndex, bd);
          break; // advisor
        case 'k-piece':
          mobility = xiangqiKing(playerIndex, bd);
          break; // king
        case 'm-piece':
          mobility = chancellor;
          break; // banner
      }
      break;

    case 'janggi':
      switch (piece.role) {
        case 'p-piece':
          mobility = janggiPawn(playerIndex, bd);
          break; // pawn
        case 'c-piece': // cannon
        case 'r-piece':
          mobility = janggiRook(bd);
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // horse
        case 'b-piece':
          mobility = janggiElephant;
          break; // elephant
        case 'a-piece': // advisor
        case 'k-piece':
          mobility = janggiKing(playerIndex, bd);
          break; // king
      }
      break;

    case 'minixiangqi':
      {
        switch (piece.role) {
          case 'p-piece':
            mobility = minixiangqiPawn(playerIndex);
            break; // pawn
          case 'c-piece': // cannon
          case 'r-piece':
            mobility = rook;
            break; // rook
          case 'n-piece':
            mobility = knight;
            break; // horse
          case 'k-piece':
            mobility = xiangqiKing(playerIndex, bd);
            break; // king
        }
      }
      break;

    case 'shogi':
    case 'minishogi':
    case 'gorogoro':
      switch (piece.role) {
        case 'p-piece':
          mobility = shogiPawn(playerIndex);
          break; // pawn
        case 'l-piece':
          mobility = shogiLance(playerIndex);
          break; // lance
        case 'n-piece':
          mobility = shogiKnight(playerIndex);
          break; // knight
        case 'k-piece':
          mobility = kingNoCastling;
          break; // king
        case 's-piece':
          mobility = shogiSilver(playerIndex);
          break; // silver
        case 'pp-piece': // tokin
        case 'pl-piece': // promoted lance
        case 'pn-piece': // promoted knight
        case 'ps-piece': // promoted silver
        case 'g-piece':
          mobility = shogiGold(playerIndex);
          break; // gold
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'pr-piece':
          mobility = shogiDragon;
          break; // dragon
        case 'pb-piece':
          mobility = shogiHorse;
          break; // horse
      }
      break;

    case 'kyotoshogi':
      switch (piece.role) {
        case 'l-piece':
          mobility = shogiLance(playerIndex);
          break; // kyoto - lance-tokin
        case 'pl-piece':
          mobility = shogiGold(playerIndex);
          break;
        case 's-piece':
          mobility = shogiSilver(playerIndex);
          break; // ginkaku - silver-bishop
        case 'ps-piece':
          mobility = bishop;
          break;
        case 'n-piece':
          mobility = shogiKnight(playerIndex);
          break; // kinkei - gold-knight
        case 'pn-piece':
          mobility = shogiGold(playerIndex);
          break;
        case 'p-piece':
          mobility = shogiPawn(playerIndex);
          break; // hifu - rook-pawn
        case 'pp-piece':
          mobility = rook;
          break;
        case 'k-piece':
          mobility = kingNoCastling;
          break; // king
      }
      break;

    case 'dobutsu':
      switch (piece.role) {
        case 'c-piece':
          mobility = shogiPawn(playerIndex);
          break; // chick
        case 'e-piece':
          mobility = ferz;
          break; // elephant
        case 'g-piece':
          mobility = wazir;
          break; // giraffe
        case 'l-piece':
          mobility = kingNoCastling;
          break; // lion
        case 'pc-piece':
          mobility = shogiGold(playerIndex);
          break; // hen
      }
      break;

    case 'torishogi':
      switch (role) {
        case 's-piece':
          mobility = shogiPawn(playerIndex);
          break; // swallow
        case 'ps-piece':
          mobility = toriGoose(playerIndex);
          break; // goose
        case 'l-piece':
          mobility = toriLeftQuail(playerIndex);
          break; // left quail
        case 'r-piece':
          mobility = toriRightQuail(playerIndex);
          break; // right quail
        case 'p-piece':
          mobility = toriPheasant(playerIndex);
          break; // pheasant
        case 'c-piece':
          mobility = toriCrane;
          break; // crane
        case 'f-piece':
          mobility = toriFalcon(playerIndex);
          break; // falcon
        case 'pf-piece':
          mobility = toriEagle(playerIndex);
          break; // eagle
        case 'k-piece':
          mobility = kingNoCastling;
          break; // phoenix
      }
      break;

    case 'makruk':
    case 'makpong':
    case 'sittuyin':
    case 'cambodian':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 's-piece':
          mobility = shogiSilver(playerIndex);
          break; // khon
        case 'f-piece': // Sittuyin ferz
        case 'm-piece':
          mobility = ferz;
          break; // met
        case 'k-piece':
          mobility = kingNoCastling;
          break; // king
      }
      break;

    case 'grand':
    case 'grandhouse':
      switch (role) {
        case 'p-piece':
          mobility = grandPawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'c-piece':
          mobility = chancellor;
          break; // chancellor
        case 'a-piece':
          mobility = archbishop;
          break; // archbishop
        case 'k-piece':
          mobility = kingNoCastling;
          break; // king
      }
      break;

    case 'amazons':
      switch (role) {
        case 'p-piece':
          mobility = noMovement;
          break; //arrows cant move
        case 'q-piece':
          mobility = amazonsQueen(pieces);
          break; // queen
      }
      break;

    case 'shako':
      switch (role) {
        case 'p-piece':
          mobility = grandPawn(playerIndex);
          break; // pawn
        case 'c-piece': // cannon
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'e-piece':
          mobility = shakoElephant;
          break; // elephant
        case 'k-piece':
          mobility = kingShako(playerIndex, rookFilesOfShako(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'shogun':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'pp-piece':
          mobility = kingNoCastling;
          break; // captain
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'pr-piece':
          mobility = chancellor;
          break; // mortar
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'pn-piece':
          mobility = centaur;
          break; // general
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'pb-piece':
          mobility = archbishop;
          break; // archbishop
        case 'f-piece':
          mobility = ferz;
          break; // duchess
        case 'pf-piece':
          mobility = queen;
          break; // queen
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'orda':
    case 'ordamirror':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'l-piece':
          mobility = chancellor;
          break; // lancer
        case 'h-piece':
          mobility = centaur;
          break; // kheshig
        case 'a-piece':
          mobility = archbishop;
          break; // archer
        case 'y-piece':
          mobility = shogiSilver(playerIndex);
          break; // yurt
        case 'f-piece':
          mobility = amazon;
          break; // falcon
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'synochess':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'c-piece': // cannon
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 's-piece':
          mobility = minixiangqiPawn(playerIndex);
          break; // soldier
        case 'e-piece':
          mobility = shakoElephant;
          break; // elephant
        case 'a-piece':
          mobility = kingNoCastling;
          break; // advisor
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle && playerIndex === 'p1');
          break; // king
      }
      break;

    case 'musketeer':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'l-piece':
          mobility = musketeerLeopard;
          break; // leopard
        case 'o-piece':
          mobility = musketeerCannon;
          break; // cannon
        case 'u-piece':
          mobility = musketeerUnicorn;
          break; // unicorn
        case 'd-piece':
          mobility = musketeerDragon;
          break; // dragon
        case 'c-piece':
          mobility = chancellor;
          break; // chancellor
        case 'a-piece':
          mobility = archbishop;
          break; // archbishop
        case 'e-piece':
          mobility = musketeerElephant;
          break; // elephant
        case 'h-piece':
          mobility = musketeerHawk;
          break; // hawk
        case 'f-piece':
          mobility = musketeerFortress;
          break; // fortress
        case 's-piece':
          mobility = musketeerSpider;
          break; // spider
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'hoppelpoppel':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece': // knight (takes like bishop)
        case 'b-piece':
          mobility = archbishop;
          break; // bishop (takes like knight)
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'shinobi':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'pl-piece':
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'ph-piece':
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'pm-piece':
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'pp-piece':
        case 'c-piece':
          mobility = kingNoCastling;
          break; // captain
        case 'l-piece':
          mobility = shogiLance(playerIndex);
          break; // lance
        case 'h-piece':
          mobility = shogiKnight(playerIndex);
          break; // horse
        case 'm-piece':
          mobility = ferz;
          break; // monk
        case 'd-piece':
          mobility = shogiDragon;
          break; // dragon
        case 'j-piece':
          mobility = archbishop;
          break; // ninja
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'empire':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 's-piece':
          mobility = minixiangqiPawn(playerIndex);
          break; // soldier
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'd-piece': // duke
        case 't-piece': // tower
        case 'c-piece': // cardinal
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'e-piece':
          mobility = amazon;
          break; // aegle
        case 'k-piece':
          mobility = king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'capablanca':
    case 'capahouse':
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'c-piece':
          mobility = chancellor;
          break; // chancellor
        case 'a-piece':
          mobility = archbishop;
          break; // archbishop
        case 'k-piece':
          mobility = chess960
            ? king960(playerIndex, rookFilesOf(pieces, playerIndex), canCastle)
            : kingCapa(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
      }
      break;

    case 'breakthroughtroyka':
    case 'minibreakthroughtroyka':
      mobility = breakthroughPawn(pieces, playerIndex);
      break;

    // Variants using standard pieces and additional fairy pieces like S-chess, Capablanca, etc.
    default:
      switch (role) {
        case 'p-piece':
          mobility = pawn(playerIndex);
          break; // pawn
        case 'r-piece':
          mobility = rook;
          break; // rook
        case 'n-piece':
          mobility = knight;
          break; // knight
        case 'b-piece':
          mobility = bishop;
          break; // bishop
        case 'q-piece':
          mobility = queen;
          break; // queen
        case 'e-piece': // S-chess elephant
        case 'c-piece':
          mobility = chancellor;
          break; // chancellor
        case 'h-piece': // S-chess hawk
        case 'a-piece':
          mobility = archbishop;
          break; // archbishop
        case 'k-piece':
          mobility = chess960
            ? king960(playerIndex, rookFilesOf(pieces, playerIndex), canCastle)
            : king(playerIndex, rookFilesOf(pieces, playerIndex), canCastle);
          break; // king
        case 'l-piece':
          mobility = loachecker;
          break; // loachecker
      }
  }

  return util
    .allKeys(bd)
    .map(util.key2pos)
    .filter(pos2 => {
      return (pos[0] !== pos2[0] || pos[1] !== pos2[1]) && mobility(pos[0], pos[1], pos2[0], pos2[1]);
    })
    .map(util.pos2key);
}
