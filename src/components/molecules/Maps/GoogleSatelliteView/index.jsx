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

    const refInitialized = useRef(false)
    const refMap = useRef(null)
    const logger = new EventLogger('GoogleSatelliteView')
    const mapsService = useGoogleMaps()

    const refPolyline = useRef([])
    const refMarker = useRef([])
    const refObserver = useRef(null)

    const [mapsApi,setMapsApi] = useState(props.googleMaps??mapsService.getApi())

    const emit = useCallback ((event,data) => {
        if (props.onEvent && typeof(props.onEvent)==='function')
            props.onEvent(event,data)
    },[props])



    useEffect ( ()=>{
        if (refInitialized.current)
            return 

        if (!mapsApi) {
            mapsService.reload()
            mapsService.once( 'loaded',()=>{
                setMapsApi(mapsService.getApi() )
                refInitialized.current  =false
            })

            return
        }


        if (refInitialized.current || props.visible===false || !mapsApi )
            return;
        
        if ( mapsApi &&  !refMap.current) {

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

                mapsService.getApiKey().then(key=> {
                    if (  !!key && !mapsService.hasPersonalApiKey()) {
                        logger.logEvent( {message:'map license consumed', cnt:1})
                    }
                })

                refInitialized.current = true
                emit('Loaded')      
   
            }
            catch ( err) {
                logger.logEvent( {message:'error',fn:'initialize', error:err.message, stack:err.stack})
            }
        }
        else if (!mapsApi) {
            emit('Error','Maps API not loaded')
        }

    })

    const setPosition = useCallback((position) => {
        if (!position)
            return

        const {lat,lng,heading} = position
        updateMarker(0,{lat,lng});
        refMap.current.setOptions( { center: {lat,lng}, heading,tilt:45 });

        
    },[])

    useEffect( ()=>{

        if (!refObserver.current && props.observer) {
            const observer = refObserver.current = props.observer
            observer.on('position-update', setPosition)

        }
    },[logger, props.headingOffset, props.id, props.observer, setPosition])
    
    useUnmountEffect( ()=> {
        refInitialized.current = false
        refMap.current = null
        refMarker.current = []
        refPolyline.current = []

        if (refObserver.current) 
            refObserver.current.stop()

    })


    const addPolyline  = (polyline) => {
        if ( !refInitialized.current)
            return;

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
        if ( !refInitialized.current)
            return;

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

    const render = () =>  {

        if (refInitialized.current && refMap.current) {
            try {
                clearPolylines();
                
                const {lat,lng,heading} = props?.position??{}
                const {options} = props??{};

                if ( refMarker.current?.length===0)
                    addMarker({lat,lng});
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
    }

    const hasMaps = mapsApi!==null
    
    
    return  useMemo(render,[ props.visible, props.position, props.options,props.observer,hasMaps] )        
}