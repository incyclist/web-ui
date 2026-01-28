import React, { useRef, useState } from "react"
import 'react-vis/dist/style.css';
import {XYPlot,LineSeries,HorizontalGridLines, XAxis,YAxis,VerticalGridLines,Crosshair, VerticalBarSeries} from 'react-vis';
import styled from 'styled-components';
import { EventLogger}  from 'gd-eventlog';

import { AppThemeProvider } from "../../../../theme";
import { Autosize, Column, ErrorBoundary, Row } from "../../../atoms";
import { copyPropsExcluding } from "../../../../utils/props";
import { average } from "../../../../utils/coding";
import { getZone, zoneColor } from "../utils";

const PositionMarker = styled(Crosshair)`
    border-color:black;
    width:100;
`

const ContainerArea = styled(Row)`
    width: 100%;
    height: 100%;
`

const ActivityGraphView  = ({activity,ftp,width,height,units}) => {

    const [crosshairValues, setCrosshairValues] = useState([])

    const refHighlight = useRef()    
    const refData = useRef(null)
    const refCHData = useRef(null)
    const logger = new EventLogger('ActivityGraph')


    const getDisplayMaxValues = (data) =>{

        let minY = Math.min(...data.map(p=>p.y));
        let maxY = Math.max(...data.map(p=>p.y), minY+10);

        const yDomain = [minY,maxY] //, [Math.max(minY-50,0), Math.max(minY+500,maxY)]
        const xDomain = data?.length>0 ? [data[0].x,data[data.length-1].x] : [0,0]

        return [xDomain,yDomain]

    }    

    const getCrosshair = () => {
        if (crosshairValues.length>0) {
            const {x,speed,power,heartrate,elevation} = crosshairValues[0]??{}

            const getDistance = ()=> {
                if (units?.distance) {
                    return `Distance: ${x.toFixed(1)} ${units.distance}` 
                }
                return `Distance: ${(x/1000)?.toFixed(1)} km`
            }

            return (
                <div style={{background: 'white',color:'black', fontSize:'1.5vh', width: '20ch'}}>
                {getDistance()}<br/>
                { speed!==undefined ? `Speed: ${speed.toFixed(1)} ${units?.speed??'km/h'}` :''}<br/> 
                { power!==undefined ? `Power: ${power.toFixed(0)} W`:''} <br/>
                { heartrate!==undefined ? `Heartrate: ${heartrate.toFixed(0)} bpm` : ''}  <br/> 
                { elevation!==undefined ? `Elevation: ${elevation.toFixed(0)} ${units?.elevation??'m'}` :''}<br/> 
                </div>
            );
        }
        return(<div></div>)        
    }

    const onNearestX = (value)=>{
        const distance = value?.x??-1

        if (distance===-1)
            return;

        const data = refCHData.current?.[distance]
        if (data) {
            setCrosshairValues([data]);
        }
    }


    const getColor = (P) => {
        const ftpVal = activity?.user?.ftp??ftp
        if (!ftpVal)
            return 'blue'

        return zoneColor[getZone(P/ftpVal*100)]
    }

    const getPowerConfig = () => {
        const ftpVal = activity?.user?.ftp??ftp
        if (!ftpVal) 
            return { background:'blue', text:'white', line:'blue', style:'line'}        
        else 
            return { background:'blue', text:'white', line: 'blue', style:'bars'}        
    }
    const getHeartrateConfig = () => {
        const ftpVal = activity?.user?.ftp??ftp
        if (!ftpVal) 
            return { background:'red', text:'white', line:'red'}        
        else 
            return { background:'white', text:'black', line: 'white'}        
    }

    const getData = ( timeOrDistance='distance') => {
        if (refData.current && width && refData.current?.width===width 
                && activity?.timeTotal===refData.current.timeTotal
                && activity?.id===refData.current.id
            )
             return refData.current

        let power=[], elevation=[], heartrate=[], speed=[]

        try {
            const logs  = (activity?.logs??[]).filter(l=>l!==undefined)
        
            if (!logs||logs.length===0) {
                return({power,elevation,heartrate})
            }        

    
            const dpp = Math.floor(logs.length/width)
            const totalTime = logs[logs.length-1].time
            const totalDistance = logs[logs.length-1].distance

            if (dpp<1) {
                for (let  i=0;i<width;i++) { 
                    const timeTarget = totalTime/width*i
                    const distanceTarget = totalDistance/width*i

                    const target = timeOrDistance==='time' ? timeTarget : distanceTarget
                    const log = timeOrDistance==='time' ? logs.find(l => l.time>=timeTarget) : logs.find(l => l.distance>=distanceTarget)
                    if (!log)
                        continue;
                    
                    power.push({x: target, y: log.power, color:getColor(log.power)})
                    elevation.push({x: target, y: log.elevation})
                    heartrate.push({x: target, y: log.heartrate})
                    speed.push({x: target, y: log.speed})
                }
            }
            else {
                let prevIdx = 0;
                for (let  i=0;i<width;i++) { 
                    try {
                        const timeTarget = totalTime/width*i
                        const distanceTarget = totalDistance/width*i
                        const target = timeOrDistance==='time' ? timeTarget : distanceTarget
    
                        let logIdx =  timeOrDistance==='time' ? logs.findIndex(l => l.time>=timeTarget) : logs.findIndex(l => l.distance>=distanceTarget)
                        if (logIdx===-1)
                            logIdx = logs.length-1

                        const log = {}
                        const values = logs.slice(prevIdx,logIdx)
                        log.power = average( values,'power' )
                        log.elevation = average( values,'elevation' )
                        log.heartrate = average( values,'heartrate' )
                        log.speed = average( values,'speed' )

                        if ( isNaN(log.power) || isNaN(log.elevation) ) {
                            log.power = logs[prevIdx].power
                            log.elevation = logs[prevIdx].elevation
                            log.heartrate = logs[prevIdx].heartrate
                            log.speed = logs[prevIdx].speed
                        }
                        else {
                            power.push({x: target, y: log.power, color:getColor(log.power)})
                            elevation.push({x: target, y: log.elevation})
                            heartrate.push({x: target, y: log.heartrate})
                            speed.push({x: target, y: log.speed})
    
                        }
                        prevIdx = logs[logIdx].x===target ? logIdx+1 : logIdx

                    }
                    catch(err) {
                        console.log(err)
                    }
                }

            }
        }
        catch(err) {
            logger.logEvent({message:'Error', fn:'getData', error:err.message, stack:err.stack})
        }

        refCHData.current = {}
        power.forEach( (p,idx)=> {
            refCHData.current[p.x] = {x:p.x,power:p.y, speed:speed?.[idx]?.y, elevation:elevation?.[idx]?.y,heartrate:heartrate?.[idx]?.y }
        }) 

        heartrate = heartrate.filter(l=> l.x!==undefined && l.y!==undefined )
        power = power.filter(l=> l.x!==undefined && l.y!==undefined )
        speed = speed.filter(l=> l.x!==undefined && l.y!==undefined )
        elevation = elevation.filter(l=> l.x!==undefined && l.y!==undefined )

        if(width) {
            const {id,timeTotal} = activity??{}
            refData.current = {width,power,elevation,heartrate,id,timeTotal}
        }


        return({power,elevation,heartrate})

    }




    const {power,heartrate} = getData()
    const pc = getPowerConfig()
    const hc = getHeartrateConfig()

    if (!width || !height)
        return false
    

    const xTicks = v => { 
        if (units?.distance)
            return v.toFixed(1)
        return  (v/1000).toFixed(1) 
    }

    return (
        <AppThemeProvider>
            <ErrorBoundary hideOnError debug>
            <Column className="column activityGraph">
                <Row position='relative' className="row activityGraphLabels">
                    {power?.length ? <Column background={pc.background} color={pc.text} margin='0 1vw 0 0'>Power</Column>:null}
                    {heartrate?.length ? <Column background={hc.background} color={hc.text} margin='0 1vw 0 0'>Heartrate</Column>:null}
                </Row>

                <ContainerArea position='relative' ref= {refHighlight}>
                    
                    <div className='graph1' style={{  zIndex:998, top:0, position:'absolute' }}>
                        <XYPlot margin={{right: 40}} width={width} height={height}  >
                            {width && <HorizontalGridLines direction='horizontal' attr='y' />}
                            {width && <VerticalGridLines direction='vertical' attr='x' />}
                            {width && <XAxis attr='x' tickFormat={ xTicks } style={{text: {stroke:'white', fontSize:'1.5vh'}}} />}
                            {width && <YAxis attr='y' orientation='left' tickFormat={ v => v? `${v.toFixed(0)}`:undefined } style={{
                                text: {stroke:pc.line, fontSize:'1.5vh'}
                            }}/>}

                            {width && <PositionMarker 
                                values={crosshairValues} 
                                style={ {line:{background:'white', width:2}} } >
                                {getCrosshair()}
                            </PositionMarker>}

                            { pc.style === 'bars' ?
                                <VerticalBarSeries colorType='literal' data={power} /> 
                                : 
                                <LineSeries color={pc.line} data={power}   />
                            }


                        </XYPlot>
                    </div>

                    {(heartrate && heartrate.length>0) && <div className='graph2' style={{ zIndex:999, top:2, position:'absolute' }}>
                        <XYPlot margin={{right: 40}} width={width} height={height} >
                            {width &&  <YAxis attr='y' orientation='right' tickFormat={ v => v? `${v.toFixed(0)}`:undefined }  style={{
                                text: {stroke:hc.line, fontSize:'1.5vh'}                                
                            }}/>}
                            <LineSeries color={hc.line} data={heartrate} onNearestX={onNearestX}     />
                        </XYPlot>
                    </div>}


                </ContainerArea>
            </Column>
            </ErrorBoundary>
        </AppThemeProvider>
    );



}


export const ActivityGraph = (props)  => {

    
    const {width,height} =props
    const childProps = copyPropsExcluding(props, ['width','height'])
    return (
        <Autosize width={width} height={height}>
            <ActivityGraphView {...childProps}/>
        </Autosize>
    )
}