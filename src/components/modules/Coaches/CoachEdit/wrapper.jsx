import React, { useRef } from 'react'
import { getCoachesService } from "incyclist-services"
import { useEffect, useState } from "react"
import { CoachEdit } from "./component"
import { EventLogger } from 'gd-eventlog'

export const DynamicCoachEdit = ({coach,onOK, onCancel})=> {

    const [initialized,setInitialized] = useState(false)
    const data = useRef(null)
    const service = getCoachesService()
    const logger = new EventLogger('CoachEdit')

    useEffect( ()=>{
        if (initialized)
            return

        try {
            data.current = service.openCoachEdit(coach)
            setInitialized(true)
        }
        catch(err) {
            logger.logEvent({message:'error', fn:'useEffect',error:err.message, stack:err.stack})
        }
    },[coach, initialized, logger, service])

    const onOKHandler = (coach) => {
        try {
            data.current.update( coach)
            service.saveCoach(data.current)
    
            if (onOK)
                onOK(coach)
    
        }
        catch(err) {
            logger.logEvent({message:'error', fn:'onOKHandler',error:err.message, stack:err.stack})

        }
    }

    if (!initialized)    
        return null;

    
    let coachProps = {}
    try {
        coachProps = data.current?.getDisplayProperties()
    }
    catch(err) {
        logger.logEvent({message:'error', fn:'before render',error:err.message, stack:err.stack})
    }

    return <CoachEdit {...coachProps} onOK={onOKHandler} onCancel={onCancel} />
}