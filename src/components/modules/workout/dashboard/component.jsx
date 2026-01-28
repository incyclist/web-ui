import React from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';

import { Column,  ErrorBoundary,  Row } from '../../../atoms';
import { PanelItem,  Box, WorkoutGraph } from '../../../molecules';

const PanelArea = styled.div`
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    z-index: ${props => props.zIndex?? 10};
    background: ${props => props.scheme==='dark' ? 'none' : 'white'};
    background1:red;
    color: ${props => props.scheme==='dark' ? 'white' : 'black'};
    border: none;
    width: 100%;
    height: 100%;
`;

export const WorkoutInfo = styled.div`
  background: rgb( 0,153,153);  
  font-weight: bold;
  font-size: 1.5vh;
  width: calc(100% - 0.5vw);
  color: white;
  height: 2.5vh;
  min-height: 2.5vh;
  align-items: center;
  text-align: left;
  display: flex;  
  padding: 0 0 0 0.5vw;
  overflow: hidden;
`;

export const WorkoutDetails = styled(Row)`
  display: flex;
  flex-direction: row;
  text-align: left;
  font-family: "Roboto", "Arial", sans-serif, bold;
  font-size: 1.5vh;
  width: 100%;
  height: 76%;
`;

export const Icons = styled(Row)`
    position: absolute;
    right:0;
    top:0;
`

export const NavButton = styled(Row)`
    position: absolute;
    bottom:0;
    left: ${props => props.direction==='left' ? 0 : undefined};
    right: ${props => props.direction==='right' ? 0 : undefined};
    margin: 0;
    padding: 0;
    justify-content: center;
`

const TitleBar = styled(Column)`
    
    width:${props => props.hasFTP ? 'calc(100% - 6.5vw - 3ch)' : '100%'} ;
    min-width:${props => props.hasFTP ? 'calc(100% - 6.5vw - 3ch)' : '100%'} ;
`
const FTPBar = styled(Row)`
    background: rgb( 0,153,153);  
    font-size: 1.5vh;   
    width:calc(6.5vw + 3ch);     
    min-width:calc(6.5vw + 3ch);
`

export const FTPInfo = styled.div`
  background: rgb( 0,153,153);  
  font-size: 1.5vh;
  color: black;
  align-items: center;
  text-align: left;
  display: flex;  
  height: 98%;
  min-height: 98%;
  width: 3ch;
  min-width: 3ch;
  margin: 0 0.1vw 0 0;
`;

export const FTPButton = styled(Column)`
  width: 1.5vw;
  margin: 0 0.1vw 0 0;
  height: 100%;
  align-items: center;
  justify-content: center;

`

export const StepIndicator = styled(Column)`
  position: absolute;
  top:0;
  left:0;
  font-size: 1vh;
  font-weight: bold;
  color:white;
`

function pad (num,size) {
	let s = String(num);
	while (s.length < (size || 2)) {s = '0' + s;}
	return s;
}


export default class WorkoutDashboard extends React.Component {

    constructor() {
        super()
        this.logger = new EventLogger('WorkoutDashboard')
    }

    formatTime( tv, cutMissing ) {
        if ( tv===undefined || tv===null)
            return;

        let timeVal = Math.round(tv);
    
        const h = parseInt(timeVal/3600);
        timeVal = timeVal % 3600;
        const m = parseInt(timeVal/60);
        timeVal = timeVal % 60;
        const s = parseInt(timeVal);
    
        if (cutMissing===undefined || cutMissing===false || h>0)
            return  h + ':'+ pad(m) +':' +pad(s);
        else 
            return pad(m) +':' +pad(s);
    } 




    formatWorkout() {
       

        const limit = this.props.current
        if (!limit)
            return{};
        
        const remaining = this.formatTime( limit.remaining,true );
        const currentStep = this.formatTime( limit.duration,true );
        const current = limit.time
        


        return {
            time:{
                current,currentStep,
                remaining:remaining ? '-'+remaining : undefined
            }, 
            limits:{}
        }
    }


    getWorkoutPanelItems() {
        const power = {}
        const hrm = {}
        const cadence = {}

        const limits = this.props.current

        const n = (v) =>  v!==undefined && v!==null ? Number(v).toFixed(0) : undefined

        const parse = (max,min,target,unit ) =>  {
            if ( max!==undefined) {
                if ( min!==undefined) {
                    target.value = min!==max ? `${min}-${max}` : `${max}`;
                    target.unit = unit;
                }
                else {
                    target.value = `${max}`;
                    target.unit = 'max';
                }
            }
            else if ( min!==undefined) {
                target.value = `${min}`;
                target.unit = 'min';    
            }
        }

        if ( limits!==undefined) {
            parse( n(limits.maxPower), n(limits.minPower), power, 'W')
            parse( n(limits.maxHrm), n(limits.minHrm), hrm, 'bpm')
            parse( n(limits.maxCadence), n(limits.minCadence), cadence, 'rpm')    
        }


        return { power,hrm,cadence}
        
    }

    render() {

        try {

            const {ftp,scheme,numDataColumns,start,stop,workout}=this.props;       

            const workoutEnabled = (this.props.workout!==undefined && this.props.workout!==null)
            if (!workoutEnabled)
                return null;


            const {time={},limits} = this.formatWorkout();

            const workoutInfo = this.props.title ?? this.workout?.name ?? 'Workout'
            const woPI = this.getWorkoutPanelItems(limits);
            const hasFTP = (ftp??-1) !== -1

            

            const cnt = numDataColumns+3;

            const wPct = 100/cnt;
            const w = `${wPct}%`
            const wBlank = `${(numDataColumns-1)*wPct}%`
            const panelProps = {  rows:1, showHeader:false,width:w }


            const woTime = time.current

            return (
                <ErrorBoundary hideOnError>
                    <PanelArea id={this.props.id} scheme={scheme} className='panel'>
                    
                        <Row>
                            <TitleBar hasFTP={hasFTP} className='workout-title'>
                                <WorkoutInfo>
                                    {workoutInfo||''}
                                </WorkoutInfo>                    
                            </TitleBar>
                            {hasFTP?
                            <FTPBar className='workout-settings'>
                                <Column>
                                    <FTPInfo><b>{'FTP:'+Number(ftp).toFixed(0)} </b></FTPInfo> 
                                </Column>
                                
                            </FTPBar>
                            :null}
                        </Row>
                        <WorkoutDetails>                    
                            
                            
                            <PanelItem {...panelProps} rows={2} data={[{value:time.currentStep},{value:time.remaining}]} ></PanelItem>
                            
                            <Box width={wBlank}><WorkoutGraph dashboard={true} scheme={scheme} ftp={ftp} start={start} stop={stop} position={[{x:woTime}]} workout={workout}/></Box> 
                            <PanelItem {...panelProps} data={{ value:woPI.power.value, unit:woPI.power.unit}} ></PanelItem>
                            <PanelItem {...panelProps} data={{value:woPI.hrm.value,unit:woPI.hrm.unit}} ></PanelItem>
                            <PanelItem {...panelProps} data={{value:woPI.cadence.value,unit:woPI.cadence.unit}}></PanelItem>
                        </WorkoutDetails>
                

                    </PanelArea>
                </ErrorBoundary>
            )
        }
        catch(err) {
            this.logger.logEvent({message:'error in component',component:'WorkoutDashboard', error:err.message, stack:err.stack})
        }
    }

}