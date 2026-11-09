// Shared sizing and outline of the Pairing page's capability tiles.

import styled from 'styled-components'

export const AWAITED_COLOR = '#f5a623'

/**
 * A tile's size. Tiles have a fixed width; while the helper panel takes part of the page (`compact`),
 * they share the row's remaining width instead, up to that same width.
 */
export const tileSize = (compact) => compact
    ? `
    flex: 1 1 0;
    width: auto;
    min-width: 0;
    max-width: 20vw;
    height: 22vh;
    min-height: 22vh;
    max-height: 22vh;
    `
    : `
    width: 20vw;
    min-width: 20vw;
    max-width: 20vw;
    height: 25vh;
    min-height: 25vh;
    max-height: 25vh;
    `

/**
 * The white frame of a hovered tile. It is drawn on an overlay rather than as the tile's border, so
 * the tile's content box - and the footer strip positioned in it - keeps its size on hover. An
 * overlay (not an inset shadow) stays visible above the footer strip, and (unlike an outline) does
 * not clash with the awaited outline.
 */
export const hoverFrame = `
    &:hover::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        box-sizing: border-box;
        border: 5px solid white;
        pointer-events: none;
    }
`

/**
 * The amber frame of a tile the page is waiting for. Rendered as the tile's last child (after the
 * footer strip), not as the container's own `outline` - the footer strip has its own opaque
 * background and is itself an absolutely positioned child, so an outline on the container paints
 * underneath it and is covered along the bottom (and, while the footer wraps, the side) edges. The
 * same reasoning as `hoverFrame`, but as a real element (not `::after`) so the two can combine: the
 * hover frame still wins while both are shown, since it is injected after this one in paint order.
 */
export const AwaitedFrame = styled.div`
    position: absolute;
    inset: 0;
    box-sizing: border-box;
    border: 4px solid ${AWAITED_COLOR};
    pointer-events: none;
`
