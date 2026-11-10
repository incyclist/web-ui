import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { EventLogger } from 'gd-eventlog'
import { Dialog } from '../../../molecules'
import { Button } from '../../../atoms/Buttons/Button'
import { ConflictStepRows } from '../ConflictStepRows'

// header, rows (scrolling if needed) and Done pinned at the bottom
const StepArea = styled.div`
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
`

const StepHeader = styled.div`
    padding: 1.5vh 1vw 0.5vh 1vw;
`

const TitleLine = styled.div`
    display: flex;
    flex-direction: row;
    align-items: baseline;
    gap: 0.8vw;
`

const StepTitle = styled.h3`
    margin: 0;
    min-width: 0;
    font-size: 2.4vh;
    line-height: 1.25;
`

const Queued = styled.span`
    flex-shrink: 0;
    padding: 0.1vh 0.6vw;
    border-radius: 999px;
    background: rgba(245, 166, 35, 0.18);
    color: #f5a623;
    font-size: 1.5vh;
    white-space: nowrap;
`

const StepSubline = styled.div`
    margin-top: 0.4vh;
    font-size: 1.8vh;
    color: #c9d1d8;
`

const StepBody = styled.div`
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 0.8vh 1vw;
`

const StepPinned = styled.div`
    display: flex;
    justify-content: flex-end;
    padding: 1vh 1vw 1.4vh 1vw;
    border-top: 1px solid #3c4a55;
`

/**
 * A device that wants slots already held by a different device: one row per slot, Done pinned at
 * the bottom, in the same modal dialog as the device list. Used both for the second step of a pick
 * in the Resistance list and for a device found by the search, so the rider answers the same
 * question in the same place either way. Rendered exactly as the page service hands it over.
 *
 * There is no close button: Esc or a click outside the dialog calls `onDismiss()`, which applies
 * the choices made so far, the same as Done.
 *
 * `armDelay` (ms): for a dialog that can appear without the rider asking for it, Keep/Use/Done
 * ignore clicks for this long after it appears (and again whenever a different conflict takes its
 * place), so a click aimed at whatever was on screen before doesn't answer it. Esc and a click
 * outside are never held back.
 */
export const ConflictStepDialog = ({ conflict, id = 'ConflictStepDialog', log, armDelay = 0 }) => {
    const logger = new EventLogger('ConflictStepDialog')

    const conflictId = conflict?.id
    // the conflict whose buttons are live; a different one is held back until its delay has passed
    const [armedId, setArmedId] = useState(armDelay > 0 ? undefined : conflictId)
    const armed = armDelay <= 0 || armedId === conflictId

    useEffect(() => {
        if (armDelay <= 0 || conflictId === undefined)
            return
        const timer = setTimeout(() => { setArmedId(conflictId) }, armDelay)
        return () => { clearTimeout(timer) }
    }, [conflictId, armDelay])

    if (!conflict)
        return null

    const whenArmed = (action, fn) => (...args) => {
        if (!armed) {
            logger.logEvent({ message: 'conflict click ignored', action, reason: 'just appeared', origin: conflict.origin })
            return
        }
        fn(...args)
    }

    // Esc or a click outside applies the choices made so far (the same as Done), it doesn't discard them
    const onDismissed = () => {
        logger.logEvent({ message: 'conflict step dismissed', origin: conflict.origin, eventSource: 'user' })

        process.nextTick(() => {
            conflict.onDismiss?.()
        })
    }

    const onChoice = whenArmed('choice', (capability, choice) => conflict.onChoice?.(capability, choice))
    const onDone = whenArmed('done', () => conflict.onDone?.())

    return (
        <Dialog id={id} scrollbar='large' log={{ title: conflict.title, origin: conflict.origin, ...log }}
            onESC={onDismissed} onOutsideClicked={onDismissed} width="35vw" height="70vh" zIndex={100}>
            <StepArea role='dialog' aria-label={conflict.title}>
                <StepHeader>
                    <TitleLine>
                        <StepTitle>{conflict.title}</StepTitle>
                        {conflict.queuedText ? <Queued>{conflict.queuedText}</Queued> : null}
                    </TitleLine>
                    {conflict.subline?.full ? <StepSubline>{conflict.subline.full}</StepSubline> : null}
                </StepHeader>
                <StepBody>
                    <ConflictStepRows rows={conflict.rows} onChoice={onChoice} />
                </StepBody>
                <StepPinned>
                    <Button primary text='Done' height='5vh' margin='0' minWidth='8vw' padding='0 1.5vw' logContext={{ button: 'conflict step done', origin: conflict.origin }} onClick={onDone} />
                </StepPinned>
            </StepArea>
        </Dialog>
    )
}
