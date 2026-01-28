import React, { useState } from "react"
import 'react-vis/dist/style.css';
import {XYPlot,makeVisFlexible,LineSeries,VerticalRectSeries,Highlight, XAxis,YAxis,Crosshair} from 'react-vis';
import styled from 'styled-components';

import { Autosize, ErrorBoundary, View } from "../../atoms";
import { StepDetails } from "./StepDetails";
import { EventLogger } from "gd-eventlog";
import { getDataSeries } from "./utils";

export const PositionMarker = styled(Crosshair)`
    border-color: ${props => props.scheme==='dark' ? 'white' : 'black'};
    width:100;
`
const FlexibleXYPlot = makeVisFlexible(XYPlot);
class  WorkoutHighlight extends Highlight {
    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            brushArea: {top: 0, right: 0, bottom: 0, left: 0},
            brushing: false,
            startLocX: 0,
            startLocY: 0,
            dragArea: null
          };
        
    }

}



const zoneColor = [
    'white',        //0
    '#7f7f7f',      //1
    '#338cff',      //2
    '#59bf59',      //3
    '#ffcc3f',      //4
    '#ff6639',      //5
    '#ff330c',      //6
    '#ea39ff'       //7
]

export const WorkoutGraphView = (props) => {

    const logger = new EventLogger('WorkoutGraph');

    const [state,setState] = useState( {})

    const updateDragState = (area) => {
        const selection = {
            start: area?.left,
            stop: area?.right
        }

        logger.logEvent({message:'Zooming: ',selection});

        setState( current=> ({
            ...current, selection, detailPosition:null
        }))
    }

    const onValueMouseOver = ( d) =>{
        d.duration = d.x-d.x0;
        d.x = (d.x+d.x0)/2;
        setState( current=> ({
            ...current,detailPosition:d 
        }))

    }

    const onValueMouseOut = () => {
        setState( current=> ({
            ...current,detailPosition:null 
        }))
    }


    const getData = () => {
        let {ftp,workout} = props??{};

        const start = state.selection?.start??props?.start
        const stop = state.selection?.stop??props?.stop
        const data = getDataSeries( {ftp,start,stop,workout} ).map( s => {
            s.color = s.zone? zoneColor[s.zone] : undefined; 
            s.x-=2;
            s.x0+=2;
            return s;
        })
        return data
    }

    const getRenderProps = ()=>{
        try {
            const width = props.width
            const height = props.height
            const showMarker = props.position!==undefined;
            const dashBoardMode = props.dashboard || false;
            const showDetails = props.showDetails || !dashBoardMode;

            const margin = dashBoardMode ? {left:0,right:0,top:0,bottom:0} : props.margin || { left: width/80, right:60*width/800,  top: height/80, bottom: 60*height/600} ;
            const fontSize = 11*margin.bottom/40;
            const style = {fontSize};
            let {enableZoom,scheme='light',ftp} = props??{};

            return {width,height,margin,style,enableZoom,showMarker,showDetails,dashBoardMode,scheme,ftp}
        } catch  {
            return {}
        }
    }


    try {

        const {width,height, margin,style,enableZoom,showMarker,showDetails,dashBoardMode,scheme,ftp} = getRenderProps()
        const data = getData()
        const startX = data?.length>0 ? data[0].x0 :0 ;
        const stopX = data?.length>0 ? data[data.length-1].x : 0;
        const ftpData = [{x:startX,y:100},{x:stopX,y:100}]

        return (

            <View width='100%' height='100%' className={props.className||'workout'} id={props.id} >

                {data?.length>0  && width && height ? 
                <FlexibleXYPlot margin={margin} width={width} height={height}>
                    { !dashBoardMode && <YAxis attr='y' orientation='right' width={margin.right} style={style} />} 
                    { !dashBoardMode && <XAxis attr='x' tickFormat={ v => (v/60).toFixed() } height={margin.bottom} style={style }/>} 
                    
                    <VerticalRectSeries data={data} colorType='literal'  
                        onValueMouseOver={onValueMouseOver} 
                        onValueMouseOut={onValueMouseOut} 
                    />
                    <LineSeries color='red'  data={ftpData} />

                    { showMarker ? 
                    <PositionMarker 
                        values={props.position} 
                        style={ {line:{background: scheme==='dark'? 'white': 'black', width:2}} } >
                        <div></div>
                    </PositionMarker> : null
                    }

                    { (showDetails && state.detailPosition) ? 
                    <PositionMarker 
                        values={[state.detailPosition]} 
                        style={ {line:{background:'grey', width:1}} } >
                        <StepDetails value={state.detailPosition} ftp={ftp} />
                    </PositionMarker> : null
                    }

                    { enableZoom  ? 
                    <WorkoutHighlight
                        color="#829AE3"
                        enableY={false}
                        highLightX={startX}
                        highLightWidth={stopX}
                        onBrushEnd={updateDragState}
                    />: null
                    }
                </FlexibleXYPlot>
                :null}


            </View>
        )

    }
    catch(err) {
        logger.logEvent({message:'error', error:err.message, fn:'WorkoutGraph.render', stack:err.stack})
        return null
    }

}

export const WorkoutGraph = (props) => {    
    return  (
        <ErrorBoundary hideOnError>
            <Autosize width={props.width} height={props.height}>
                <WorkoutGraphView {...props} />
            </Autosize>
        </ErrorBoundary>
    )
}
