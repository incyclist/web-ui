import React, { useRef } from 'react';
import 'react-vis/dist/style.css';
import { XYPlot, AreaSeries, LineSeries} from 'react-vis';    

export const ElevationPreview = ( {points=[], width, height, color, line} ) => {

    const ref = useRef(null)

    
    const data = points.map( p=> ({x:p.routeDistance, y: p.elevation}) ).filter( p=> !isNaN(p.x) || !isNaN(p.y))

    const elevations = points.filter(p=>p.elevation && !isNaN(p.elevation)).map(p=>Number(p.elevation))
    const min = Math.min(...elevations)
    const max = Math.max(...elevations)

    const yDomain = [Math.max(min-50,0), Math.max(min+500,max)]


    return <XYPlot width={width} height={height} yDomain={yDomain} margin={{bottom: 1, left: 1, right: 1, top: 1}} ref={ref}>
        <AreaSeries data={data} color={color} opacity={100}/>
        {line? 
            <LineSeries data={data} color={line}/>
        :null}
        
    </XYPlot>


}