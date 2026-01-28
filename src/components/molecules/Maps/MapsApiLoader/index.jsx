import React, { useEffect, useRef, useState } from 'react';
import asyncLoading from 'react-async-loader';
import { useGoogleMaps, useOnlineStatusMonitoring, useUserSettings } from 'incyclist-services';
import { EventLogger } from 'gd-eventlog';


export const MapsApiLoader = ()=> {

    const [state,setState] = useState({})
    const service = useGoogleMaps();
    const settings = useUserSettings()

    const onlineStatusMonitor = useOnlineStatusMonitoring()
    const logger = new EventLogger('GoogleMapsLoader')

    const refStart = useRef(undefined);
    const onlineWarningShown = useRef(false)


    const mapScriptsToProps = () => {

        const uuid = settings.getValue('uuid',undefined)
        let googleUrl = service.getMapsDownloadUrl()
        if ( state.googleMapsApiKey!==undefined) {
            googleUrl = googleUrl + '?key=' + state.googleMapsApiKey;
            if (uuid) {
                googleUrl = googleUrl+`&uuid=${uuid}`
            }
        }
        else {
            if (uuid) {
                googleUrl = googleUrl+`?uuid=${uuid}`
            }

        }
        
          let googleMaps = {
                globalPath: 'google.maps',
                jsonp: false,
                url:googleUrl
          };

          return {googleMaps};
    }

    const Consumer = ( {googleMaps, onLoaded}) => {
        const service = useGoogleMaps();
        const [initialized,setInitialized] = useState(false)
        const logger = new EventLogger('GoogleMapsLoader')


        useEffect( ()=> {
    
            if (initialized)
                return
    
            // service.once('reload',()=>{
            //     console.log('# reload signalled (Consumer)')
            //     // enforce state change, i.e. re-rendering of Loader component
            //     setInitialized(false)
            // })


            if ( !!googleMaps && !service.getApi()) {
                setInitialized(true)
                service.setApi(googleMaps)
                logger.logEvent({message: 'Google Maps API loaded', duration: Date.now()-(refStart.current??0)})
                if (onLoaded && typeof onLoaded==='function') {
                    onLoaded()
                }

            }
        
        },[googleMaps, initialized, logger, onLoaded, service])

    
        return googleMaps===null ? <></> : null
    
    }
  


    const Loader = asyncLoading(mapScriptsToProps)(Consumer);


    useEffect( ()=> {
        if (state.initialized)
            return

        service.on('reload',()=>{
            // enforce state change, i.e. re-rendering of Loader component
            setState( current=> ({...current, loaded:false, ts: Date.now() }) )    
        })

        service.getApiKey().then(key => {
            setState({initialized: true,googleMapsApiKey:key,online: onlineStatusMonitor.onlineStatus })    
        })
    },[onlineStatusMonitor.onlineStatus, service, state.initialized])


    useEffect( ()=>{

        if (!state.initialized || state.loaded)
            return;

        const logDownloadState = (online)=> {

            if (!online && !onlineWarningShown.current) {
                logger.logEvent({message:'Google Maps API not (yet) loaded', reason:'offline'})
                onlineWarningShown.current = true;
            }
        }

        onlineStatusMonitor.start('GoogleMapsLoader',isOnline=>{
            if ( isOnline!==state.online && isOnline && !service.getApi()) {
                setState(current=>({...current,state:isOnline}))
                service.reload()
            }
            

        })

        logDownloadState(state.online)


        return () => {
            onlineStatusMonitor.stop('GoogleMapsLoader')
        }
    }, [service, logger, onlineStatusMonitor, state.initialized, state.loaded, state.online])

    
    
    if (!state.initialized || state.loaded || !state.online)
        return false

    if (!refStart.current) {
        const url = service.getMapsDownloadUrl()

        logger.logEvent({message:'Loading Google Maps API',url})
        refStart.current = Date.now()
    }

    const onLoadSuccess = ()=> {
        setState( current=>({...current, loaded:true}))
    }

    if (state.online)
        return <Loader onLoaded={onLoadSuccess}/>
    else    
        return false

    

}

export default MapsApiLoader