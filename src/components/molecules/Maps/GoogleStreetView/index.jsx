import { EventLogger } from 'gd-eventlog';
import { useGoogleMaps } from 'incyclist-services';
import React, { useEffect,useRef,useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useUnmountEffect } from '../../../../hooks';

const PanoramaCanvas = styled.div`
    height: 100%;
    width: 100%;
    display: ${props => props.visible ? undefined : 'none'};
	overflow: hidden;
	.gm-bundled-control {
		visibility: hidden;
		display: none;
	}
`


export const GoogleStreetView =  (props) => {
    const logger = new EventLogger('GoogleStreetView')
    const mapsService = useGoogleMaps()
    const [initialized,setInitialized] = useState(false)
    //const refInitialized = useRef(false)
    const refPanorama = useRef(null)
    const refObserver = useRef(null)

    const [mapsApi,setMapsApi] = useState(null)


    const emit = useCallback((event, data) => {
        if (props.onEvent && typeof(props.onEvent) === 'function') {
            props.onEvent(event, data);
        }
    }, [props]);

    const setPosition = useCallback((position) => {
        if (!position)
            return

        try {
            const panorama = refPanorama.current
            if (!panorama) 
                return 

            let povHeading = (position.heading??0) + (props.headingOffset??0)
            if (povHeading<0) povHeading+=360
            if (povHeading>360) povHeading-=360


            panorama.setPosition( position)
            panorama.setPov({heading: povHeading,pitch:0})
    
        }
        catch(err) {
            logger.logEvent({message:'warning', fn:'setPosition', warning:err.message, stack:err.stack, lat:position.lat, lng:position.lng,heading:position.heading })
        }
    },[logger, props.headingOffset]);



    useEffect( ()=> {
        const maps = mapsService.getApi() 

        if ( /*refInitialized.current*/ initialized || !props.visible)
            return;

        if (!mapsApi && !maps) {
            emit('Error','Maps API not loaded')
            //refInitialized.current = true
            setInitialized(true)
            mapsService.reload()
            mapsService.once( 'loaded',()=>{
                setMapsApi(mapsService.getApi() )
                setInitialized(false)
            })
            return
        }
        else if (!mapsApi&&maps!==null) {
            setMapsApi(maps)
            return
        }
            
        try {
            const {lat=0,lng=0,heading=0} = props?.position??{}

            let povHeading = (heading??0) + (props.headingOffset??0)
            if (povHeading<0) povHeading+=360
            if (povHeading>360) povHeading-=360

            refPanorama.current = new mapsApi.StreetViewPanorama( document.getElementById(props.id??'googleStreetView'),  {
                position:{lat,lng},
                pov: {heading:povHeading, pitch:0},
                ...props.streetViewPanoramaOptions??{}
            });    

            if (refPanorama.current) {
                mapsService.getApiKey().then(()=> {
                        if (  !mapsService.hasDevelopmentApiKey() && !mapsService.hasPersonalApiKey()) {
                            logger.logEvent( {message:'streetview license consumed', cnt:1})
                        }
                        else {
                            const keyType = mapsService.hasPersonalApiKey() ?  'personal' :'development' 
                            logger.logEvent( {message:'local API key used', cnt:1, keyType})
                        }
                })
                .catch(err => {
                    logger.logEvent({message:'error', fn:'maps init effect', error:err.message})
                })
                
                setInitialized(true)
                //refInitialized.current = true;
                emit('Loaded')      

                const sv = refPanorama.current

                if (props.onEvent) {
                    const register = (event, fn)=> { sv.addListener(event, (...args)=> emit(event, fn(), ...args) ) }

                    register('position_changed', ()=>({lat:sv.position.lat(),lng:sv.position.lng()}))
                    register('pano_changed',()=>sv.pano)
                    register('status_changed',()=>sv)
                    register('pov_changed',()=>sv.pov)
                    register('visible_changed',()=>sv.visible)
    
                }


            }

        }
        catch ( err) {
            logger.logEvent( {message:'map Error', error:err.message})
        }


    },[emit, initialized, logger, mapsService, props.headingOffset, props.id, props.onEvent, props.position, props.streetViewPanoramaOptions, props.visible])

    useEffect( ()=>{

        if (!refObserver.current && props.observer) {
            const observer = refObserver.current = props.observer
            observer.on('position-update', setPosition)

        }
    },[logger, props.headingOffset, props.id, props.observer, setPosition])

    useUnmountEffect( ()=>{
        if (props.id) {

            if (refObserver.current) 
                refObserver.current.off('position-update', setPosition)
        }
        else if (refObserver.current) {
                refObserver.current.stop()

        }
    })

    const hasMap = mapsApi!==null

    const render = ()=> {   
        return <PanoramaCanvas id={props.id??'googleStreetView'} visible={props.visible} />
    }
    
    return  useMemo(render,[ props.visible, props.position, props.observer,hasMap] )    
    
}


