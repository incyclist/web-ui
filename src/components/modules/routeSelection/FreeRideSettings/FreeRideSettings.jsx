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
    }

    const onCancelHandler = (data) =>  {
        card.cancel()        
        if (onCancel)
            onCancel()
    }
    const onChangeHandler = (position,props) =>  {

        
        const prevSettings = settings

        // search text, address and the found coordinates are not logged
        const isSearch = Boolean(position?.query)
        if (isSearch) {
            logger.logEvent({message:'user entered search', hasQuery:true, eventSource:'user' })
        }
        else {
            logger.logEvent({message:'user selected position', position,eventSource:'user'})
        }

        setSettings(current => ({...current,position}))
        setLoading(true)

        const source = isSearch ? 'search' : 'map'
        const {lat,lng} = position ?? {}
        service.selectStartPosition({lat,lng}, {source}).then( (settings) => {
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