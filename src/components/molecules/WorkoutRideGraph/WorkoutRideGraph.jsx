import React, { useRef } from "react"
import 'react-vis/dist/style.css';
import {XYPlot,LineSeries,HorizontalGridLines, XAxis,YAxis,VerticalGridLines,VerticalRectSeries} from 'react-vis';
import styled from 'styled-components';
import { Autosize, Column, ErrorBoundary, Row } from "../../atoms";
import { copyPropsExcluding,average } from "../../../utils";
import { getDataSeries, getZone } from "../WorkoutGraph/utils";
import { zoneColor } from "../Activity/utils";
import { AppThemeProvider } from "../../../theme";
import { EventLogger } from "gd-eventlog";


const ContainerArea = styled(Row)`
    width: 100%;
    height: 100%;
`

const WorkoutRideGraphView  = ({activity,workout,ftp,width,height}) => {


    const refHighlight = useRef()    
    const refData = useRef(null)
    const logger = new EventLogger('WorkoutRideGraph')


    const getColor = (P) => {
        const ftpVal = activity?.user?.ftp??ftp
        if (!ftpVal)
            return 'blue'

        return zoneColor[getZone(P/ftpVal*100)]
    }

    const getPowerConfig = () => {
        return { background:'white', text:'black', line:'white', style:'line'}        
    }
    const getHeartrateConfig = () => {
        return { background:'yellow', text:'black', line:'yellow', style:'line'}        
    }

    const getFullData = (logs, power, heartrate) => {
        const totalTime = logs[logs.length-1].time

        for (let i = 0; i < width; i++) {
            const timeTarget = totalTime / width * i;
    
            const log = logs.find(l => l.time >= timeTarget) 
            if (!log)
                continue;
    
            power.push({ x: timeTarget, y: log.power, color: getColor(log.power) });
            heartrate.push({ x: timeTarget, y: log.heartrate });
        }
    }

    const getCompressedData = (logs,power, heartrate) =>{
        const totalTime = logs[logs.length-1].time
        let prevIdx = 0;
        for (let i = 0; i < width; i++) {
            try {
                const timeTarget = totalTime / width * i;


                let logIdx = logs.findIndex(l => l.time >= timeTarget) 
                if (logIdx === -1)
                    logIdx = logs.length - 1;

                const log = {};
                const values = logs.slice(prevIdx, logIdx);
                log.power = average(values, 'power');
                log.heartrate = average(values, 'heartrate');

                if (isNaN(log.power) || log.power === undefined) {
                    log.power = logs[prevIdx].power;
                    log.heartrate = logs[prevIdx].heartrate;
                }
                else {
                    power.push({ x: timeTarget, y: log.power, color: getColor(log.power) });
                    heartrate.push({ x: timeTarget, y: log.heartrate });

                }
                prevIdx = logs[logIdx].x === timeTarget ? logIdx + 1 : logIdx;

            }
            catch (err) {
                logger.logEvent({message:'error',fn:'getCompressedData', error:err.message, stack:err.stack})
            }
        }
    }

    const getLogs = () => {
        const logs  = (activity?.logs??[])
            .filter(l=>l!==undefined)
            .map( l=> (l?.distance?.value===undefined || !l?.distance?.unit) ? l : {...l, distance:l.value})
        return logs
    }

    const getData = ( dpp, timeOrDistance='distance') => {
        // if no additional data points and width hasnt changed, use the cached data
         if (refData.current && width && refData.current?.width===width 
                 && activity?.timeTotal===refData.current.timeTotal
                 && activity?.id===refData.current.id
             )
              return refData.current

        let power=[], heartrate=[]

        try {
            const logs  = getLogs()
        
            if (!logs?.length) {
                return({power,heartrate})
            }        

   
            if (dpp<1) {
                getFullData(logs, power, heartrate);
            }
            else {
                getCompressedData(logs,power, heartrate);
            }


            heartrate = heartrate.filter(l=> l.x!==undefined && l.y!==undefined )
            power = power.filter(l=> l.x!==undefined && l.y!==undefined )
   
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'getData', error:err.message, stack:err.stack})
        }


        // store graph data to cache
        if(width) {
            const {id,timeTotal} = activity??{}
            refData.current = {width,power,heartrate,id,timeTotal}
        }

        return({power,heartrate})
    }

    if (!width || !height)
        return null

    try {
        const wo = getDataSeries( {ftp,workout:activity?.workout??workout, absValues:true} ).map( s => {
            s.color = s.zone? zoneColor[s.zone] : undefined; 
            return s;
        })
        const workoutDuration = activity?.workout?.duration
    
        const logs  = getLogs()
        const maxX = Math.max( ...logs.map(i=>i.time),...wo.map(i=>i.x), workoutDuration??0)
        const dpp = width ? Math.floor( maxX /width) : 1
    
        const {power,heartrate} = getData(dpp,'time')
        const pc = getPowerConfig()
        const hc = getHeartrateConfig()
    
        
        const powerXDomain = [0, maxX]
        const powerYDomain = [0, Math.max( ...wo.map(i=>i.y), ...power.map(i=>i.y)) ]
    
        const heartrateXDomain = [0, maxX]
        const heartrateYDomain = heartrate.length ? [0, Math.max( ...heartrate.map(i=>i.y)) ] : [0,0]

        const fixed = v => v? `${v.toFixed(0)}`:undefined
        const timeTicks = (v,idx,scale,tickTotal) => {
            return (idx===0 || idx===tickTotal-1) ? `${(v/60).toFixed(0)}min` : (v/60).toFixed(0)
        }

        return (
            <AppThemeProvider>
                <ErrorBoundary hideOnError debug>
                    <Column className="column activityGraph">
                        <Row position='relative' className="row activityGraphLabels">
                            <Column background={pc.background} color={pc.text} margin='0 1vw 0 0'>Power</Column>
                            {heartrate?.length ? <Column background={hc.background} color={hc.text} margin='0 1vw 0 0'>Heartrate</Column>:null}
                        </Row>

                        

    
                        <ContainerArea position='relative' ref= {refHighlight}>
                            {power?.length>0 ? <div className='graph_power' style={{  zIndex:998, top:0, position:'absolute' }}>
                                <XYPlot margin={{right: 40, bottom:40}} width={width} height={height} xDomain={powerXDomain} yDomain={powerYDomain}>
                                    <HorizontalGridLines direction='horizontal' attr='y' />
                                    <VerticalGridLines direction='vertical' attr='x'/>
                                    <XAxis attr='x' orientation='bottom' position='end'  height={40}   tickFormat={ timeTicks} style={{text: {stroke:'white', fontSize:'1.5vh'}}} />
                                    <YAxis attr='y' orientation='left' tickFormat={fixed} style={{ text: {stroke:pc.line, fontSize:'1.5vh'}}}/>
                                    <LineSeries color={pc.line} data={power}   />
                                </XYPlot>
                            </div> : null }
                            <div className='graph_workout' style={{  zIndex:500, top:0, position:'absolute' }}>
                                <XYPlot margin={{right: 40, bottom:40}} width={width} height={height} xDomain={powerXDomain} yDomain={powerYDomain}>
                                    {!power?.length ?  <HorizontalGridLines direction='horizontal' attr='y' />:null}
                                    {!power?.length ?  <VerticalGridLines direction='vertical' attr='x' />: null}
                                    {!power?.length ?  <XAxis attr='x' orientation='bottom' position='end' height={40} tickFormat={timeTicks} style={{text: {stroke:'white', fontSize:'1.5vh'}}} />:null}
                                    {!power?.length ?  <YAxis attr='y' orientation='left' tickFormat={fixed} style={{ text: {stroke:pc.line, fontSize:'1.5vh'}}}/>:null}
    
                                    <VerticalRectSeries colorType='literal' data={wo} /> 
                                </XYPlot>
                            </div>
                            
    
    
                            {(heartrate?.length>0) && <div className='graph_heartrate' style={{ zIndex:999, top:2, position:'absolute' }}>
                                <XYPlot margin={{right: 40, bottom:40}} width={width} height={height} xDomain={heartrateXDomain} yDomain={heartrateYDomain}>
                                    <YAxis attr='y' orientation='right'  style={{
                                        text: {stroke:hc.line, fontSize:'1.5vh'}                                
                                    }}/>
                                    
                                    <LineSeries color={hc.line} data={heartrate}    />
                                </XYPlot>
                            </div>}
    
    
                        </ContainerArea>
                    </Column>
                </ErrorBoundary>
            </AppThemeProvider>
        );
    
    
    }
    catch(err) {
        logger.logEvent({message:'error in component',component:'WorkoutRideGraph', error:err.message, stack:err.stack})
    }


}


export const WorkoutRideGraph = (props)  => {

    
    const {width,height} =props
    const childProps = copyPropsExcluding(props, ['width','height'])

    return (
        <Autosize width={width} height={height}>
            <WorkoutRideGraphView {...childProps}/>
        </Autosize>
    )
}

