
import React from 'react';
import styled from 'styled-components';
import {Marker} from 'react-leaflet';
import L from 'leaflet'
import * as ReactDOMServer from 'react-dom/server';
import {MaleAvatar} from '../../../../atoms/Avatars'
import {FreeMap} from '../../../../molecules/Maps';
import { useAvatars,getBounds } from 'incyclist-services';
import { EventLogger } from 'gd-eventlog';

const ViewArea = styled.div`
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(to bottom,rgba(128,128,255,1) 0%,rgba(245,245,245,1) 100%);
    z-index:  ${props => props.zIndex };
`;


export class MapRideView extends React.Component {

    constructor(props) { 
        super(props);

        this.zoom = undefined;
        this.logger = new EventLogger('MapRideView')

        this.state = {}
    }

    

    componentDidUpdate(prevProps, prevState) {
    
        if (this.state.center===undefined && this.props.position) {
            const center = this.props.position;
            this.zoom = undefined;
            this.setState({center})
            return;
        }

        if ( (prevProps.position && this.props.position && prevProps.position.lat!==this.props.position.lat) || 
             (prevProps.position && this.props.position && prevProps.position.lng!==this.props.position.lng)) {
            
            const center = this.props.position;
            this.setState({center})
        }
        
    
    }

    componentDidMount() {
        this.emit('Loaded')
    }

    getRiderAvatar() {
        return useAvatars().get('current')
    }

    getMapBounds() {

        try {
            if (this.zoom) 
                return;
        

            const {position} = this.props
            if(!position)
                return ;

            let b;

            b= getBounds( position.lat, position.lng,1000)
            if (b===undefined)
                return;

                
            return  [ [b.northeast.lat, b.northeast.lng],[b.southwest.lat,b.southwest.lng]]         
        }   
        catch(err) {
            this.logger.logEvent({message:'error', fn:'getMapBounds', error:err.message, stack:err.stack, position:this.props?.position})
            
        }
    }

    onViewportChanged(newViewport) { 
        if ( (this.zoom===undefined || newViewport.zoom !== this.zoom) && this.getMapBounds()) 
            this.zoom = newViewport.zoom;

    }

    emit(event,data) {
        if (typeof(this.props.onEvent)==='function')
            this.props.onEvent(event,data)
    }

    render() {
        const {route,options,position,activity, markers,zIndex=1 }= this.props;
       
        const myIcon = (props) => L.divIcon({
            html: ReactDOMServer.renderToString(<MaleAvatar {...props}/>),
            className: "avatar",
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

        let mapMarkers = []
        if (position?.lat && position?.lng) {
            mapMarkers.push( { lat:position.lat, lng:position.lng, avatar: this.getRiderAvatar()})
        }
        if (markers)
            mapMarkers.push( ...markers.filter( m => m.lat && m.lng))
  
        
        const getPosition = (latLng) => {            
            return [latLng.lat, latLng.lng]            
        }

        return (
            <ViewArea className='map-ride' zIndex={zIndex}>
                <FreeMap
                    viewportOverwrite = {true }
                    draggable={true}
                    route={route}
                    options={options}
                    activtiy={activity}
                    center= {position}
                    zoom={this.zoom}
                    bounds={this.getMapBounds()}
                    
                    onViewportChanged = {(viewport) => {this.onViewportChanged(viewport)}}

                >
                    {mapMarkers && mapMarkers.length>0 && mapMarkers.map( (marker,idx) => 
                        <Marker
                            icon = {myIcon({...marker.avatar})}
                            key = {idx}
                            draggable={false}
                            position={ getPosition(marker)} 
                        /> )}
                </FreeMap>
            </ViewArea>
  
        )
    }
}