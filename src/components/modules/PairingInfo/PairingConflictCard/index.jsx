import React from 'react';
import styled from 'styled-components';
import { Button } from '../../../atoms/Buttons/Button';
import { LinkButton } from '../../../atoms/Buttons/LinkButton';
import { ConflictStepRows } from '../ConflictStepRows';

const AMBER = '#f5a623'

// the same panel as the helper's, so the two read as one family in the slot they share
const Panel = styled.aside`
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    background: rgba(32, 42, 51, 0.96);
    border-left: 3px solid ${AMBER};
    border-radius: 8px 0 0 8px;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.35);
    color: white;
    overflow: hidden;
`

const Header = styled.div`
    position: relative;
    padding: 1.5vh 1vw 0.5vh 1vw;
`

const Title = styled.h3`
    margin: 0;
    padding-right: 2.5vw;
    font-size: 2.2vh;
    line-height: 1.25;
`

const Queued = styled.div`
    display: inline-block;
    margin-top: 0.4vh;
    padding: 0.1vh 0.6vw;
    border-radius: 999px;
    background: rgba(245, 166, 35, 0.18);
    color: ${AMBER};
    font-size: 1.5vh;
`

const Close = styled.div`
    position: absolute;
    right: 0.8vw;
    top: 1.2vh;
    font-size: 2.2vh;
`

const Subline = styled.div`
    margin-top: 0.4vh;
    font-size: 1.7vh;
    color: #c9d1d8;
`

const Body = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0.8vh 1vw;
`

const Pinned = styled.div`
    display: flex;
    padding: 1vh 1vw 1.4vh 1vw;
    border-top: 1px solid #3c4a55;
    > button {
        flex: 1;
    }
`

/**
 * A device found by the search wants slots that already hold a different device: a non-modal card
 * in the panel beside the tiles, with one row per slot. Rendered exactly as the page service hands
 * it over - the service already holds it back while the panel is busy. Done applies the choices,
 * the close button keeps every current device.
 */
export const PairingConflictCard = ({ conflict }) => {
    if (!conflict)
        return null

    return (
        <Panel aria-label={conflict.title}>
            <Header>
                <Title>{conflict.title}</Title>
                <Close>
                    <LinkButton label='✕' ariaLabel='Close' plain color='white' logContext={{ button: 'conflict close' }} onClick={() => conflict.onDismiss()} />
                </Close>
                {conflict.queuedText ? <Queued>{conflict.queuedText}</Queued> : null}
                {conflict.subline?.full ? <Subline>{conflict.subline.full}</Subline> : null}
            </Header>

            <Body>
                <ConflictStepRows rows={conflict.rows} onChoice={conflict.onChoice} />
            </Body>

            <Pinned>
                <Button primary text='Done' height='5vh' margin='0' padding='0 1vw' logContext={{ button: 'conflict done' }} onClick={() => conflict.onDone()} />
            </Pinned>
        </Panel>
    )
}
