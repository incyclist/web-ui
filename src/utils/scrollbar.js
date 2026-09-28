import { css } from 'styled-components'

/**
 * Shared vertical scrollbar styling.
 *
 * Two variants, chosen by where the user is most likely sitting rather than by component:
 * - `large` (default): pages, and dialogs used on the bike (in-ride settings, device pairing) -
 *   a big target for a mouse on a shaky surface
 * - `compact`: every other dialog, used at the PC
 *
 * The variant is carried by CSS variables (`scrollbarVars()`), not by a theme prop: several
 * components re-wrap their content in AppThemeProvider, which would replace a variant set by the
 * enclosing dialog. Variables are inherited from the nearest ancestor, so they cannot be lost that
 * way. Every variable has the `large` value as its fallback, so a scroll area outside a dialog
 * needs no setup.
 *
 * Only ::-webkit-scrollbar is used (Electron/Chromium). Since Chromium 121, setting
 * `scrollbar-width` or `scrollbar-color` on an element makes it ignore ::-webkit-scrollbar, so
 * those must not be set anywhere except in the @supports fallback below, which Chromium never
 * reaches.
 */

const VARIANTS = {
    large: {
        width: 'clamp(24px, 2vw, 40px)',
        radius: '10px',
        minThumb: 'max(48px, 6vh)',
        thumbBorder: '0 solid transparent',
        thumbBorderHover: '0 solid transparent',
        track: 'rgba(0,0,0,0.30)',
    },
    compact: {
        width: '14px',
        radius: '7px',
        minThumb: '32px',
        // the visible thumb is 6px wide (12px hit area minus a 3px transparent border each side),
        // growing to 8px on hover
        thumbBorder: '3px solid transparent',
        thumbBorderHover: '2px solid transparent',
        track: 'rgba(255,255,255,0.08)',
    },
}

const THUMB = '#8dc100'
const THUMB_HOVER = '#a9dc2e'
const THUMB_ACTIVE = '#dd9933'

/** CSS variables of a scrollbar variant; set on a container to change all scroll areas inside it */
export const scrollbarVars = (variant = 'large') => {
    const v = VARIANTS[variant] ?? VARIANTS.large
    return css`
        --sb-width: ${v.width};
        --sb-radius: ${v.radius};
        --sb-min-thumb: ${v.minThumb};
        --sb-thumb-border: ${v.thumbBorder};
        --sb-thumb-border-hover: ${v.thumbBorderHover};
        --sb-track: ${v.track};
    `
}

const L = VARIANTS.large

/** Styles a scroll area's vertical scrollbar. */
export const scrollbar = css`
    overflow-y: auto;
    scrollbar-gutter: stable;

    &::-webkit-scrollbar {
        width: var(--sb-width, ${L.width});
    }

    &::-webkit-scrollbar-button {
        display: none;
    }

    &::-webkit-scrollbar-track {
        background: var(--sb-track, ${L.track});
        border-radius: var(--sb-radius, ${L.radius});
    }

    &::-webkit-scrollbar-thumb {
        background: ${THUMB};
        background-clip: padding-box;
        border: var(--sb-thumb-border, ${L.thumbBorder});
        border-radius: var(--sb-radius, ${L.radius});
        min-height: var(--sb-min-thumb, ${L.minThumb});
    }

    &::-webkit-scrollbar-thumb:hover {
        background: ${THUMB_HOVER};
        background-clip: padding-box;
        border: var(--sb-thumb-border-hover, ${L.thumbBorderHover});
    }

    &::-webkit-scrollbar-thumb:active {
        background: ${THUMB_ACTIVE};
        background-clip: padding-box;
    }

    @supports not selector(::-webkit-scrollbar) {
        scrollbar-width: auto;
        scrollbar-color: ${THUMB} ${L.track};
    }
`
