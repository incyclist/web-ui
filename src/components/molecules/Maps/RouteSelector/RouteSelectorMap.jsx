import React from 'react';
import {MapContainer, TileLayer, Marker,Polyline } from 'react-leaflet';
import { geo  } from 'incyclist-services';
import styled from 'styled-components';

import { getPolyline } from '../../../../utils/points';
import TileLayers  from '../FreeMap/TileLayers'
import { MapSearch } from './MapSearch';
import { MarkerIcon } from './MarkerIcon';

import "leaflet-geosearch/dist/geosearch.css";
import './RouteSelectorMap.css'
import { ErrorBoundary } from '../../../atoms';
import { EventLogger } from 'gd-eventlog';

const DEFAULT_MAP = 'OpenStreetMap';
const DEFAULT_ZOOM = 13;

const Container = styled(MapContainer)`
    z-index: 20;
    width: 100%;
    height: 100%;
`


export const RouteSelectorMap = ({position, viewport,mapType, onPositionChanged,routes}) => {


    const onPositionChangedHandler = (event) => {
        let latLng =  event.target._latlng

        if ( onPositionChanged)
            onPositionChanged(latLng);
    }

    const onSearchResultHandler = (location) => {
        if ( onPositionChanged)
            onPositionChanged(location);

    }

    const onKeyPress  = (event) => {
        if (event?.originalEvent) {
            event.originalEvent.stopPropagation()
        }
    }

    try {

        const tileConfig = TileLayers.get( mapType??DEFAULT_MAP);

        const mapProps = {
            onKeyPress: onKeyPress
        }
        if ( viewport?.center && viewport?.zoom) {
            mapProps.center= viewport.center;
            mapProps.zoom = viewport.zoom;
        }
        else {
            mapProps.zoom = DEFAULT_ZOOM;
            mapProps.center = position;
        }

        const latLng = geo.getLatLng(position)
        const markerPosition = [latLng.lat, latLng.lng]

        const markerEventHandlers = {
            dragend:onPositionChangedHandler,
        }


        return (
            <ErrorBoundary>
            <Container className='route-selector-map' {...mapProps}>

                <TileLayer {...tileConfig} />
                <MapSearch onSearchResult={onSearchResultHandler}/>
                <Marker
                    icon={MarkerIcon}
                    draggable={true}
                    eventHandlers={markerEventHandlers }        
                    position={markerPosition}>
                </Marker>

                { routes?.length > 0 ? routes.map((pathInfo,index) => 
                    <Polyline  
                        key={index}
                        positions={ pathInfo.polyline??getPolyline(pathInfo.path)} 
                        color={ pathInfo.color || 'blue'}
                        weight={5}
                        opacity={0.5}
                    />
                ): null}

            </Container>
            </ErrorBoundary>

        );
    }
    catch (err) {
        const logger = new EventLogger('RouteSelectorMap')
        logger.logEvent({message:'error in component', component:'RouteSelectorMap', error:err.message, stack:err.stack})
        return null;
    }
}