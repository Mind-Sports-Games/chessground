import type { DrawShapePiece } from '../../draw';
import type { State } from '../../state';
import type { ShogiRole } from './types';

export function roleToSvgName(state: State, piece: DrawShapePiece): string {
    const reversePiece = !!state.orientation && state.orientation !== piece.playerIndex;
    let role = piece.role as ShogiRole;
    let svgName = '';

    switch (role) {
        //promoted
        case 'pp-piece':
            svgName = 'TO';
            break;
        case 'pl-piece':
            svgName = 'NY';
            break;
        case 'pn-piece':
            svgName = 'NK';
            break;
        case 'ps-piece':
            svgName = 'NG';
            break;
        case 'pr-piece':
            svgName = 'RY';
            break;
        case 'pb-piece':
            svgName = 'UM';
            break;
        //not promoted
        case 'p-piece':
            svgName = 'FU';
            break;
        case 'l-piece':
            svgName = 'KY';
            break;
        case 'n-piece':
            svgName = 'KE';
            break;
        case 's-piece':
            svgName = 'GI';
            break;
        case 'r-piece':
            svgName = 'HI';
            break;
        case 'b-piece':
            svgName = 'KA';
            break;
        case 'g-piece':
            svgName = 'KI';
            break;
        case 'k-piece':
            svgName = piece.playerIndex === 'p1' ? 'GY' : 'OU';
            break;
    }
    return `${Number(reversePiece).toString()}${svgName}` as string;
}