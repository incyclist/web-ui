import React  from "react"
import { DynamicRideDashboard, MapOverlay, StartRideOverlay, SideViewOverlay, RouteOptions,RidePageItems } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";
import { GpxRideView } from "../../../components/modules/Ride/views/gpx/GpxRideView";
import { ShiftingControl } from "../../../components/modules/shifting/control";


export const PAGE_ID = 'FreeRide'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const FreeRideRidePage = ( { workout, activity, route, state,initialized,startOverlayProps= {},
                                       position, markers, options, hideAll,rideView,
                                       displayObserver, onDisplayEvent,displayPosition, sideViews,
                                       showShiftingButtons, showDashboard, showWorkout,
                                       map,optionProps,dbColumns,
                                       onScreenshot, onSettings, onFreeRideOptionSelected,
                                       onStartRetry, onStartIgnore, onStartCancel, onToggleCyclingMode
                                    } ) => { 


    // time, distance, speed, power,  heartrate, cadence
    const dbWidth = 50/7*(dbColumns??6)
    const isStarting = state==='Starting' || state==='Idle'



    const opacity = rideView==='map' ? 1 : 0.6

    const svl = {
        top: '53vh' ,
        left: '0px' ,
        height: '35vh',
        width: '25vw'
    }
    const svr = { ...svl,
        left: '75vw' ,
    }



    let View = ()=><Center><Loader/></Center>
    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel}
        View = ()=><StartRideOverlay {...childProps} />
    }

    const sideViewProps = { stateKey:'sideViews',persistState:true, fold:'top-right', transparent:false, opacity:opacity}
    const isReady = initialized && !isStarting
    const showMap = map?.show && rideView!=='map'

    return <MainArea>            
                <ErrorBoundary hideOnError>
                        {!isReady ? <View/> : null}

                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            {/* ride view */}
                            <GpxRideView visible={true} options={options} isMain={true} position={displayPosition} route={route} rideView={rideView} onEvent={onDisplayEvent} observer={displayObserver} />                           

                            {/* dashboards and controls */}
                            <DynamicRideDashboard visible={showDashboard} scheme='light'fold='top-right' foldId='gpx-ride-dashboard' opacity={1.0}  height={'10vh'} top={0} left={`${(100-dbWidth)/2}vw`} width={`${dbWidth}vw`}  />
                            <ShiftingControl visible={showShiftingButtons} background='none' top={'calc(10vh + 10px);'}  justify='center' onToggleMode={ onToggleCyclingMode} />

                            <DynamicWorkoutDashboard visible={showWorkout} showSlope={false} background='none' scheme='light' opacity={1.0}  height={'10vh'} top={'10vh'} left={`${(100-dbWidth)/2}vw`} width={`${dbWidth}vw`} />                            
                            <WorkoutControl visible={showWorkout} background='none' top={'calc(20vh + 10px);'} left={`${(100-dbWidth)/2}vw`} onToggleMode={ onToggleCyclingMode}/>
                            <RouteOptions visible={!isStarting} top='65vh' left='26vw' height='35vh' width='48vw'
                                options={options}  settings={true} screenshot={true}                                 
                                {...optionProps}
                                transparent={true} pinned={false} 
                                onScreenshot={onScreenshot} onSettings={onSettings} onOptionSelected={onFreeRideOptionSelected} />           

                            {/* overlays */}
                            {showMap ? <MapOverlay foldId='map' fold={'top-right'}  opacity={1.0}                             
                                viewport={map.viewport} center={map.center} bounds= {map.bounds} viewportOverwrite={map.viewportOverwrite} onViewportChange={map.onViewportChange}
                                preview={false} freeRide={false}    
                                minimized = {map?.minimized}
                                top = {0} left={0} height={'30vh'} width={'20vw'}
                                routeData={route.details} position={position} options={options} markers = {markers} 
                                /> : null}

                            {sideViews?.enabled ? 
                                <SideViewOverlay {...sideViewProps} {...svl} foldId='sv-left' hidden={sideViews.hide}
                                useMinimizeProp
                                direction='left'  position={displayPosition}  observer={displayObserver}
                                minimized={!sideViews?.left} transparent={false} opacity={1}
                                />                            
                            : null}
                            {sideViews?.enabled ? 
                                <SideViewOverlay {...sideViewProps} {...svr} foldId='sv-right'  hidden={sideViews.hide}
                                useMinimizeProp
                                direction='right' position={displayPosition} observer={displayObserver}
                                minimized={!sideViews?.right} transparent={false} opacity={1}
                                />                            
                            : null}

                        </RidePageItems>

                    <View/>
                </ErrorBoundary>
            </MainArea>

}