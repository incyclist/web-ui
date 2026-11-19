import React, { useRef } from 'react'
import { getCoachesService } from "incyclist-services"
import { useEffect, useState } from "react"
import { CoachEdit } from "./component"
import { EventLogger } from 'gd-eventlog'

export const DynamicCoachEdit = ({coach,onOK, onCancel})=> {

    const [initialized,setInitialized] = useState(false)
    const [error,setError] = useState(null)
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
            setError(null)

            if (onOK)
                onOK(coach)

        }
        catch(err) {
            logger.logEvent({message:'error', fn:'onOKHandler',error:err.message, stack:err.stack})
            // keep the dialog open and tell the user that the coach was not saved
            setError('Could not save the coach')

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

    return <CoachEdit {...coachProps} error={error} onOK={onOKHandler} onCancel={onCancel} />
}