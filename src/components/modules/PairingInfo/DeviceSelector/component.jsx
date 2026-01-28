import React from 'react'
import { Dialog,Table } from '../../../molecules'
import { EventLogger } from 'gd-eventlog'
import styled from 'styled-components'
import { DeviceEntry } from '../DeviceEntry'
import { CheckBox } from '../../../atoms/input/Checkbox'

const ContentArea = styled.div`
    position:relative;
    height: 100%;
    display:flex;
    flex-direction:column;
    justify-content:top;
    padding-left:0.4vw;
    padding-right:0.4vw;
`

const ForAll = styled.div`
    position: absolute;
    left:0;
    bottom:0.4vh;
    padding-left:0.8vw;
    font-size: 2.2vh;
`

export const DeviceSelector = ({isScanning, capability,pairingState,changeForAll, devices,canSelectAll, onOK, onCancel, onAll, onSearch, onDelete})=>{
    const title = isScanning ? "Searching ...":"Select Device"
    const logger = new EventLogger('DeviceSelector')

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

    const onAllClicked = (checked) => {
        if (onAll)
            onAll(checked)
    }

   
    const columns = {
        fields:[(d)=>d],
        width:['100%'],
        align:['left'],
        format:[(d)=><DeviceEntry device={d}/>],            
    }

    return <Dialog id='DeviceSelector' log={{capability,title}} title={title} onESC={onUserCancel} onOutsideClicked={onUserCancel} width="35vw" height="70vh" zIndex={100}>
        <ContentArea>
            <Table data={devices} rows={10} rowHeight='6vh' columns={columns}
                onDelete={onDeleteItem}
                onSelected = {onSelectItem}                
            />
            {canSelectAll ?  <ForAll><CheckBox  fontSize='2.2vh' checked={changeForAll} label='for all capabilties' onClick={onAllClicked} /></ForAll> : null}

            
        </ContentArea>
    </Dialog>
}