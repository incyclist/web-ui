import React from 'react';
import { cos, sin } from '../../../../utils';

const CENTER = 50;

/**
 * Road-sign style glyph of a junction option. Pure view: never renders an arrow for an angle that is not a number.
 *
 * - arrow:      a grey stem (the road we are on) and an arrow leaving it at `angle` degrees
 * - roundabout: a circular arrow
 * - degraded:   a dashed circle, used if the direction is not known
 */
export const ManeuverGlyph = ({ angle, kind, stem = true, size = '100%' }) => {

    if (kind === 'degraded' || (kind !== 'roundabout' && !Number.isFinite(angle))) {
        return (
            <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" data-glyph="degraded">
                <circle cx="50" cy="50" r="26" fill="none" stroke="#f7f5fa" strokeWidth="7" strokeDasharray="10 9" strokeLinecap="round" />
            </svg>
        );
    }

    if (kind === 'roundabout') {
        return (
            <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" data-glyph="roundabout">
                <polyline points="50,100 50,80" fill="none" stroke="#9b94a8" strokeWidth="7" strokeLinecap="round" />
                <path d="M 50 80 A 28 28 0 1 1 74 38" fill="none" stroke="#f7f5fa" strokeWidth="8" strokeLinecap="round" />
                <polygon points="86,34 66,24 66,46" fill="#f7f5fa" transform="rotate(25 74 38)" />
            </svg>
        );
    }

    // with a stem: the arrow leaves the end of the stem. Without a stem (compass): a centred arrow of fixed length
    const half = 28;
    const dx = sin(angle);
    const dy = -cos(angle);
    const base = stem ? { x: CENTER, y: 58 } : { x: CENTER - half * dx, y: CENTER - half * dy };
    const tipX = stem ? base.x + 38 * dx : CENTER + half * dx;
    const tipY = stem ? base.y + 38 * dy : CENTER + half * dy;

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true" data-glyph="arrow">
            {stem ? <polyline points={`${CENTER},100 ${base.x},${base.y}`} fill="none" stroke="#9b94a8" strokeWidth="7" strokeLinecap="round" /> : null}
            <polyline points={`${base.x},${base.y} ${tipX},${tipY}`} fill="none" stroke="#f7f5fa" strokeWidth="9" strokeLinecap="round" />
            <polygon points="0,-13 11,8 -11,8" fill="#f7f5fa" transform={`translate(${tipX} ${tipY}) rotate(${angle})`} />
        </svg>
    );
};
