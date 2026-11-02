import React from 'react';
import styled, { css } from 'styled-components';
import ClipLoader from 'react-spinners/ClipLoader';
import { KeyCap } from '../../../../atoms/KeyCap';
import { FreeRideOptionButton } from '../../../../molecules';

const u = (n) => `calc(var(--u, 10px) * ${n})`;

/**
 * Free ride option band: a chip with the distance to the junction and a row of option tiles at the bottom of the screen.
 * 
 * The scale unit `--u` comes from the size of the ride page (container query units), so that tiles keep their proportions
 * from 800x600 up to 4K. The ride page has to be a size container (see FreeRidePage).
 */
const Band = styled.div`
    --u: clamp(10px, calc(0.25rem + 1cqmin), 26px);
    position: absolute;
    left: 50%;
    bottom: ${u(0.6)};
    transform: translateX(-50%);
    /* without an explicit width an absolutely positioned box shrinks into the right half of the page, so max-width never applies */
    width: max-content;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${u(0.9)};
    z-index: 100;
    max-width: calc(100% - 2 * max(12px, ${u(1.2)}));
    pointer-events: none;

    ${(p) => p.$avoidSideViews && !p.$many && css`
        @media (min-width: 1280px) {
            max-width: calc(50cqw - 2 * max(6px, ${u(0.5)}));
        }
    `}
`;

const Tiles = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: ${u(0.8)};
    pointer-events: auto;
`;

const Chip = styled.div`
    display: inline-flex;
    align-items: center;
    gap: ${u(0.8)};
    padding: ${u(0.4)} ${u(1.4)};
    border-radius: 999px;
    border: ${(p) => (p.$near ? '2px solid #dd9933' : '1px solid rgba(255, 255, 255, 0.24)')};
    background: rgba(22, 15, 36, 0.86);
    backdrop-filter: blur(6px);
    color: #f7f5fa;
    font-size: max(12px, ${u(1.5)});
    font-weight: 650;
    white-space: nowrap;
    pointer-events: auto;
`;

const getSelected = (options) => options?.find((o) => o.selected);

export const getChipText = ({ options, optionsState, distance, hidden }) => {
    const count = options?.length ?? 0;

    if (optionsState === 'loading' && count === 0)
        return distance ? `Junction in ${distance} · loading roads…` : 'Finding the roads ahead…';
    if (optionsState === 'failed')
        return "Couldn't load the roads here";
    if (count === 0)
        return undefined;

    const base = count === 1 ? `Next road in ${distance}` : `Junction in ${distance}`;
    if (!hidden || count === 1)
        return distance ? base : undefined;

    const selected = getSelected(options);
    if (!selected)
        return distance ? base : undefined;

    const who = selected.selectedBy === 'user' ? '✓ NEXT' : 'AUTO';
    return `${base} · ${who} ${selected.maneuverText ?? ''}`.trim();
};

export const FreeRideOptionBand = ({
    options,
    optionsState,
    distance,
    isNearby,
    hidden,
    avoidSideViews,
    onOptionSelected,
    onMouseOver,
    onMouseLeave
}) => {

    const count = options?.length ?? 0;
    const many = count >= 5;
    const loading = optionsState === 'loading' && count === 0;
    const text = getChipText({ options, optionsState, distance, hidden });

    // no tiles while the roads are loading: placeholders would look like broken tiles
    const showTiles = count > 0 && !hidden;
    const single = count === 1;

    if (!text && !showTiles)
        return null;

    return (
        <Band
            $avoidSideViews={avoidSideViews}
            $many={many}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
            role={single ? undefined : 'radiogroup'}
            aria-label="Roads at the next junction"
        >
            {text ? (
                <Chip $near={isNearby} aria-live="polite">
                    {loading ? <ClipLoader color="#f7f5fa" loading={true} size={12} /> : null}
                    {hidden && count > 1 ? <KeyCap>0</KeyCap> : null}
                    {text}
                </Chip>
            ) : null}

            {showTiles ? (
                <Tiles>
                    {options.map((option, idx) => (
                        <FreeRideOptionButton
                            key={option.id}
                            id={idx < 9 ? `Option ${idx + 1}` : option.id}
                            pathInfo={option}
                            hotkey={idx < 9 ? `${idx + 1}` : undefined}
                            count={count}
                            compact={many}
                            single={single}
                            onClick={() => onOptionSelected?.(option.id, idx, 'click')}
                        />
                    ))}
                </Tiles>
            ) : null}
        </Band>
    );
};
