import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import { ProgressBar } from '../../../atoms'
import * as copy from './copy'
import { getRemaining, groupCode, logError } from './utils'

// Fills the body of the message box (which has no background of its own), so the settings page behind the dialog
// cannot show through, and centers the content vertically so a short phase is not stuck at the top.
const Body = styled.div`
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: ${props => props.$centered ? 'center' : 'stretch'};
    text-align: ${props => props.$centered ? 'center' : 'left'};
    font-size: 2.2vh;
    padding: 1.5vh 1.5vw;
    background: ${props => props.theme?.dialog?.background2 ?? props.theme?.dialog?.background ?? 'white'};
    color: ${props => props.theme?.dialog?.text ?? 'inherit'};
`
const Title = styled.div`
    font-size: 2.8vh;
    font-weight: 600;
    padding: 0.8vh 0 0.4vh 0;
`
const Badge = styled.div`
    width: 7vh;
    height: 7vh;
    border-radius: 50%;
    background: #3E9B4F;
    display: flex;
    align-items: center;
    justify-content: center;
`
const Step = styled.div`
    padding: 0.4vh 0;
`
const Hint = styled.div`
    font-size: 1.8vh;
    opacity: 0.8;
    padding: 0.6vh 0;
`
const Code = styled.div`
    font-size: 6vh;
    font-weight: 600;
    text-align: center;
    letter-spacing: 0.3vw;
    padding: 1vh 0;
    user-select: all;
`
const Notice = styled.div`
    font-size: 1.8vh;
    padding: 0.8vh 0;
`
const Hidden = styled.div`
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
`

/** Counts down to `expiresAt`, re-rendering once per second. */
const useRemaining = (expiresAt) => {
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        let timer
        try {
            if (!expiresAt)
                return
            setNow(Date.now())
            timer = setInterval(() => {
                try {
                    setNow(Date.now())
                }
                catch (err) {
                    logError('ConnectWindow', 'tick', err)
                }
            }, 1000)
        }
        catch (err) {
            logError('ConnectWindow', 'useRemaining', err)
        }
        return () => {
            try {
                clearInterval(timer)
            }
            catch (err) {
                logError('ConnectWindow', 'clearTimer', err)
            }
        }
    }, [expiresAt])

    return getRemaining(expiresAt, now)
}

const CheckIcon = () => <svg width='60%' height='60%' viewBox='0 0 24 24' aria-hidden='true' focusable='false'>
    <path d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='white' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
</svg>

const Starting = ({ platform }) => <Body $centered>
    <div role='status'>{copy.STARTING}</div>
    {copy.STARTING_HINT[platform] ? <Hint>{copy.STARTING_HINT[platform]}</Hint> : null}
</Body>

const Waiting = ({ computerName, suffix, notice, device }) => <Body>
    {copy.WAITING_STEPS(computerName).map((step, idx) => <Step key={idx}>{`${idx + 1}. ${step}`}</Step>)}
    {suffix ? <Hint>{copy.suffixLine(computerName, suffix)}</Hint> : null}
    {notice && copy.NOTICES[notice] ? <Notice role='status'>{copy.NOTICES[notice](device ?? 'The device')}</Notice> : null}
    <Step role='status'>{copy.WAITING}</Step>
    <Hint>{copy.KEEP_OPEN}</Hint>
</Body>

const CodeView = ({ device, pin, expiresAt, attemptsLeft, notice }) => {
    const { seconds, m, ss } = useRemaining(expiresAt)
    // announced to screen readers only at 30 s and at expiry, not every second
    const announce = seconds === 0 ? 'The code has expired' : seconds <= 30 ? 'The code expires in 30 seconds' : ''
    const name = device ?? 'the device'

    return <>
        <strong>{copy.wantsToConnect(device ?? 'A device')}</strong>
        <div>{copy.typeThisCode(name)}</div>
        <Code aria-label={`Code ${pin ? pin.split('').join(' ') : ''}`}>{groupCode(pin)}</Code>
        <div>{copy.expiresIn(m, ss)}</div>
        <ProgressBar height='1vh' width='100%' color='#3A9CCF' completed={Math.round(100 * seconds / copy.CODE_VALID_SECONDS)} text=' ' />
        {attemptsLeft !== undefined && attemptsLeft < 3 ? <Notice>{copy.wrongTry(name, attemptsLeft)}</Notice> : null}
        {notice === 'replaced' ? <Notice>{copy.REPLACED(name)}</Notice> : null}
        <Hidden role='status' aria-live='polite'>{announce}</Hidden>
    </>
}

/**
 * The connect window. Pairing is open exactly while it is shown. Pure view: the phases come from the display
 * props of the link service; `onDeny`, `onClose` (Close, Esc and Done) and `onRetry` are reported.
 */
export const ConnectWindow = ({ connectWindow, computerName, suffix, platform, onDeny, onClose, onRetry }) => {
    if (!connectWindow)
        return null

    const { phase, device, pin, expiresAt, attemptsLeft, notice } = connectWindow
    // each phase sizes the window to its content; the button bar always sits directly below the body
    const common = { id: 'ConnectWindow', title: copy.CONNECT_TITLE, width: '40vw', onNo: onClose }

    if (phase === 'code')
        // no default button: Enter must neither deny nor close by accident
        return <MessageBox {...common} height='46vh' yes='Deny' no='Close' defaultButton='' onYes={onDeny}>
            <Body>
                <CodeView device={device} pin={pin} expiresAt={expiresAt} attemptsLeft={attemptsLeft} notice={notice} />
            </Body>
        </MessageBox>

    if (phase === 'connected')
        return <MessageBox {...common} height='34vh' yes='Done' defaultButton='Done' noNo onYes={onClose}>
            <Body $centered>
                <Badge><CheckIcon /></Badge>
                <Title>{copy.connectedTitle(device ?? 'The device')}</Title>
                <Hint>{copy.CONNECTED_TEXT}</Hint>
            </Body>
        </MessageBox>

    if (phase === 'error')
        return <MessageBox {...common} height='30vh' yes={copy.TRY_AGAIN} no='Close' defaultButton={copy.TRY_AGAIN} onYes={onRetry}>
            <Body $centered>{copy.CONNECT_ERROR}</Body>
        </MessageBox>

    return <MessageBox {...common} height={phase === 'starting' ? '30vh' : '46vh'} noYes no='Close' defaultButton='Close'>
        {phase === 'starting' ?
            <Starting platform={platform} /> :
            <Waiting computerName={computerName} suffix={suffix} notice={notice} device={device} />}
    </MessageBox>
}
