import React, { useCallback, useEffect, useRef, useState } from 'react'
import {RideDashboard} from './RideDashboard'
import { EventLogger } from 'gd-eventlog';
import { useActivityRide } from 'incyclist-services';
import { useUnmountEffect } from '../../../../hooks';


export const DynamicRideDashboard = ({zIndex,scheme='light',top,left,width,height})=> {

    const refLogger = useRef(new EventLogger('Dashboard'))
    const refObserver = useRef(null)
    const logger = refLogger.current
    const [items,setItems] = useState([])
    const service = useActivityRide()


    const onActivityData = useCallback(() => { 
        const update = service.getDashboardDisplayProperties()
        setItems(update)        
    },[service])


    useEffect( ()=> {
        if (refObserver.current)
            return

        try {
            const observer = service.getObserver()

            if (observer ) {
                refObserver.current = observer

                // load intial data
                onActivityData()

                // register for updates
                observer.on('data',onActivityData )
            }
        }
        catch(err) {
            logger.logEvent({message:'error',error:err.message,fn:'getActiveItems',stack:err.stack})
        }


    },[logger, onActivityData, service])

    useUnmountEffect( ()=> {
        if (refObserver.current)
            refObserver.current.off('data', onActivityData)
    })

    
    const position = {top,left,width,height,zIndex}

    if ( !refObserver.current)  {
        return null;
    }


    if (!items?.length) {
        return null;
    }

    const rows = items[0].data.length 

    
    return (
        <RideDashboard 
            className='dashboard'
            items={items}
            rows={rows}
            showHeader={true}
            scheme = {scheme}
            {...position}
        />
    )

}