import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import { ProgressBar } from '../../../atoms'
import * as copy from './copy'
import { getRemaining, groupCode, logError } from './utils'

const Body = styled.div`
    font-size: 2.2vh;
    padding: 0.5vh 0.5vw;
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

const Starting = ({ platform }) => <Body>
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

    return <Body>
        <div>{copy.typeThisCode(name)}</div>
        <Code aria-label={`Code ${pin ? pin.split('').join(' ') : ''}`}>{groupCode(pin)}</Code>
        <div>{copy.expiresIn(m, ss)}</div>
        <ProgressBar height='1vh' width='100%' color='#3A9CCF' completed={Math.round(100 * seconds / copy.CODE_VALID_SECONDS)} text=' ' />
        {attemptsLeft !== undefined && attemptsLeft < 3 ? <Notice>{copy.wrongTry(name, attemptsLeft)}</Notice> : null}
        {notice === 'replaced' ? <Notice>{copy.REPLACED(name)}</Notice> : null}
        <Hidden role='status' aria-live='polite'>{announce}</Hidden>
    </Body>
}

/**
 * The connect window. Pairing is open exactly while it is shown. Pure view: the phases come from the display
 * props of the link service; `onDeny`, `onClose` (Close, Esc and Done) and `onRetry` are reported.
 */
export const ConnectWindow = ({ connectWindow, computerName, suffix, platform, onDeny, onClose, onRetry }) => {
    if (!connectWindow)
        return null

    const { phase, device, pin, expiresAt, attemptsLeft, notice } = connectWindow
    const common = { id: 'ConnectWindow', title: copy.CONNECT_TITLE, width: '40vw', height: '46vh', onNo: onClose }

    if (phase === 'code')
        // no default button: Enter must neither deny nor close by accident
        return <MessageBox {...common} yes='Deny' no='Close' defaultButton='' onYes={onDeny}>
            <Body><strong>{copy.wantsToConnect(device ?? 'A device')}</strong></Body>
            <CodeView device={device} pin={pin} expiresAt={expiresAt} attemptsLeft={attemptsLeft} notice={notice} />
        </MessageBox>

    if (phase === 'connected')
        return <MessageBox {...common} yes='Done' defaultButton='Done' noNo onYes={onClose}>
            <Body>
                <strong>{copy.connectedTitle(device ?? 'The device')}</strong>
                <Hint>{copy.connectedText(device ?? 'the device')}</Hint>
            </Body>
        </MessageBox>

    if (phase === 'error')
        return <MessageBox {...common} yes={copy.TRY_AGAIN} no='Close' defaultButton={copy.TRY_AGAIN} onYes={onRetry}>
            <Body>{copy.CONNECT_ERROR}</Body>
        </MessageBox>

    return <MessageBox {...common} noYes no='Close' defaultButton='Close'>
        {phase === 'starting' ?
            <Starting platform={platform} /> :
            <Waiting computerName={computerName} suffix={suffix} notice={notice} device={device} />}
    </MessageBox>
}
