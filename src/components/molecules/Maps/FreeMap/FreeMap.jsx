import React from 'react';
import {MapContainer, TileLayer, Marker,Polyline, useMapEvents, } from 'react-leaflet';
//import Route from '../../../../models/route/route'
import TileLayers  from './TileLayers'
import styled from 'styled-components';
import { getPosition } from 'incyclist-services';
import { EventLogger } from 'gd-eventlog';

const DEFAULT_MAP = 'OpenStreetMap';//OpenMapSurfer';

const IncyclistMap = styled(MapContainer)`

 .leaflet-control-attribution {
    display:${props=> props.noAttribution ? 'none' : undefined};
 }
`

const FreeMapListeners = (props) => {

    const map = useMapEvents( {
        zoomlevelschange:(...args)=> {
            console.log('# zoom changed', ...args)
        }
    })
    try {
    if (props.center)
        map.setView(props.center, map.getZoom())

    }
    catch {}

    return null

}

export  class FreeMap  extends React.Component {

    constructor(props) {
        super(props);


        this.logger = new EventLogger('FreeMap')

        
        const { position, viewport,routeOptions=[] } = this.updateFromProps();

        this.state = {
            position,
            viewport,
            routeOptions

        }
    }

    updateFromProps() {
        let routeOptions = []

        const {options,startPos, endPos,viewport} = this.props??{};
        let position

        try {

            if ( options!==undefined && Array.isArray(options)) {
                options.forEach( (way,idx) => {
                    let poly = this.getPathPolyline(way.path);
                    //let color = OPTION_COLOR[idx];
                    const color = way.selected ? 'green' : way.color
                    routeOptions.push( {polyline:poly,color} )
                });             
            }
            

            this.polyline = this.getPathPolyline(this.getPoints(),startPos, endPos) ?? []

            if ( this.isRoute()) {
                const {before,during,after} = this.getPathOptions(this.getPoints(),startPos, endPos)

                
                if (before && before.length>0) {
                    routeOptions.push( {polyline:before, color:this.props.colorInactive||'grey'})
                }
                if (during && during.length>0) 
                    routeOptions.push( {polyline:during, color:this.props.colorActive||'blue'})

                if (after && after.length>0) {
                    routeOptions.push( {polyline:after, color:this.props.colorInactive||'grey'})
                }
                
            }

            this.bounds = this.props.bound??this.props.bounds ?? this.calculateBounds(this.getPoints(),options);

            position = this.getMarker(this.props.marker,this.polyline)

            if (viewport && this.props.viewport===undefined && this.props.onViewportChanged!==undefined) {
                this.props.onViewportChanged(viewport)
            }
        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'updateFromProps', error:err.message, props:this.props, stack:err.stack})
        }
        return { viewport, position, polyline:this.polyline, routeOptions:structuredClone(routeOptions) }
    }


    componentDidUpdate(prevProps,prevState) {

        if ( (this.props.startPos && this.props.startPos !== prevProps.startPos) || (this.props.endPos && this.props.endPos !== prevProps.endPos) 
                || this.props.options!==prevProps.options || this.props.bounds!==prevProps.bounds) {
            const { position,routeOptions } = this.updateFromProps();

            this.setState({position,routeOptions})
        }
    }

    componentDidCatch(err){
        this.logger.logEvent({message:'error',fn:'componentDidCatch', component:'FreeMap',error:err.message, state:this.state, stack:err.stack })
        
    }

    isFullDistance(startPos,endPos) {
        if (!this.isRoute() )
            return true;
        return (startPos===0 || !startPos) && (endPos===undefined || endPos>=this.getDistance());       
    }



    isInside(p,startPos,endPos) {
        if (!p) return false
        if (p.routeDistance===undefined) return true;

        const start = startPos??0
        if (!endPos)
            return p.routeDistance>=start

        return p.routeDistance>=start && p.routeDistance<=endPos
    }

    isBefore(p,startPos) {
        if (startPos===undefined || startPos===0)
            return false;
        if (!p) return false
        if (p.routeDistance===undefined) return false;

        return p.routeDistance<startPos
    }

    isAfter(p,endPos) {
        if (endPos===undefined)
            return false;
        if (!p) return false
        if (p.routeDistance===undefined) return false;

        return p.routeDistance>endPos
    }

    getPathPolyline = (path, startPos, endPos) => {

        if (path===undefined ) {
            return [];
        }
        else {
            const polyline =  path.filter(p=>p!==undefined && p.lat && p.lng  && this.isInside(p,startPos,endPos)).map( point => {return  [ point.lat,point.lng ] })
            return polyline
        }
    }

    getPathOptions = (path, startPos, endPos) => {
        if (path===undefined || this.isFullDistance(startPos,endPos))
            return {};
        else {
            const track = path.filter(p=>p!==undefined && p.lat && p.lng)
            const before = track.filter(p=>this.isBefore(p,startPos)).map( point => {return  [ point.lat,point.lng ] })
            const during = track.filter(p=>this.isInside(p,startPos,endPos)).map( point => {return  [ point.lat,point.lng ] })
            const after = track.filter(p=>this.isAfter(p,endPos)).map( point => {return  [ point.lat,point.lng ] })
            
            return {
                before,during,after
            }
        }
    }

    calculateBounds(points,opts) {


         const getBounds = (path,prevBounds) => {
            // bounds[0] = NW, bounds[1]==SE
            let bounds = prevBounds;
            if (path!==undefined) {
                path.forEach( p => {
                    if (!p || !p.lat || !p.lng)
                        return;
                    if ( bounds===undefined ) {
                        bounds= 
                        {
                            northeast: { lat: p.lat, lng:p.lng},
                            southwest: { lat: p.lat, lng:p.lng }
                        }
                    }
                    else {
                        if ( p.lat<bounds.northeast.lat ) bounds.northeast.lat = p.lat
                        if ( p.lng>bounds.northeast.lng ) bounds.northeast.lng = p.lng
                        if ( p.lat>bounds.southwest.lat ) bounds.southwest.lat = p.lat
                        if ( p.lng<bounds.southwest.lng ) bounds.southwest.lng = p.lng
                    }
                })
            }
            
            return bounds;
        }



        try {
            let b = getBounds(points)
            if ( opts!==undefined) {
                opts.forEach( (way,idx) => {
                    b = getBounds(way.path,b);
                });             
            }
            let bounds = [ [b.northeast.lat, b.northeast.lng],[b.southwest.lat,b.southwest.lng]] 
            return bounds;    
        }
        catch (error) {
            
        }
    }

    isRoute() {
        return this.props.route?.details?.points?.length>0 || this.props.routeData?.points?.length>0


    }

    getPoints() {
        const validPoint = (p) => {
            return p.lat!==undefined && p.lng!==undefined && p.lat!==null && p.lng!==null && !isNaN(p.lat) && !isNaN(p.lng)
        }
        if (this.props.points?.length)
            return this.props.points.filter(validPoint)
        if (this.props.route?.details?.points?.length)
            return this.props.route?.details?.points.filter(validPoint)
        if (this.props.routeData?.points)
            return this.props.routeData.points.filter(validPoint)

        if (this.props.activity)
            return this.createPointsFromActivity(this.props.activity).filter(validPoint)

        return []
    }

    getDistance() {
        if (this.props.route?.details?.points?.length)
            return this.props.route.details.distance
        if (this.props.routeData?.points?.length)
            return this.props.routeData.distance
        if (this.props.points?.length) { 
            const points = this.props.points
            return points[points.length-1].routeDistance
        }

    }

    createPointsFromActivity(activity) {

        const points = []
        activity.logs.forEach( (point) => { 
            let p = { lat:point.lat, lng:point.lng, routeDistance:point.distance, elevation:point.elevation, slope:point.slope}
            points.push(p)
        });
        return points
    }

    getMarker(marker) {
        return marker;
    }


    onViewportChanged(viewport) {
        if ( this.props.onViewportChanged)
            this.props.onViewportChanged(viewport);
        else 
            this.setState( {viewport} )

    }

    onUpdateMarkerPosition(event) {

        if ( event=== undefined)
            return;

        try {
            const t = event.target
            const index = (t.options && t.options.options) ? t.options.options.index : undefined;
            let position = t._latlng;
            const points = this.getPoints()

            if (points?.length) {
                position = getPosition( points,  {latlng:position,nearest:true})
                if (position===undefined)  {
                    const oldPosition = this.state.position;
                    this.setState( {position})
                    this.setState( {position:oldPosition})
                    return;
                }
                    
            }
            
            if (this.props.onPositionChanged) {
                if (points) {
                    if ( index===undefined)
                        this.props.onPositionChanged( position )        
                    else
                        this.props.onPositionChanged( {index,position} )    
                }
            }
            else {
                if ( index===0 || index===undefined)                
                    this.setState( {position});

            }
        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'onUpdateMarkerPosition', error:err.message, updateEvent:event, stack:err.stack})
        }

    }
    
    render() {
        //console.log('~~~ render', this.props, this.isFullDistance(this.props.startPos, this.props.endPos), this.polyline!==undefined, this.routeOptions.length)

        const isOnline = (typeof window !==undefined) ? window.navigator.onLine : true

        if (!isOnline )
            return null;

        if (!this.polyline?.length)
            return <></>
        
        //const {routeOptions} = this.updateFromProps();
        let {position,viewport} = this.state;
        const {center,draggable=true,noAttribution=false,viewportOverwrite,bounds,scrollWheelZoom=true,zoomControl=true,attributionControl=true,boxZoom=false,trackResize,zoom } = this.props;
        const {width='100%',height='100%'} = this.props;

        let tileConfig = TileLayers.get(DEFAULT_MAP);
        if ( this.props.marker)
            position = this.getMarker(this.props.marker)

        const mapProps = {scrollWheelZoom,zoomControl,attributionControl,noAttribution,boxZoom,trackResize,keyboard:true,dragging:draggable}



        if ( this.props.viewport && viewportOverwrite) {
            mapProps.center= center ?? this.props.viewport.center ?? viewport.center;
            mapProps.zoom = this.props.viewport.zoom ?? viewport.zoom
        }
        else if ( viewport && !viewportOverwrite) {
            mapProps.center= center ?? viewport.center;
            mapProps.zoom = viewport.zoom;
        }
        
        else if( viewportOverwrite && center && zoom) { 
            mapProps.center= center;
            mapProps.zoom = zoom;
        }
        else {            
            mapProps.bounds = bounds ?? this.bounds;
            mapProps.center = center;
        }

        try {
            if (mapProps.zoom!==undefined && mapProps.zoom!==null) {
                mapProps.zoom = Number(mapProps.zoom)
                if (isNaN(mapProps.zoom))
                    delete mapProps.zoom
            }
            mapProps.maxZoom = 28

        }
        catch {}

        if (mapProps.center === undefined && mapProps.zoom ===undefined && mapProps.bounds===undefined) {
            this.logger.logEvent({message:'error',fn:'FreeMap.render',error:'no map size specified'})
            mapProps.center = this.polyline?.[0]
            mapProps.zoom  = 10
        }

        const eventHandlers= {
            dragend: this.onUpdateMarkerPosition.bind(this)
        }


        // avoid component error when no center is defined
        if ( (mapProps.center===undefined || mapProps.center===null) && !this.polyline?.length) 
            return null

        const RouteOptions = ( {routeOptions}) => 
            <>
                        { (routeOptions!==undefined && routeOptions.length>0) && routeOptions.map((pathInfo,index) => 
                    <Polyline  
                        key={index}
                        positions={ pathInfo.polyline }
                        color={ pathInfo.color || 'blue'}
                        weight={5}
                        opacity={0.5}
                    />
                )}
            </>


        try {
            return (
                
                <IncyclistMap 
                    animate={false}
                    style={{ width,height}}
                    {...mapProps}                                        
                >
                    <FreeMapListeners center={mapProps?.center} zoom={mapProps?.zoom}/>
                    <TileLayer                         
                        {...tileConfig}
                    />

                { (position!==undefined && (!Array.isArray(position) || position.length>=2) ) && 
                <Marker
                    draggable={draggable}
                    eventHandlers={eventHandlers}
                    //onDragend={ e => {this.onUpdateMarkerPosition(e)}}
                    position={position}
                />
                }
                { this.polyline?.length && 
                    <Polyline  
                        positions={ this.polyline }
                        color={ 'blue' }
                        weight={5}
                        opacity={0.5}
                    />
                }

                <RouteOptions  routeOptions={this.state.routeOptions} />
                

                { this.props.children}

                </IncyclistMap>
                
        )

        }
        catch ( err) {
            return null;
        }
    }

}