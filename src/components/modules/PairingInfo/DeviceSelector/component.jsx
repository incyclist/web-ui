import React from 'react'
import { Dialog,Table } from '../../../molecules'
import { EventLogger } from 'gd-eventlog'
import styled from 'styled-components'
import { DeviceEntry } from '../DeviceEntry'
import { ConflictStepRows } from '../ConflictStepRows'
import { Button } from '../../../atoms/Buttons/Button'

const ContentArea = styled.div`
    position:relative;
    height: 100%;
    display:flex;
    flex-direction:column;
    justify-content:top;
    padding-left:0.4vw;
    padding-right:0.4vw;
`

// the second step: header, rows (scrolling if needed) and Done pinned at the bottom
const StepArea = styled.div`
    box-sizing: border-box;
    height: 100%;
    display: flex;
    flex-direction: column;
`

const StepHeader = styled.div`
    padding: 1.5vh 1vw 0.5vh 1vw;
`

const StepTitle = styled.h3`
    margin: 0;
    font-size: 2.4vh;
    line-height: 1.25;
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

export const DeviceSelector = ({isScanning, capability, devices, conflictStep, onOK, onCancel, onDelete})=>{
    const logger = new EventLogger('DeviceSelector')
    const title = isScanning ? "Searching ...":"Select Device"

    const onUserCancel = () => {
        logger.logEvent({message:'outside dialog clicked', EventSource:'user' })

        process.nextTick(()=>{
            if (onCancel) {
                onCancel()
            }

        })
    }

    // Esc or a click outside during the second step applies the choices made so far (the same as
    // Done), it doesn't discard the pick
    const onStepDismissed = () => {
        logger.logEvent({message:'conflict step dismissed', eventSource:'user' })

        process.nextTick(()=>{
            conflictStep?.onDismiss?.()
        })
    }



    const close = async () =>{
        await new Promise(done => process.nextTick(()=>{done()}))
    }

    const onDeleteItem = (element,i) => {
        logger.logEvent({messsage:'button clicked', button:'delete device',device:element?.name||devices[i]?.name, EventSource:'user' })
        if (onDelete)
            onDelete( devices[i]?.udid)
    }

    const onSelectItem = async (i) => {
        if (onOK) {
            await close();
            onOK( devices[i]?.udid)
        }
    }


    const columns = {
        fields:[(d)=>d],
        width:['100%'],
        align:['left'],
        format:[(d)=><DeviceEntry device={d}/>],
    }

    if (conflictStep) {
        return <Dialog id='DeviceSelector' scrollbar='large' log={{capability,title:conflictStep.title}} onESC={onStepDismissed} onOutsideClicked={onStepDismissed} width="35vw" height="70vh" zIndex={100}>
            <StepArea>
                <StepHeader>
                    <StepTitle>{conflictStep.title}</StepTitle>
                    {conflictStep.subline?.full ? <StepSubline>{conflictStep.subline.full}</StepSubline> : null}
                </StepHeader>
                <StepBody>
                    <ConflictStepRows rows={conflictStep.rows} onChoice={conflictStep.onChoice} />
                </StepBody>
                <StepPinned>
                    <Button primary text='Done' height='5vh' margin='0' minWidth='8vw' padding='0 1.5vw' logContext={{ button: 'conflict step done' }} onClick={() => conflictStep.onDone()} />
                </StepPinned>
            </StepArea>
        </Dialog>
    }

    return <Dialog id='DeviceSelector' scrollbar='large' log={{capability,title}} title={title} onESC={onUserCancel} onOutsideClicked={onUserCancel} width="35vw" height="70vh" zIndex={100}>
        <ContentArea>
            <Table data={devices} rows={10} rowHeight='6vh' columns={columns}
                onDelete={onDeleteItem}
                onSelected = {onSelectItem}
            />
        </ContentArea>
    </Dialog>
}
