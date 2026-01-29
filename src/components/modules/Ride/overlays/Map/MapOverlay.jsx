import React from 'react';
import styled from 'styled-components';
import {Marker} from 'react-leaflet';
import L from 'leaflet'
import * as ReactDOMServer from 'react-dom/server';
import { getPointAtDistance, useAvatars } from 'incyclist-services';
import { CoachAvatar, ErrorBoundary, MaleAvatar } from '../../../../atoms';
import {FreeMap} from '../../../../molecules/Maps';
import { EventLogger } from 'gd-eventlog';

const getPosition = (latLng) => {            
    return [latLng.lat, latLng.lng]            
}

const AvatarIcon = (props) => {
    const Avatar = props?.type==='coach' ? CoachAvatar : MaleAvatar
    
    return L.divIcon({
        html: ReactDOMServer.renderToString(<Avatar {...props}/>),
        className: "avatar",
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

const Markers = ({markers}) =>{
    if (!markers?.length)
        return null;

    return markers.map( (marker,idx) => 
        <Marker
            icon = {AvatarIcon({...marker.avatar})}
            key = {idx}
            draggable={false}
            position={ getPosition(marker)} 
        /> )

}


const DetailedMapArea = styled.div`
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    z-index:  ${props => props.zIndex };
    box-shadow: 0 4px 6px -4px #333;
    background: rgba(0,0,0);
    border: rgb(229, 229, 229) 1px solid;
`;

export class MapOverlay extends React.Component {

    constructor(props) {
        super(props)
        this.logger = new EventLogger('MapOverlay')

        this.isLegacy = false
        this.prevCenter;
    }
   


    getMarkers() {
        try {
            const {markers=[],position,routeData }= this.props;
            const avatars = useAvatars()
            
            if (markers?.length) {
                markers.forEach( m => {
                    if (!m?.lat && !m?.lng && m?.distance) {
                        const point = getPointAtDistance(routeData,m.distance,true)
                        m.lat = point.lat;
                        m.lng = point.lng
                    }
                })
    
            }

        
        
            const mapMarkers = []
            if (position?.lat && position?.lng) {
                mapMarkers.push( { lat:position.lat, lng:position.lng, avatar: avatars.get('current')})
            }

            const otherRides = markers?.filter( m => m.lat && m.lng)??[]
            if (otherRides?.length)
                mapMarkers.push( ...otherRides)
            return mapMarkers
    
        }
        catch(err) {
            this.logger.logEvent( {message:'error',fn:'getMarkers',error:err.messagem, stack:err.stack})

            return []
        }
    }
    


    render() {
        try {
            if (this.state?.error)
                return null;


            const {routeData,options,preview, startPos,endPos,position,viewport,bounds,onViewportChange }= this.props;
            const viewportOverwrite = this.isLegacy ? true : this.props.viewportOverwrite


            let center = this.props.center ?? position ?? this.prevCenter
            
            if (!this.props.center && preview) {
            
                const path = routeData.points??routeData.decoded
                center = path[path.length-1];
            }
            this.prevCenter = center
        

            return (

                <DetailedMapArea className='map'>
                    <ErrorBoundary hideOnError>
                        <FreeMap 
                            viewport={viewport}
                            bounds={bounds}
                            viewportOverwrite = {viewportOverwrite}
                            routeData={routeData}
                            options={options}
                            startPos={startPos}
                            endPos={endPos}
                            center= {center}
                            onViewportChanged={onViewportChange}
                            
                        >
                            <Markers markers={this.getMarkers()}/>

                        </FreeMap>
                    </ErrorBoundary>
                </DetailedMapArea>
                
    
            )
        }
        catch(err) {
            this.logger.logEvent( {message:'error in component',error:err.messagem, stack:err.stack})
            return null
        }
    }
}

