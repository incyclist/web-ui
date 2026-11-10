import React from 'react'
import { Dialog,Table } from '../../../molecules'
import { EventLogger } from 'gd-eventlog'
import styled from 'styled-components'
import { DeviceEntry } from '../DeviceEntry'
import { ConflictStepDialog } from '../ConflictStepDialog'

const ContentArea = styled.div`
    position:relative;
    height: 100%;
    display:flex;
    flex-direction:column;
    justify-content:top;
    padding-left:0.4vw;
    padding-right:0.4vw;
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

    // the list's second step, after a pick that takes slots held by another device. Esc or a click
    // outside applies the choices made so far (the same as Done), it doesn't discard the pick. It
    // opens in direct answer to the rider's pick, so it doesn't hold its buttons back.
    if (conflictStep) {
        return <ConflictStepDialog id='DeviceSelector' log={{capability}} conflict={conflictStep} />
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
