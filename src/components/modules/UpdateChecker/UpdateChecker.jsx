import { checkForAppUpdates } from "incyclist-services"
import { useEffect, useState } from "react"
import { AvailableUpdateMessage } from "./AvailableUpdateMessage"
import React from "react"
import { EventLogger } from "gd-eventlog"



export const UpdateChecker = ()=>{
    const [inititialized,setInitialized] = useState(false)
    const [availableUpdate,setAvailableUpdate] = useState(null)
    const logger = new EventLogger('Incyclist')

    useEffect( ()=>{
        if (inititialized)
            return 

        checkForAppUpdates().then( res => {
            setAvailableUpdate(res)

        })
        setInitialized(true)

    }, [inititialized])

    const onSkip = ()=> {
        setAvailableUpdate(null)
    }

    if (availableUpdate) {
        logger.logEvent({message:'update available message shown', ...availableUpdate})
        return <AvailableUpdateMessage {...availableUpdate} onSkip={onSkip}/>
    }
    else 
        return null
}