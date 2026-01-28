import { EventLogger } from "gd-eventlog";
import { clone } from "../../../utils/coding";
import { getColor } from "./colors";

const RANGE_RECHECK_PERIOD = 5000;
const MAX_POINTS_DEFAULTS = 10;


const getDistance = (position) => {
    if (position ===undefined || position===null)
        return null
    return ( typeof(position)==='number' ? position:(position.routeDistance??null)) ;
}

class ElevationGraphData {


    constructor(props) {
        this.width = undefined
        this.height = undefined
        this.distance = undefined
        this.dataUpdateTS = undefined
        this.data = []
        this.marker = undefined
        this.route = undefined
        this.lapMode = undefined
        this.props = props ?? {}
        this.logger = new EventLogger('ElevationGraph')
    }


    adjustScale( point) {
        let {x,y,elevation} = point
        const {xScale,yScale} = this.props??{}

        if (xScale?.value!==undefined && xScale?.value!==1)
            x = x*xScale.value
        if (yScale?.value!==undefined && yScale?.value!==1) {
            y = y*yScale.value
            elevation = elevation*yScale.value
        }
        
        return {...point,x,y,elevation}
    }

    get() {

        return this.data.map( this.adjustScale.bind(this) )
    }

    checkForDataUpdate(newProps,newState,prevProps ) {
        let requiresDataUpdate;
        let hasSizeChanged = false
        let hasSettingsChanged = false
        let hasRangeChanged = false
    
    
        if (newState.width !== this.width || newState.height !== this.height) {
            requiresDataUpdate = true
            hasSizeChanged = true;
        }
    
        const hasRouteChanged = this.hasRouteChanged(newProps) ;
        if (hasRouteChanged) {
            requiresDataUpdate = true;
        }
    
        if (  Math.abs(newProps.pctReality-prevProps.pctReality)>0.01 || newProps.range!==prevProps.range  ) { 
            hasSettingsChanged = true
            requiresDataUpdate = true
        }
    
        if (prevProps.range && newProps.position !== prevProps.position && (Date.now() - (this.dataUpdateTS ?? 0) > RANGE_RECHECK_PERIOD)) {
            hasRangeChanged = true
            requiresDataUpdate = true;
        }
    
        return {requiresDataUpdate,hasRouteChanged,hasSizeChanged,hasSettingsChanged,hasRangeChanged};
    }

    processChanges( {hasSizeChanged,hasRouteChanged,requiresDataUpdate},newProps,newState) {
        if (hasSizeChanged) {
            this.updateDimensions(newState)
        }

        if (hasRouteChanged)
            this.updateRoute(newProps)

        if (requiresDataUpdate) {
            this.updateGraphData(newProps);
        }


    }

    updateDimensions( {width, height}) {
        this.width = width
        this.height = height;
        this.marker = undefined
        this.dataUpdateTS = undefined // enforce data update before next render

    }

    updateRoute({routeData,lapMode}) {
        this.routeData = {...routeData}
        this.lapMode = lapMode
        this.distance = routeData.distance
        this.marker = undefined
        this.dataUpdateTS = undefined // enforce data update before next render
    }

    onSettingsChange() {
        this.marker = undefined
        this.dataUpdateTS = undefined // enforce data update before next render
    }

    onPositionUpdate(newProps, fullLap) {

        
        let hasChanges = false
        const distance = fullLap ? getDistance (newProps.position)%this.distance : getDistance (newProps.position);

        
        const marker = this.getMarker(distance);

        if (!this.marker && marker) {
            this.marker = marker;
            hasChanges = true;
        }

        else if (marker) {
            const dist = marker.x - this.marker.x;
            const range = newProps.range ?? this.routeData?.distance;
            const width = this.width;
            const distPerPixel = range / width;

            if (dist < 0 || dist >= distPerPixel) {
                this.marker = marker;
                hasChanges = true;
            }
        }
        return hasChanges;
    }




    updateProps(props) {
        this.props = props
    }

    updateGraphData(props) {

        const {routeData,lapMode} = this;
        const {position,pctReality} = props

        // address legacy data format
        if (routeData?.decoded && !routeData?.points?.length) {
            routeData.points = routeData.decoded
        }

        const data = [];
            
        try {
            if (routeData===undefined ) {
                this.data = data
                return;
            }

            const totalDistance = routeData.distance
        
            let start = 0;
            let stop = totalDistance;
            let lapStart = 1;
            let lapStop  = 1
            const isLapMode = lapMode || false

            const currentPos = (position!==undefined) ? ( typeof(position)==='number' ? position:position.routeDistance) : undefined;
            let rangeAdjusted = this.getRange(props)


            if ( currentPos!==undefined && rangeAdjusted!==undefined) {
                start = currentPos<(rangeAdjusted*0.1) ? 0: currentPos-rangeAdjusted*0.1;
                stop = start+rangeAdjusted;
            }

            let isMultipleLaps = false

            if ( isLapMode) {
                lapStart = Math.floor(start/totalDistance)+1;
                lapStop = Math.floor(stop/totalDistance)+1;
                if (lapStop>lapStart) {
                    isMultipleLaps = true
                }
            }
            else {
                if (stop>totalDistance) {
                    stop = totalDistance;
                    start = stop-rangeAdjusted;
                    if (start<0) start = 0;
                }
            }

            if (rangeAdjusted) {
                this.rangeStart = start
            }
        
            const cntPoints = this.width||MAX_POINTS_DEFAULTS;
            const dpp = (stop-start)/cntPoints;
            
            let points;
            if (!isLapMode) {
                points = this.getPoints(cntPoints,dpp,{start,stop})
            }
            else {
                points = (isMultipleLaps) ? this.getPoints(cntPoints,dpp) : this.getPoints(cntPoints,dpp,{start:start%totalDistance,stop:stop%totalDistance});                
            }

            let prevDistance;
        
            for ( let j=lapStart; j<=lapStop; j++) {
                for (const point of points) {
                    try  {
                        const pointDistance = (j-1)*totalDistance+point.routeDistance;
                        if ( pointDistance>=start &&  pointDistance<=stop ) {
                            
                            if (prevDistance===undefined || Math.abs(pointDistance-prevDistance)>=dpp || Math.abs(pointDistance-prevDistance-dpp)<0.1) {

                                data.push( {x:pointDistance, y:point.elevation, slope:point.slope,elevation:point.elevation,color:getColor(pctReality, point.slope)} );

                                //addPoint(pointDistance);
                                prevDistance=pointDistance;
                            }
                
                        } 
                    }
                    catch(err) {
                        /* istanbul ignore next*/
                        this.logger.logEvent({message:'error',fn:'getData()',error:err.message||err});
                    }
                };
        
            }

        }
        catch(err) {

        }

        this.data = data
        this.dataUpdateTS = Date.now();        
        
        return data;

    }


