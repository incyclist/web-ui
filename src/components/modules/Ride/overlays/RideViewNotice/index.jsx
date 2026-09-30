import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const DISMISS_AFTER = 8000;

const NoticeBox = styled.div`
    position: absolute;
    top: 11vh;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    display: flex;
    align-items: center;
    gap: 0.8vw;
    padding: 0.8vh 1.2vw;
    border-radius: 4px;
    background: rgba(0,0,0,0.75);
    color: white;
    font-size: 1.6vh;
    white-space: nowrap;
`;

const CloseButton = styled.span`
    cursor: pointer;
    opacity: 0.7;
    &:hover { opacity: 1; }
`;

/**
 * One-line, self-dismissing in-ride notice. `notice` is a one-shot prop - the service sets it
 * once (`rideViewNotice` after a Street View start fallback, INC-42 `ux.md` §7.3; `svCoverageNotice`
 * on every no-imagery answer) and clears it on the next read, so its presence (never any raw
 * cause/status) is captured into local state here to survive that prop going back to undefined.
 */
export const RideViewNotice = ({notice, message}) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!notice)
            return

        setVisible(true)
        const to = setTimeout(() => setVisible(false), DISMISS_AFTER)
        return () => clearTimeout(to)
    }, [notice])

    if (!visible)
        return null

    return (
        <NoticeBox>
            <span>{message}</span>
            <CloseButton onClick={() => setVisible(false)}>✕</CloseButton>
        </NoticeBox>
    )
}
