import React from "react"
import { DynamicRideDashboard, StartRideOverlay, WorkoutRideView, RouteOptions,RidePageItems  } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";


export const PAGE_ID = 'Ride'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const WorkoutRidePage = ( {workout, activity, state,initialized,onScreenshot, onSettings, startOverlayProps= {},
                                    onStartRetry, onStartIgnore, onStartCancel, onToggleCyclingMode
                                    } ) => { 

    // time, distance, speed, power, slope, heartrate, cadence
    const dbWidth = 42.86;
    const isStarting = state==='Starting' || state==='Idle'
    const showDashboard = !!activity

    let View = ()=><Center><Loader/></Center>

    
    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel}
        View = ()=><StartRideOverlay {...childProps} />
    }


    return <MainArea>            
                <ErrorBoundary hideOnError>

                    {initialized && !isStarting ?
                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            <WorkoutRideView isMain={true} workout={workout} activity={activity} />
                            <DynamicRideDashboard visible={showDashboard} scheme='light'fold='top-right' foldId='workout-ride-dashboard' opacity={1.0}  height={'10vh'} top={0} left={`${(100-dbWidth)/2}vw`} width={`${dbWidth}vw`}  />
                            <DynamicWorkoutDashboard visible={!isStarting} showSlope={false} background='none' scheme='light' opacity={1.0}  height={'10vh'} top={'10vh'} left={`${(100-dbWidth)/2}vw`} width={`${dbWidth}vw`} />                            

                            <WorkoutControl visible={!isStarting} background='none' top={'calc(20vh + 10px);'} left={`${(100-dbWidth)/2}vw`} onToggleMode={ onToggleCyclingMode}/>
                            <RouteOptions visible={!isStarting} top='1vh' left='1vw' height='15vh' width='15vw' 
                                transparent={true} pinned={true} settings={true} screenshot={true}
                                onScreenshot={onScreenshot} onSettings={onSettings}/>           
                        </RidePageItems>
                        :
                        <View/>
                    }

                    <View/>
                </ErrorBoundary>
            </MainArea>

}