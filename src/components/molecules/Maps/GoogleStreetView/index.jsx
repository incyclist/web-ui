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
    // latest known position, from props.position or a position-update event - never (0,0)
    const refPosition = useRef(props.position)
    // first status_changed result, used to log/emit exactly once per panorama
    const refStatusConfirmed = useRef(false)
    const refTsCreated = useRef(null)

    const hasMaps = mapsApi!==undefined && mapsApi!==null
    // Maps API load stays eager (it's free); only panorama creation (the billable part) is
    // gated - default true so every other caller of this component keeps working unchanged.
    const allowInit = props.allowInit !== false


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

    const onPositionUpdate = useCallback((position) => {
        if (position)
            refPosition.current = position
        setPosition(position)
    },[setPosition]);



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

    // remember the latest known position - from props (the initial start position) or from the
    // observer once it starts pushing live updates - so a panorama created later (e.g. a side
    // view opened after Street View already released) never falls back to (0,0)
    useEffect( ()=> {
        if (props.position)
            refPosition.current = props.position
    },[props.position])

    // Observer effect - initializes Observer and registers event handler of position-update
    useEffect( ()=>{
        if (!initialized )
            return

        if (!refObserver.current && props.observer) {
            const observer = refObserver.current = props.observer
            observer.on('position-update', onPositionUpdate)

        }
    },[logger, props.headingOffset, props.id, props.observer, onPositionUpdate])

    const logLicenseEvent = useCallback((confirmed, panoStatus)=> {
        const elapsed = refTsCreated.current ? Date.now()-refTsCreated.current : undefined
        const svRole = props.id==='ride' ? 'main' : (props.id?.includes('left') ? 'side-left' : props.id?.includes('right') ? 'side-right' : props.id)

        mapsService.getApiKey().then(()=> {
                if (  !mapsService.hasDevelopmentApiKey() && !mapsService.hasPersonalApiKey()) {
                    logger.logEvent( {message:'streetview license consumed', cnt:1, confirmed, panoStatus:panoStatus??'none', elapsed, svRole})
                }
                else {
                    const keyType = mapsService.hasPersonalApiKey() ?  'personal' :'development'
                    logger.logEvent( {message:'local API key used', cnt:1, keyType, confirmed, panoStatus:panoStatus??'none', elapsed, svRole})
                }
        })
        .catch(err => {
            logger.logEvent({message:'error', fn:'maps init effect', error:err.message})
        })
    },[logger, mapsService, props.id])

    // Panorama Init effect - triggered once the map is initialized, allowInit is true, and a
    // real (non-(0,0)) position is known. `allowInit` gates the actual billable step -
    // services owns *when* a panorama may be created, this component only obeys the flag.
    useEffect( ()=> {
        if (initialized && hasMaps && allowInit && refPosition.current && !refPanorama.current) {

            try {
                const {lat,lng,heading=0} = refPosition.current

                let povHeading = (heading??0) + (props.headingOffset??0)
                if (povHeading<0) povHeading+=360
                if (povHeading>360) povHeading-=360

                refTsCreated.current = Date.now()
                refStatusConfirmed.current = false

                // create a new Street View panorama and link to the <PanoramaCanvas> component (identified by id)
                refPanorama.current = new mapsApi.StreetViewPanorama( document.getElementById(props.id??'googleStreetView'),  {
                    position:{lat,lng},
                    pov: {heading:povHeading, pitch:0},
                    ...props.streetViewPanoramaOptions??{}
                });

                if (refPanorama.current) {

                    const sv = refPanorama.current

                    // registered before anything else, so the very first status is seen here
                    // and never missed: 'Loaded' now means Google confirmed OK, not
                    // that the panorama object merely exists. No imagery at a position is a
                    // routine, legitimate answer (not a failure) - it resolves the start exactly
                    // like 'Loaded' does, and it keeps being reported on every later status
                    // change too (a rider can ride through several coverage gaps on one route),
                    // just without re-logging the license event, which was already billed once
                    // at construction.
                    sv.addListener('status_changed', ()=>{
                        const status = typeof sv.getStatus === 'function' ? sv.getStatus() : undefined
                        const isOk = status===undefined || status==='OK'

                        if (!refStatusConfirmed.current) {
                            refStatusConfirmed.current = true
                            logLicenseEvent(isOk ? 'ok' : 'no-coverage', status??'OK')
                            emit(isOk ? 'Loaded' : 'NoPanorama', status)
                            return
                        }

                        if (!isOk)
                            emit('NoPanorama', status)
                    })

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
        if (refPanorama.current && !refStatusConfirmed.current) {
            // the panorama was billed at construction but never told us how it resolved
            logLicenseEvent('unconfirmed')
        }

        if (props.id) {

            if (refObserver.current)
                refObserver.current.off('position-update', onPositionUpdate)
        }
        else if (refObserver.current) {
                refObserver.current.stop()

        }
        delete refPanorama.current
        delete refObserver.current
    })

    return <PanoramaCanvas id={props.id??'googleStreetView'} visible={props.visible} />    
}


