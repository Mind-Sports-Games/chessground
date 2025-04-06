import {cancel} from '../../drag';
import {State} from '../../state';
import {distanceSq, samePiece} from '../../util';

import {add, sub, translateAbs} from './util';
import {Variant} from "../../types";

export const processDrag = (variant: Variant, s: State): void => {
	requestAnimationFrame(() => {
		const cur = s.draggable.current;
		if (!cur) return;
		// cancel animations while dragging
		if (s.animation.current?.plan.anims.has(cur.orig)) s.animation.current = undefined;
		// if moving piece is gone, cancel
		const origPiece = s.pieces.get(cur.orig);
		if (!origPiece || !samePiece(origPiece, cur.piece)) cancel(s);
		else {
			if (!cur.started && distanceSq(cur.epos, cur.rel) >= Math.pow(s.draggable.distance, 2)) cur.started = true;
			if (cur.started) {
				// support lazy elements
				if (typeof cur.element === 'function') {
					const found = cur.element();
					if (!found) return;
					found.cgDragging = true;
					found.classList.add('dragging');
					cur.element = found;
				}
				
				cur.pos = sub(cur.epos, cur.rel);
				
				// move piece
				const translation = s.posToTranslateAbsolute(s.dom.bounds(), s.dimensions, variant)(cur.origPos, s.orientation);
				translateAbs(cur.element, add(translation, cur.pos));
			}
		}
		s.processDrag(variant, s);
	});
};