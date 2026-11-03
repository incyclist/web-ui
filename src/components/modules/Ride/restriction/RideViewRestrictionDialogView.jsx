import React, { useState } from 'react'
import styled from 'styled-components'
import { Button, ButtonBar, CheckBox, LinkButton } from '../../../atoms'
import { Dialog } from '../../../molecules/Dialog'

const Body = styled.div`
    box-sizing: border-box;
    height: calc(100% - 7.7vh);
    overflow-y: auto;
    padding: 1vh 1.5vw;
    text-align: left;
    font-size: 1.9vh;
    line-height: 2.8vh;
`

const Section = styled.div`
    margin-top: 1.5vh;
    padding-top: 1.5vh;
    border-top: 1px solid rgba(128,128,128,0.5);
`

const Heading = styled.div`
    font-weight: bold;
    margin-bottom: 0.5vh;
`

const Actions = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5vw;
    margin-top: 1vh;
    min-height: 4.4vh;
`

const Question = styled.span`
    font-weight: bold;
`

const Success = styled.div`
    margin-top: 1vh;
    color: #2e9e44;
    font-weight: bold;
`

const DeviceOption = ({ option, logContext, onDiscard }) => {
    const [confirming, setConfirming] = useState(false)
    const { discard } = option

    // The button asks once, then confirms: there is no separate "cancel" - Close, Esc or a click
    // outside the dialog leave the ride as it is.
    return <Section>
        {option.heading ? <Heading>{option.heading}</Heading> : null}
        <div>{option.text}</div>
        {discard ?
            <Actions>
                {confirming ? <Question>{discard.confirm.question}</Question> : null}
                <Button text={confirming ? discard.confirm.confirmLabel : discard.label} size='small' primary={confirming} margin='0'
                    logContext={logContext} onClick={confirming ? onDiscard : () => setConfirming(true)} />
            </Actions> : null}
    </Section>
}

const OwnKeyOption = ({ option, logContext, onAddKey }) => (
    <Section>
        <Heading>{option.heading}</Heading>
        <div>{option.text}</div>
        {option.pendingRestart ? <Success>{option.pendingRestart.text}</Success> : null}
        <Actions>
            {option.addKey ? <Button text={option.addKey.label} size='small' margin='0' logContext={logContext} onClick={onAddKey} /> : null}
            <LinkButton label={option.helpLink.label} url={option.helpLink.url} external logContext={logContext} />
        </Actions>
    </Section>
)

/**
 * Explains why Street View and Satellite View are not available in a simulated ride and how to
 * get them. Pure view: the content comes from the ride view restriction service.
 */
export const RideViewRestrictionDialogView = (props) => {
    const { title, body, options = [], reminder, onClose, onDiscard, onAddKey, onReminderChanged } = props
    const logContext = { dialog: title }

    return <Dialog id={title} title={title} width='55vw' height='72vh' level={2} onESC={onClose} onOutsideClicked={onClose}>
        <Body>
            <div>{body}</div>
            {options.map(option => option.id === 'device'
                ? <DeviceOption key={option.id} option={option} logContext={logContext} onDiscard={onDiscard} />
                : <OwnKeyOption key={option.id} option={option} logContext={logContext} onAddKey={onAddKey} />)}
        </Body>
        <ButtonBar justify='space-between'>
            <div style={{ marginLeft: '1.5vw' }}>
                {reminder ? <CheckBox label={reminder.label} value={reminder.checked} onValueChange={onReminderChanged} /> : null}
            </div>
            <Button text='Close' primary logContext={logContext} onClick={onClose} />
        </ButtonBar>
    </Dialog>
}
