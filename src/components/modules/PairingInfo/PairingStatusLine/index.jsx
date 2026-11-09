import React from 'react';
import styled from 'styled-components';
import { LinkButton } from '../../../atoms/Buttons/LinkButton';

const Line = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    font-size: 2vh;
    color: white;
    text-align: center;
    margin-top: 1vh;
    padding: 0 1vw;
`

const Dot = styled.span`
    display: inline-block;
    flex: none;
    width: 1.2vh;
    height: 1.2vh;
    border-radius: 50%;
    margin-right: 0.8vw;
    background: ${props => props.$color};
`

const Link = styled.span`
    margin-left: 0.6vw;
`

const DOT_COLORS = { red: '#e74c3c', green: '#2ecc71', amber: '#f5a623' }

/**
 * The Pairing page's status line: a dot in the state's colour, the text, and the link, if the state
 * has one and there's something for it to open.
 */
export const PairingStatusLine = ({ status, onLinkClick }) => {
    if (!status)
        return null

    const showLink = Boolean(status.link) && onLinkClick !== undefined

    return (
        <Line role='status'>
            <Dot $color={DOT_COLORS[status.dot]} />
            <span>{status.text}</span>
            {showLink ?
                <Link>
                    <LinkButton label={status.link} onClick={onLinkClick} logContext={{ status: status.id }} />
                </Link>
            : null}
        </Line>
    )
}
