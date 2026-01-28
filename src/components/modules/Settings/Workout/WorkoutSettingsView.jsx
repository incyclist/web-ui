import React from 'react';
import {TrashIcon } from '@primer/octicons-react'
import styled from 'styled-components';
import { Button, ErrorBoundary, Row, SingleSelect } from '../../../atoms';
import { Dropzone,WorkoutGraph } from '../../../molecules';
import { AppThemeProvider } from '../../../../theme';

export const ContentArea = styled.div`
    position:relative;
    width: ${props=> props.width || 'calc(100% - 2vw)'};
    height: ${props=> props.height || 'calc(100% - 2vh)'};
    text-align: left ;
    margin:auto;
    display: flow-root;
    flex-direction:column;
    padding-left: 1vw;
    padding-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 1vh;
    top:0;
    left:0;
    background: ${props => props.theme?.dialogContent?.background || 'white'};
    color: ${props => props.theme?.dialogContent?.text };
`;

const DetailArea = styled.div`
    text-align: left;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 66%;
`

const SettingsArea = styled.div`
    margin-left: 1.5vh;
    position: absolute;
    bottom: 1vh;
`

const WorkoutInfo = (props) => {
    
    if (props===undefined || props.workout===undefined) return ('');
    const nop = ()=>{}
    const onClick = props.onDelete || nop ;
    return (
        <div style={{display:'flex', flexDirection:'row'}}>
            <Button onClick={onClick} padding={'1vh 0.5vw'} id='delete'>
                <TrashIcon width='100%' height='100%' verticalAlign='middle'></TrashIcon>
            </Button>
            {props.workout.name ? <div style={{textAlign:'left', height:'2.2vh',marginTop:'2.2vh',marginBottom:'2.2vh',fontSize:'2.2vh'}}>
                {props.workout.name} 
            </div> :null}
        </div>
    );
    
}

export const WorkoutSettingsView = ( {workout,workouts,settings,error,width,height,onDrop,onDelete,onClearError,onChangeErgMode}) =>{
  
    
    const onHandleChangeErgMode = (enabled) =>{
        if (onChangeErgMode)
            onChangeErgMode(enabled)
    }
    

    const {useErgMode=true,ftp=200} = settings??{};
    
    const errorText = error ? error.message : undefined;
    const filters = [
        { name: 'Workout files', extensions: ['zwo','json'] },
        { name: 'Zwift Workouts', extensions: ['zwo'] },
        { name: 'Incyclist Workouts files', extensions: ['json'] },
    ]

    
    const workoutSelection = (workouts??[]).map( w=> w.name)

    return (
        <ErrorBoundary>
            <AppThemeProvider>
            <ContentArea  width={width} height={height}> 
                {!workout && !workouts ?
                    <Dropzone className="dropzone" error={errorText}
                                onDrop = {onDrop} onClearError={onClearError} electron={true} scheme={'incyclist'} multiple={false} filters={filters}>                                
                    </Dropzone> 
                    : null
                }
                {!workout && workouts ? 
                    <SingleSelect options={workoutSelection}/>
                    :null}
                {workout ? <WorkoutInfo onDelete={onDelete} workout={workout}/>: null}

                <Row height='2%'/>
                <DetailArea  >
                    {workout?<WorkoutGraph workout={workout} ftp={ftp}/>:null}
                </DetailArea>
                {workout ? 
                    <SettingsArea style={{height:'2vh'}}> 
                        <input type="checkbox" checked={useErgMode}
                            onChange={ (event) => {onHandleChangeErgMode(event.target.checked)} }
                            name= 'erg-mode'/> 
                        <label style={{fontSize:'1.5vh'}}>Use ERG Mode</label>
                    </SettingsArea>
                
                :null}
            </ContentArea>
            </AppThemeProvider>
        </ErrorBoundary>
    )
}