// Shared sizing and outline of the Pairing page's capability tiles.

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

/** The amber outline of a tile the page is waiting for. */
export const tileOutline = (awaited) => awaited
    ? { outline: `4px solid ${AWAITED_COLOR}`, outlineOffset: '-4px' }
    : undefined
