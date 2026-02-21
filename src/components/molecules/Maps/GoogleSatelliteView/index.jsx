import { EventLogger } from 'gd-eventlog';
import { useGoogleMaps } from 'incyclist-services';
import React, { useCallback, useEffect,useRef,useMemo,useState } from 'react';
import styled from 'styled-components';
import { useUnmountEffect } from '../../../../hooks';

const MapCanvas = styled.div`
    height: 100%;
    width: 100%;
    display: ${props => props.visible ? undefined : 'none'};
`

export const GoogleSatelliteView = (props)  =>{
    const logger = new EventLogger('GoogleSatelliteView')
    const mapsService = useGoogleMaps()

    const [initialized,setInitialized] = useState(false)
    const [mapsApi,setMapsApi] = useState(props.googleMaps??mapsService.getApi())

    const refPolyline = useRef([])
    const refMarker = useRef([])
    const refObserver = useRef(null)
    const refMap = useRef(null)

    const hasMaps = mapsApi!==undefined && mapsApi!==null

    const emit = useCallback ((event,data) => {
        if (props.onEvent && typeof(props.onEvent)==='function')
            props.onEvent(event,data)
    },[props])

    const setPosition = useCallback((position) => {
        if (!position)
            return

        const {lat,lng,heading} = position
        updateMarker(0,{lat,lng});
        refMap.current.setOptions( { center: {lat,lng}, heading,tilt:45 });

        
    },[])


    // init effect - verifies that map is loaded and triggers reload if not
    // component remains unitialized as long as map is not loaded
    // if visible props is false, then initialization is skipped (avoids map license consumption)

    useEffect( ()=> {
        if ( initialized || !props.visible)
            return;

        logger.logEvent( {message:'init satelliteview',hasMaps})

        if (!mapsApi) {
            logger.logEvent( {message:'reload maps api'})


            let to = setTimeout( ()=> {
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


    useEffect ( ()=>{
        const mapInitialied = !!refMap.current
        if (!initialized || !hasMaps || mapInitialied ) 
            return
        

        const keyboardShortcuts = !(props.disableKeyboard??false)
        
        try {
            const canvas = document.getElementById('googleMap')
            const {lat,lng,heading} = props.position??{}
            refMap.current = new mapsApi.Map( canvas, {
                center: { lat,lng },
                heading,
                zoom: 20,
                mapTypeId: 'satellite',
                tilt: 45,
                clickableIcons:false,
                disableDefaultUI: true,
                disabledDoubleClickZoom: true,
                fullscreenControl: false,
                gestureHandling: 'greedy',
                panControl: false,
                rotateControl: false,
                scaleControl: false,
                scrollwheel: true,
                streetViewControl: false,
                zoomControl:false,
                keyboardShortcuts


            });    

            mapsService.getApiKey().then( ()=> {
                    if (  !mapsService.hasDevelopmentApiKey() && !mapsService.hasPersonalApiKey()) {
                        logger.logEvent( {message:'map license consumed', cnt:1})
                    }
                    else {
                        const keyType = mapsService.hasPersonalApiKey() ?  'personal' :'development' 
                        logger.logEvent( {message:'local API key used', cnt:1, keyType})
                    }
            })
            .catch(err => {
                logger.logEvent({message:'error', fn:'maps init effect', error:err.message})
            })

            console.log('# emit loaded')
            emit('Loaded')      

        }
        catch ( err) {
            logger.logEvent( {message:'error',fn:'initialize', error:err.message, stack:err.stack})
        }

    })

    
    useUnmountEffect( ()=> {
        refMap.current = null
        refMarker.current = []
        refPolyline.current = []

        if (refObserver.current) 
            refObserver.current.stop()

    })


    const addPolyline  = (polyline) => {

        refPolyline.current.push(polyline);
        polyline.setMap(refMap.current);
    }

    const clearPolylines = () => {
        try {
            refPolyline.current.forEach(polyline => polyline.setMap(null));
        } catch {}
        refPolyline.current = [];
    }

    const addMarker = (position) => {

        const mapsApi = props.googleMaps ?? mapsService.getApi() 

        const marker = new mapsApi.Marker( {
            position,
            map:refMap.current
        })
        refMarker.current.push(marker);
    }

    const updateMarker  = ( idx, position) => {
        refMarker.current[idx].setPosition(position)
    }

    if (refMap.current) {
        try {
            clearPolylines();
            
            const {lat,lng,heading} = props?.position??{}
            const {options} = props??{};

            if ( refMarker.current?.length===0) {
                addMarker({lat,lng});
            }
            else  {
                updateMarker(0,{lat,lng});
            }

            refMap.current.setOptions( { center: {lat,lng}, heading,tilt:45 });

            if (options!==undefined && options.length>0) {
                const mapsApi = props.googleMaps ?? mapsService.getApi() 
                options.forEach ( (pathInfo,i) => {
                    const path = new mapsApi.Polyline( {
                        path: pathInfo.path,
                        strokeColor: pathInfo.selected ? 'green': pathInfo.color,
                        strokeWeight: 10,
                        strokeOpacity: 0.7,
                    })
                    addPolyline(path);
                })
            }
        }
        catch (err) {
            logger.logEvent( {message:'error',fn:'render', error:err.message, stack:err.stack})
        }          
    }

    return (
        <MapCanvas id='googleMap' visible={props.visible} />
    )
   
    
    return  useMemo(render,[ props.visible, props.position, props.options,props.observer,hasMaps] )        
}