import React from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { Radio } from '../../../atoms/Radio';
import { Button } from '../../../atoms/Buttons/Button';
import { LinkButton } from '../../../atoms/Buttons/LinkButton';

const AMBER = '#f5a623'

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

const Answer = styled.label`
    display: flex;
    align-items: center;
    gap: 0.6vw;
    min-height: 4.4vh;
    box-sizing: border-box;
    padding: 0.6vh 0.6vw;
    margin-bottom: 0.8vh;
    border: 1px solid ${props => props.$selected ? AMBER : '#4a5864'};
    border-radius: 6px;
    background: ${props => props.$selected ? 'rgba(245, 166, 35, 0.12)' : 'transparent'};
    font-size: 1.8vh;
    line-height: 1.25;
    cursor: pointer;
    input {
        flex: none;
        margin: 0;
        accent-color: ${AMBER};
        cursor: pointer;
    }
    &:hover {
        border-color: white;
    }
`

const Tip = styled.div`
    margin: -0.2vh 0 1vh 0;
    padding: 1vh 0.8vw;
    border-radius: 6px;
    background: rgba(0, 0, 0, 0.25);
    color: #e6ecf0;
    font-size: 1.7vh;
    line-height: 1.35;
`

const Resolved = styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2vh 1vw;
    text-align: center;
    color: #49c27a;
    font-size: 2.4vh;
    font-weight: bold;
`

const Pinned = styled.div`
    padding: 1vh 1vw 1.4vh 1vw;
    border-top: 1px solid #3c4a55;
`

const Footer = styled.div`
    margin-bottom: 0.8vh;
    color: #c9d1d8;
    font-size: 1.5vh;
`

const Note = styled.div`
    margin-bottom: 0.6vh;
    font-size: 1.6vh;
`

const ActionRow = styled.div`
    display: flex;
    justify-content: stretch;
    > button {
        flex: 1;
    }
`

const logger = new EventLogger('PairingHelperPanel')

/**
 * The "can't find your trainer" helper, as a non-modal panel beside the tiles: a header with the
 * title and close button, the answers with the picked answer's tip under it, and the footer line
 * and the tip's action at the bottom, so they never scroll away.
 */
export const PairingHelperPanel = ({ helper }) => {
    if (!helper || helper.phase === 'hidden')
        return null

    const resolved = helper.phase === 'resolved'
    const action = resolved ? undefined : helper.action

    const onAnswer = (reason) => {
        logger.logEvent({ message: 'button clicked', button: 'helper answer', reason: reason.id, eventSource: 'user' })
        reason.onSelect()
    }

    return (
        <Panel aria-label={helper.title}>
            <Header>
                <Title>{helper.title}</Title>
                <Close>
                    <LinkButton label='✕' ariaLabel='Close' plain color='white' logContext={{ button: 'helper close' }} onClick={() => helper.onDismiss()} />
                </Close>
                {!resolved && helper.subline ? <Subline>{helper.subline}</Subline> : null}
            </Header>

            {resolved ?
                <Resolved>{helper.resolvedText}</Resolved>
            :
                <Body role='radiogroup' aria-label={helper.title}>
                    {helper.reasons.map(reason => (
                        <React.Fragment key={reason.id}>
                            <Answer $selected={reason.selected}>
                                <Radio name='pairing-helper-answer' value={reason.id} checked={reason.selected} onChange={() => onAnswer(reason)} />
                                <span>{reason.label}</span>
                            </Answer>
                            {reason.selected && helper.tip ? <Tip>{helper.tip.text}</Tip> : null}
                        </React.Fragment>
                    ))}
                </Body>
            }

            {resolved ? null :
                <Pinned>
                    {helper.footer ? <Footer>{helper.footer}</Footer> : null}
                    {action?.note ? <Note>{action.note}</Note> : null}
                    {action ?
                        <ActionRow>
                            <Button primary text={action.label} height='5vh' margin='0' padding='0 1vw' onClick={() => action.onClick()} />
                        </ActionRow>
                    : null}
                </Pinned>
            }
        </Panel>
    )
}