    getPoints(required,dpp, {start,stop}={}) {
        const {routeData={}} = this       

        const points = routeData?.points??routeData?.decoded??[]
        const original = start!==undefined && stop!==undefined ?  Array.from(points.filter(p => p.routeDistance>=start && p.routeDistance<=stop)): Array.from(points)

        if (original.length>required)
            return original

        return this.enrichPoints(original, dpp)
    }

    enrichPoints(original, dpp) {
        let prev = undefined;
        const points = []
        original.forEach( (p,idx) => {
            if ( idx===0) {
                points.push(p);
                prev = p;
                return;
            }
            let distance = p.routeDistance - prev.routeDistance;
            if ( distance>dpp) {
                do {
                    const newPoint = {...prev}

                    newPoint.routeDistance = Math.floor((prev.routeDistance + dpp) / dpp)*dpp;
                    // edge case: in some cases this formular was delivering a value~=prev.routeDistance
                    if ( newPoint.routeDistance-prev.routeDistance<0.01*dpp) {
                        newPoint.routeDistance = prev.routeDistance + dpp;
                        
                    } 

                    newPoint.elevation = prev.slope*(newPoint.routeDistance-prev.routeDistance)/100 + prev.elevation;
    
                    points.push(newPoint);
                    prev = newPoint;

                    distance = p.routeDistance - newPoint.routeDistance;

                }
                while (distance>dpp) 
                points.push(p);
                prev = p;

            }
            else {
                points.push(p);
                prev = p;
            }
        })
        return points;

    }


    hasRouteChanged(props={}) {
        try {
            const updated = props?.routeData
            const current = this.routeData

            const updatedDistance = updated?.distance??-1
            const currentDistance = current?.distance??-1
    
            if (updatedDistance===-1 && currentDistance===-1) {
                return false;
            }
    
           
            const hasRouteChanged = (updatedDistance!==currentDistance || updated?.title!==current?.title)                        
            return hasRouteChanged

        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'hasRouteChanged', error:err.message, stack:err.stack})           
            return false;
        }
    }


    getRange() {
        const {range} = this.props
        const {routeData} = this

        const totalDistance = routeData.distance; // data[data.length-1].x - data[0].x;
        let rangeAdjusted = range;
        if ( range && range<0) rangeAdjusted = undefined;
        if ( range && range>totalDistance) rangeAdjusted = totalDistance;                    

        return rangeAdjusted;
    }


    getMarker(routeDistance) {
        const {lapMode,routeData,data} = this


        try {

            if (data.length===0)
                return;
    
            const totalDistance = routeData.distance; // data[data.length-1].x - data[0].x;
            const lapDistance = lapMode ? routeDistance % totalDistance : routeDistance
            const distance = routeDistance
    
    
            if (distance===0) 
                return data[0]
    
            if (lapDistance>=totalDistance) 
                return data[data.length-1];
    
            let res,resIdx;
            const rangeAdjusted = this.getRange()

            if (lapMode && rangeAdjusted)  {                    
                resIdx = data.findIndex( (d) => ( d?.x>=routeDistance))
                
            }
            else {
                resIdx = data.findIndex( (d) => ( d?.x>=distance))
            }

            if (resIdx===-1) {
                return;
            }

            res = data[resIdx]

            if (rangeAdjusted) {
                const prev = data[resIdx-1]??data[0]

                res = clone(res)

                const deltaX = distance - prev.x;
                const nextX = res.x-prev.x
                const nextY = res.y-prev.y
                const deltaY = deltaX*nextY/nextX

                res.x = distance
                res.y = prev.y + deltaY
                
            }
            return this.adjustScale(res);
        
        }
        catch(err) {
            this.logger.logEvent({message:'error',fn:'getMarker', error:err.message, stack:err.stack})           
        }

    }


    getDisplayMaxValues(withMarkers) {
        const data = this.get()

        let minY = Math.min(...data.map(p=>p.y));
        let maxY = Math.max(...data.map(p=>p.y), minY+10);

        const elevationRange = maxY - minY;
        const epp = this.height ? elevationRange/this.height : elevationRange/100;
        const offset = this.height*0.15*epp;

        minY = minY-offset;
        maxY = withMarkers ? maxY+60*epp : maxY;
        const yDomain = [minY,maxY] //, [Math.max(minY-50,0), Math.max(minY+500,maxY)]
        const xDomain = data?.length>0 ? [data[0].x,data[data.length-1].x] : [0,0]

        return [xDomain,yDomain]

    }

    

}




export  {ElevationGraphData,getDistance}