import React from "react"
import { useUserSettings } from "incyclist-services";

import { DynamicRideDashboard, MapOverlay, NearbyRiders, StartRideOverlay, TotalElevationOverlay, UpcomingElevationOverlay, 
         VideoRideView, RouteOptions,RidePageItems  } from "../../../components/modules/Ride";
import { DynamicWorkoutDashboard } from "../../../components/modules/workout/dashboard/wrapper";
import { Center, ErrorBoundary, Loader } from "../../../components/atoms";
import { MainArea } from "../atoms/MainArea";
import { WorkoutControl } from "../../../components/modules/workout/control";
import { PrevRides } from "../../../components/modules/Ride/lists/PreviousRides";
import { InfoText } from "../../../components/molecules";
import { ShiftingControl } from "../../../components/modules/shifting/control";


export const PAGE_ID = 'Ride'
const CAMERA_SOUND = 'sounds/camera-shutter.mp3';
export const cameraSound = new Audio(CAMERA_SOUND);


export const VideoRidePage = ( { route, state,initialized,startOverlayProps= {},
                                       position, markers, rideView,realityFactor,startPos, endPos,
                                       video, videos, map,upcomingElevation,totalElevation,dbColumns,xScale, yScale,
                                       prevRides,nearbyRides, showShiftingButtons, showDashboard, showWorkout,
                                       onScreenshot, onSettings, 
                                       onStartRetry, onStartIgnore, onStartCancel, onToggleCyclingMode
                                    } ) => { 


    // time, distance, speed, power, slope, heartrate, cadence
    const dbWidth = 50/7*(dbColumns??7)
    const isStarting = state==='Starting' || state==='Idle'
   

    const lapMode = route?.description?.isLoop
    const slopeRange = 2000

    const settings = useUserSettings()
    const deltaX = settings.get('preferences.rideListDeltaX',0)
    // .... STOP TODO

    const opacity = rideView==='map' ? 1 : 0.6

    const egPos = {
        top:'88vh',
        left:0,
        height:'12vh',
    }

    const nbPos = {
        top: '22vh',
        left: `${74+deltaX}vw`,
    }

    const prPos = {
        top: '22vh',
        left: `${74+deltaX}vw`,
    }

    const nearbyLeft = nearbyRides?.show && prevRides?.show 

    if (nearbyLeft) {
        prPos.top = map?.show ? '32vh' : '22vh'
        prPos.left = '1vw'
    }


    let View = ()=><Center><Loader/></Center>


    if (initialized && isStarting) {
        const childProps = {...startOverlayProps, onRetry:onStartRetry, onIgnore:onStartIgnore, onCancel:onStartCancel}
        View = ()=><StartRideOverlay {...childProps} />
    }

    const sideViewProps = { stateKey:'sideViews',persistState:true, fold:'top-right', transparent:false, opacity:opacity}
    const isReady = initialized && !isStarting
    let {info} = videos?.length>1 ?  videos.find(v=>!v.hidden) : video??{}
    
    return <MainArea>            
                <ErrorBoundary hideOnError>
                        {!isReady ? <View/> : null}

                        {/* ride view  - in case of a next-video chain, we might have multiple videos (only one is visible)*/}
                        {video?
                            <VideoRideView  {...video} width='100%' height='100%' className={'video:'+video.id} />
                            : null }


                        {/* video views */}
                        { videos?.length>0 ?                        
                            (videos??[]).map( (v)=><VideoRideView width='100%' height='100%' className={'video:'+v.id} key={v.id} {...v}  /> ) 
                            : null                             
                        }
                            
                            
                        { info? <InfoText {...info} /> : null}

                        {/* overlays */}
                        <RidePageItems visible={true} width='100%' height='100%' zIndex={1}  >
                            {/* dashboards and controls */}
                            <DynamicRideDashboard visible={showDashboard} scheme='light'fold='top-right' foldId='gpx-ride-dashboard' opacity={1.0}  height={'10vh'} top={0} left={`${(100-dbWidth)/2}vw`} width={`${dbWidth}vw`}  />
                            <ShiftingControl visible={showShiftingButtons} background='none' top={'calc(10vh + 10px);'}  justify='center' onToggleMode={ onToggleCyclingMode} />
                            <DynamicWorkoutDashboard visible={showWorkout} showSlope={false} background='none' scheme='light' opacity={1.0}  height={'10vh'} top={'10vh'} left={`${(100-dbWidth)/2}vw`} width={`${dbWidth}vw`} />                            
                            <WorkoutControl visible={showWorkout} background='none' top={'calc(20vh + 10px);'} left={`${(100-dbWidth)/2}vw`} onToggleMode={ onToggleCyclingMode}/>
                            <RouteOptions visible={!isStarting} top='65vh' left='26vw' height='35vh' width='48vw'
                                transparent={true} pinned={false} settings={true} screenshot={true}
                                onScreenshot={onScreenshot} onSettings={onSettings}/>           

                            {/* overlays */}
                            {map?.show ? <MapOverlay foldId='map' fold={'top-right'}  opacity={1.0} markers = {markers} preview={false} freeRide={false} 
                                minimized = {map?.minimized}
                                top = {0} left={0} height={'30vh'} width={'20vw'}
                                routeData={route.details} position={position} startPos={startPos} endPos={endPos} 
                                /> : null}
                            {upcomingElevation?.show ? <UpcomingElevationOverlay {...sideViewProps} foldId={'slope'} top={0} left={'85vw'} width={'15vw'} height={'20vh'}
                                minimized={upcomingElevation?.minimized} 
                                routeData={route.details} lapMode={lapMode} pctReality={realityFactor}
                                showXAxis={true} showYAxis={true} line={{color:'white'}} xScale={xScale} yScale={yScale} range={slopeRange}
                                markers = { []}
                                position={position} /> : null}

                            {totalElevation?.show ? <TotalElevationOverlay {...sideViewProps} foldId={'elevation'} transparent={true} opacity={rideView==='map' ? 1 : opacity}   
                                top={egPos.top} left={egPos.left} width={egPos.width} height={egPos.height} 
                                minimized={totalElevation?.minimized} 
                                addPosition={true}
                                routeData={route.details} lapMode={lapMode}
                                showXAxis={false} showYAxis={false} line={{color:'white'}}  pctReality={realityFactor} 
                                position={position}
                                /> : null }
 

                            { prevRides?.show?
                                <PrevRides rides={prevRides.list} foldId={'prev-rides'} fold={'top-right'}  persistState={true} transparent={true}  opacity={opacity}   
                                minimized={prevRides.minimized}
                                top={prPos.top} left={prPos.left} width={'25vw'} height={'43vh'} />
                                : null }                                

                            { nearbyRides?.show ?
                                <NearbyRiders observer={nearbyRides?.observer} foldId={'nearby-rides'} fold={'top-right'} persistState={true} transparent={true} opacity={opacity} 
                                minimized={nearbyRides?.minimized}  
                                top={nbPos.top} left={nbPos.left} width={'25vw'} height={'43vh'} />
                                : null } 


                        </RidePageItems>
                        

                    <View/>
                </ErrorBoundary>
            </MainArea>

}