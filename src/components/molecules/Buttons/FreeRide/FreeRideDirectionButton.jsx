import React from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { ManeuverGlyph } from './ManeuverGlyph';

// custom buttons do not go through the Button atom, so they log the interaction themselves
const logger = new EventLogger('Incyclist');

const u = (n) => `calc(var(--u, 10px) * ${n})`;

const Btn = styled.button`
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: ${u(1)};
    box-sizing: border-box;
    width: 100%;
    min-width: ${u(15)};
    height: ${u(4.8)};
    padding: 0 ${u(1.4)} 0 ${u(1.6)};
    margin: 0;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: ${u(0.8)};
    background: rgba(22, 15, 36, 0.92);
    color: #f7f5fa;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        left: 0; top: 0; bottom: 0;
        width: ${u(0.45)};
        background: ${(p) => p.$color || 'transparent'};
    }
    &:hover { outline: 2px solid #dd9933; outline-offset: 0; }
    &:focus-visible { outline: 2px solid #fff; outline-offset: ${u(0.3)}; }
`;

const Ring = styled.div`
    flex: none;
    width: ${u(2.9)};
    height: ${u(2.9)};
    border-radius: 50%;
    border: 2px solid ${(p) => p.$color || '#fff'};
    box-sizing: border-box;
    padding: 2px;
`;

const Text = styled.div`
    min-width: 0;
    display: flex;
    flex-direction: column;
`;

const Compass = styled.span`
    font-size: max(12px, ${u(1.5)});
    font-weight: 700;
    line-height: 1.1;
    white-space: nowrap;
`;

const Road = styled.span`
    font-size: max(12px, ${u(1.15)});
    color: #d3cbe0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

/**
 * Start direction button of the start dialog (pure view).
 * `option`: start option of the free ride service (color, compass, heading, roadLabel)
 * The map is north-up, so the arrow is rotated by the absolute heading.
 */
export const FreeRideDirectionButton = ({ option, single = false, onClick }) => {
    if (!option) return null;

    // same event as the Button atom wrote before (button = text of the button, e.g. 'North'). Road names are not logged
    const handleClick = (event) => {
        logger.logEvent({ message: 'button clicked', button: option.text ?? option.compass, eventSource: 'user' });
        onClick?.(event);
    };

    const compass = option.compass ?? option.text;
    const road = option.roadLabel;
    const title = single ? 'Start' : compass;

    return (
        <Btn
            type="button"
            $color={option.color}
            title={road || undefined}
            aria-label={single ? `Start${road ? `: ${road}` : ''}` : `Start heading ${compass}${road ? `, ${road}` : ''}`}
            onClick={handleClick}
        >
            <Ring $color={option.color}>
                <ManeuverGlyph angle={option.heading} stem={false} />
            </Ring>
            <Text>
                <Compass>{single ? 'Start' : title}</Compass>
                {road ? <Road>{road}</Road> : null}
            </Text>
        </Btn>
    );
};

const Quiet = styled.button`
    min-width: ${u(7)};
    height: ${u(4.8)};
    padding: ${u(0.6)} ${u(1)};
    border: none;
    border-radius: ${u(0.8)};
    background: transparent;
    color: #d3cbe0;
    font-family: inherit;
    font-size: max(13px, ${u(1.35)});
    font-weight: 600;
    cursor: pointer;

    &:hover { color: #fff; background: rgba(255, 255, 255, 0.08); text-decoration: underline; }
    &:focus-visible { outline: 2px solid #fff; outline-offset: ${u(0.3)}; }
`;

/** Secondary action of the start dialog (e.g. Cancel): a quiet text button, clearly not one of the choices */
export const FreeRideDialogButton = ({ text, onClick }) => {
    const handleClick = (event) => {
        logger.logEvent({ message: 'button clicked', button: text, eventSource: 'user' });
        onClick?.(event);
    };
    return <Quiet type="button" onClick={handleClick}>{text}</Quiet>;
};
