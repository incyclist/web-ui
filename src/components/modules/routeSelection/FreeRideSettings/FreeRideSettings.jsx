import React, { useEffect, useState } from "react"
import { useFreeRideService } from 'incyclist-services'
import { EventLogger } from "gd-eventlog"

import { FreeRideSettingsView } from "./FreeRideSettingsView"

export const FreeRideSettingsDialog = (props) => {
    const {onStart,onCancel,card} = props
    
    const [initialized,setInitialized] = useState(false)
    const [loading,setLoading] = useState(false)
    const [settings,setSettings] = useState({})
    const service = useFreeRideService()

    const logger = new EventLogger('FreeRideSettings')
    

    useEffect( ()=>{
        if(initialized)
            return;

        setInitialized(true)

        const position = service.getStartPosition()
        setSettings({position})
        setLoading(true)
        
        service.selectStartPosition().then( (settings) => {
            setLoading(false)
            setSettings(settings)
        })

    },[initialized, card, settings, service])


    const onStartHandler = (data) => {
        const position = service.getStartPosition()
        const settings = card.accept(data,position)
        if (onStart)
            onStart(settings)

        setInitialized(false)
    }

    const onCancelHandler = (data) =>  {
        card.cancel()        
        if (onCancel)
            onCancel()
        setInitialized(false)

    }
    const onChangeHandler = (position,props) =>  {

        
        console.log('# position',position)
        const prevSettings = settings

        const search = position?.query
        if (search) {
            const {lat,lng,address} = position
            logger.logEvent({message:'user entered search', search, position:{lat,lng}, address,eventSource:'user' })
        }
        else {
            logger.logEvent({message:'user selected position', position,eventSource:'user'})
        }

        setSettings(current => ({...current,position}))
        setLoading(true)

        service.selectStartPosition(position).then( (settings) => {
            setLoading(false)
            setSettings(settings)
        })
        .catch( () => {
            setLoading(false)
            setSettings(prevSettings)

        })
    }

 
    const args = {...props, ...settings}

    if(!initialized)
        return null;

    const View = FreeRideSettingsView

    return <View {...args} 
    loading={loading} 
    onStart={onStartHandler} onCancel={onCancelHandler} 
    onChange={onChangeHandler}
    />


}