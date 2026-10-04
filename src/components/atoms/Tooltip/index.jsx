import React, { useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

// kept clear of the viewport edge even when the trigger sits right against it
const EDGE_MARGIN = 8;
// gap between the trigger and the bubble, matching the mockup
const TRIGGER_GAP = 8;

const TooltipWrapper = styled.span`
    position: relative;
    display: inline-flex;
`;

// Rendered through a portal into document.body (see Tooltip below) and positioned with `fixed`
// viewport coordinates, computed fresh on every show - this is deliberate, not just centering
// math: a page can clip an absolutely-positioned descendant with its own overflow:hidden (the
// Routes page's ContentArea does, to stop a drag-and-drop overlay from adding a scrollbar), which
// would clip a tooltip nested inside it regardless of how carefully its position is computed
// relative to its trigger. A portal escapes that ancestor entirely.
const TooltipBubble = styled.div`
    position: fixed;
    top: ${props => props.$top}px;
    left: ${props => props.$left}px;
    z-index: 1000;
    width: ${props => props.$width};
    padding: 8px 12px;
    background: rgba(12,16,22,0.94);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 4px;
    color: #ffffff;
    font-size: 14px;
    line-height: 19px;
    text-align: left;
    white-space: normal;
    pointer-events: none;
    opacity: ${props => props.$visible ? 1 : 0};
    visibility: ${props => props.$visible ? 'visible' : 'hidden'};
    transition: opacity 0.15s ease-in-out;
`;

/**
 * A small styled tooltip shown below whatever it wraps, on hover or keyboard focus - the app's
 * own look (dark bubble, subtle border) instead of the browser's native `title` tooltip.
 *
 * Rendered into `document.body` through a portal, positioned in fixed viewport coordinates: it
 * can never be clipped by an ancestor's `overflow:hidden` (several page layouts have one), and
 * stays on screen itself - centered under the trigger by default, but shifted left/right so
 * neither edge goes past the window (a trigger near the edge of a narrow window, e.g. the Free
 * Ride button hard against the nav sidebar at 800x600, would otherwise have its tooltip run off
 * the visible area).
 *
 * @param {string} text the tooltip's text
 * @param {string} [width='250px']
 * @param {React.ReactNode} children the trigger - typically a single button/icon
 */
export const Tooltip = ({ text, width = '250px', children, className }) => {
    const wrapperRef = useRef(null);
    const bubbleRef = useRef(null);
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState(null);

    useLayoutEffect(() => {
        if (!visible)
            return;

        const wrapperEl = wrapperRef.current;
        const bubbleEl = bubbleRef.current;
        if (!wrapperEl || !bubbleEl || typeof window === 'undefined')
            return;

        // measured independently of any previously-applied position - none of these depend on
        // where the bubble itself currently is, so this is exact rather than an incremental
        // correction
        const wrapperRect = wrapperEl.getBoundingClientRect();
        const bubbleWidth = bubbleEl.offsetWidth;

        const idealLeft = wrapperRect.left + wrapperRect.width/2 - bubbleWidth/2;
        const maxLeft = window.innerWidth - EDGE_MARGIN - bubbleWidth;
        const left = Math.max(EDGE_MARGIN, Math.min(idealLeft, maxLeft));
        const top = wrapperRect.bottom + TRIGGER_GAP;

        setPosition({ left, top });
    }, [visible, text, width]);

    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    return (
        <TooltipWrapper ref={wrapperRef} className={className}
            onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
            {children}
            {typeof document !== 'undefined' ? createPortal(
                <TooltipBubble ref={bubbleRef} className="tooltip-bubble" $width={width} $visible={visible}
                    $left={position?.left ?? 0} $top={position?.top ?? 0} role="tooltip">
                    {text}
                </TooltipBubble>,
                document.body
            ) : null}
        </TooltipWrapper>
    );
};
