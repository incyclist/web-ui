import React,{ useEffect, useRef, useState } from "react"
import { CoachList } from "./component"
import { getCoachesService } from "incyclist-services"
import { ErrorBoundary } from "../../../atoms"
import { DialogLauncher } from "../../../molecules"
import { DynamicCoachEdit } from "../CoachEdit/wrapper"
import { EventLogger } from "gd-eventlog"

export const DynamicCoachList = ({onEdit,onUpdate}) => {

    const [initialized,setInitialized] = useState(false)
    const [coaches,setCoaches] = useState(null)
    const service = getCoachesService()
    const dialogLauncher = useRef(null)
    const logger = new EventLogger('CoachList')

    useEffect( ()=>{
        if (initialized)
            return

        const _coaches = service.getCoaches()
        if (_coaches) {
            setCoaches(_coaches)
        }

        setInitialized(true)
    },[initialized,service])

    const openDialog = ( Dialog,props)=> {
        dialogLauncher.current.openDialog(Dialog,props)
    }
    const closeDialog = ( )=> {
        dialogLauncher.current.closeDialog()
    }


    const onCancel = ()=> {
        closeDialog()
    }

    const onOK = (coach,data)=> {
        
        closeDialog()
        coach.update(data)
        service.saveCoach(coach)
        if (onUpdate)
            onUpdate()


    }

    const onEditHandler = (idx)=>{
        try {
            const coach = coaches[idx]
            openDialog(DynamicCoachEdit,{coach, onOK:(data)=>onOK(coach,data), onCancel} )
            if (onEdit)
                onEdit(idx)
    
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'onEditHandler',error:err.message,stack:err.stack})           
        }
    }

    const onDeleteHandler = (idx)=>{
        try {
            service.deleteCoach(coaches[idx] )
            if (onUpdate)
                onUpdate()
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'onDeleteHandler',error:err.message,stack:err.stack})           
        }
    }

    if (!coaches || !Array.isArray(coaches))
        return null;

    let data=[];

    try {
        data = coaches.map( c=> c.getDisplayProperties())
    }
    catch(err) {
        logger.logEvent({message:'error',fn:'rendering',error:err.message,stack:err.stack})           
        return null;

    }

    return  (
        <ErrorBoundary>
            <CoachList coaches={data} onEdit={onEditHandler} onDelete={onDeleteHandler}/>
            <DialogLauncher ref={dialogLauncher} />
        </ErrorBoundary>
    )
}