import React from 'react';
import styled, { css } from 'styled-components';
import { KeyCap } from '../../../atoms/KeyCap';
import { ManeuverGlyph } from './ManeuverGlyph';

/*
 * Option tile of a junction. All sizes are multiples of `--u`, which is defined by the parent (band or dialog)
 * from the size of the screen, so that the tile keeps its proportions from 800x600 up to 4K.
 */

const GREEN = '#8dc100';
const HOVER = '#dd9933';

const u = (n) => `calc(var(--u, 10px) * ${n})`;

const Tile = styled.button`
    position: relative;
    box-sizing: border-box;
    flex: 1 1 ${(p) => u(p.$compact ? 10.5 : 12.5)};
    width: ${(p) => u(p.$compact ? 12 : 16)};
    max-width: ${(p) => u(p.$compact ? 12 : 16)};
    padding: ${u(0.85)} ${u(0.65)} ${u(0.85)};
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: ${u(1.2)};
    background: rgba(22, 15, 36, 0.86);
    backdrop-filter: blur(6px);
    box-shadow: 0 ${u(0.3)} ${u(1)} rgba(0, 0, 0, 0.45);
    color: #f7f5fa;
    font-family: inherit;
    text-align: center;
    overflow: visible;
    transition: transform 140ms, box-shadow 140ms;
    cursor: ${(p) => (p.$single ? 'default' : 'pointer')};
    user-select: none;

    ${(p) => p.$degraded && css`border-style: dashed;`}

    ${(p) => p.$state === 'auto' && css`
        box-shadow: inset 0 0 0 2px ${GREEN}, 0 ${u(0.3)} ${u(1)} rgba(0, 0, 0, 0.45);
    `}
    ${(p) => p.$state === 'next' && css`
        background: rgba(40, 56, 14, 0.9);
        box-shadow: inset 0 0 0 3.5px ${GREEN}, 0 ${u(0.3)} ${u(1)} rgba(0, 0, 0, 0.45);
    `}

    &:hover {
        ${(p) => !p.$single && css`
            transform: translateY(${u(-0.15)});
            outline: 2px solid ${HOVER};
            outline-offset: 0;
        `}
    }
    &:focus-visible {
        outline: 2px solid #fff;
        outline-offset: ${u(0.3)};
    }
    &:active { transform: scale(0.96); }

    @media (prefers-reduced-motion: reduce) {
        transition: none;
        &:hover, &:active { transform: none; }
    }
`;

const Key = styled.div`
    position: absolute;
    top: ${u(0.6)};
    left: ${u(0.6)};
`;

const Glyph = styled.div`
    width: ${(p) => u(p.$compact ? 3 : 3.5)};
    height: ${(p) => u(p.$compact ? 3 : 3.5)};
`;

const Word = styled.div`
    font-size: max(12px, ${(p) => u(p.$compact ? 1.5 : 1.75)});
    font-weight: 700;
    line-height: 1.15;
`;

const Label = styled.div`
    font-size: max(12px, ${(p) => u(p.$compact ? 1.25 : 1.4)});
    line-height: 1.2;
    color: #d3cbe0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
`;

const Strip = styled.div`
    position: absolute;
    left: ${u(1)};
    right: ${u(1)};
    bottom: ${u(0.4)};
    height: ${u(0.45)};
    border-radius: 999px;
    background: ${(p) => p.$color || 'transparent'};
`;

const Tab = styled.div`
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 0 ${u(0.9)};
    border-radius: 999px;
    font-size: max(12px, ${u(1.1)});
    font-weight: 800;
    letter-spacing: 0.04em;
    white-space: nowrap;
    ${(p) => p.$filled
        ? css`background: ${GREEN}; color: #132000; border: 1px solid ${GREEN};`
        : css`background: rgba(22, 15, 36, 0.95); color: ${GREEN}; border: 1px solid ${GREEN};`}
`;

export const getOptionState = (pathInfo) => {
    if (!pathInfo?.selected) return undefined;
    return pathInfo.selectedBy === 'user' ? 'next' : 'auto';
};

export const getOptionAriaLabel = (pathInfo, hotkey, count) => {
    const state = getOptionState(pathInfo);
    const parts = [];
    if (hotkey && count) parts.push(`Road ${hotkey} of ${count}`);
    parts.push(pathInfo.maneuverText ?? 'Road', pathInfo.roadLabel);
    const text = parts.filter(Boolean).join(': ').replace(': ', ': ');
    const suffix = state === 'auto' ? ', taken automatically' : state === 'next' ? ', your choice' : '';
    const press = hotkey ? `. Press ${hotkey}.` : '';
    return `${text}${suffix}${press}`;
};

/**
 * One option at a junction (pure view).
 *
 * `pathInfo` is a FreeRideOption as provided by the free ride service:
 * direction, maneuverText, roadLabel, color, selected, selectedBy, degraded, maneuver
 * `single`: the only way on - no choice, so no key and not clickable
 */
export const FreeRideOptionButton = ({ pathInfo, hotkey, count, compact = false, single = false, onClick, id }) => {

    if (!pathInfo) return null;

    const state = getOptionState(pathInfo);
    const degraded = Boolean(pathInfo.degraded) || (pathInfo.maneuver !== 'roundabout' && !Number.isFinite(pathInfo.direction));
    const kind = degraded ? 'degraded' : pathInfo.maneuver === 'roundabout' ? 'roundabout' : 'arrow';
    const word = pathInfo.maneuverText ?? 'Road';
    const label = pathInfo.roadLabel ?? '';

    const handleClick = (event) => {
        if (!single && onClick) onClick(event);
    };

    const a11y = single
        ? { role: 'status', tabIndex: -1 }
        : { role: 'radio', 'aria-checked': Boolean(pathInfo.selected) };

    return (
        <Tile
            type="button"
            id={id}
            className="route-opt-button"
            $compact={compact}
            $single={single}
            $degraded={degraded}
            $state={state}
            aria-label={getOptionAriaLabel(pathInfo, single ? undefined : hotkey, count)}
            title={label || undefined}
            onClick={handleClick}
            {...a11y}
        >
            {state ? <Tab $filled={state === 'next'}>{state === 'next' ? '✓ NEXT' : 'AUTO'}</Tab> : null}
            {hotkey && !single ? <Key><KeyCap>{hotkey}</KeyCap></Key> : null}
            <Glyph $compact={compact}>
                <ManeuverGlyph angle={pathInfo.direction} kind={kind} />
            </Glyph>
            <Word $compact={compact}>{word}</Word>
            <Label $compact={compact}>{label}</Label>
            <Strip $color={pathInfo.color} />
        </Tile>
    );
};
