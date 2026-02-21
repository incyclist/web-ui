import { EventLogger } from 'gd-eventlog';
import { useGoogleMaps } from 'incyclist-services';
import React, { useEffect,useRef,useCallback, useMemo, useState,memo } from 'react';
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
    const [mapsApi,setMapsApi] = useState(props.googleMaps??mapsService.getApi())
    const refPanorama = useRef(null)
    const refObserver = useRef(null)

    const hasMaps = mapsApi!==undefined && mapsApi!==null


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



    // init effect - verifies that map is loaded and triggers reload if not
    // component remains unitialized as long as map is not loaded

    // if visible props is false, then initialization is skipped (avoids map license consumption)
    useEffect( ()=> {
        if ( initialized || !props.visible)
            return;

        logger.logEvent( {message:'init streetview',hasMaps})
        console.log('# init effect')

        if (!mapsApi) {
            logger.logEvent( {message:'reload maps api'})


            let to = setTimeout( ()=> {
                console.log('# timeout')
                if (!initialized) {
                    console.log('# emit error')
                    emit('Error','Maps API not loaded')
                }
                    
            }, 5000)
            mapsService.reload()
            mapsService.once( 'loaded',()=>{
                logger.logEvent( {message:'reload maps api completed'})
                setMapsApi(mapsService.getApi() )                
                if (to) clearTimeout(to)
                setInitialized(true)
            })

            
            return
        }
        else {
            setInitialized(true)
        }
    },[emit, initialized, logger, mapsService, props.headingOffset, props.id, props.onEvent, props.position, props.streetViewPanoramaOptions, props.visible])

    // Observer effect - initializes Observer and registers event handler of position-update
    useEffect( ()=>{
        if (!initialized )
            return

        if (!refObserver.current && props.observer) {
            const observer = refObserver.current = props.observer
            observer.on('position-update', setPosition)

        }
    },[logger, props.headingOffset, props.id, props.observer, setPosition])

    // Panorama Init effect - triggered once the 
    useEffect( ()=> {
        if (initialized && hasMaps && !refPanorama.current) {

            try {
                const {lat=0,lng=0,heading=0} = props?.position??{}

                let povHeading = (heading??0) + (props.headingOffset??0)
                if (povHeading<0) povHeading+=360
                if (povHeading>360) povHeading-=360

                // create a new Street View panorama and link to the <PanoramaCanvas> component (identified by id)
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
            

        }

    })

    useUnmountEffect( ()=>{
        if (props.id) {

            if (refObserver.current) 
                refObserver.current.off('position-update', setPosition)
        }
        else if (refObserver.current) {
                refObserver.current.stop()

        }
        delete refPanorama.current 
        delete refObserver.current
    })

    return <PanoramaCanvas id={props.id??'googleStreetView'} visible={props.visible} />    
}


