import React from 'react';
import styled from 'styled-components';

import { Button, Overlay} from '../../../../atoms'

const DEFAULT_WIDTH = '30vw';
const DEFAULT_LEFT='35vw' 
const DEFAULT_HEIGHT='30vh' 
const DEFAULT_TOP='35vh' 

const OverlayView = styled(Overlay)`
    display: flex;
    flex-direction: column;
`

export const RIDE_MODES = {
    FREE_RIDE:      'free ride',
    FOLLOW_ROUTE:   'follow route',
    VIDEO:          'video',
}

export const VIDEO_STATES = {
    IDLE        : 'idle',
    STARTING:'Starting',
    STARTED:'Started',
    START_FAILED:'Start:Failed'
}

export const GEAR_STATES = {
    UNINITIALIZED:'Pending',
    SCANNING:'Scanning',
    CANCELLED:'Cancelled',
    INITIALIZED:'Initialized',
    STARTING: 'Starting',
    START_OK: 'Start OK',
    START_FAILURE: 'Start Failure',
    ERROR: 'Error'
}



const OverlayText = styled.div`
  height: 4.8vh;
  vertical-align: middle;
  line-height: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align:center;
`

const OverlayDetails = styled.div`
  height: calc(100% - 11.6vh);
  vertical-align: middle;
  line-height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align:left;
`

const OverlayDetailsItem = styled.div`
  height: 2.6vh;
  vertical-align: middle;
  line-height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  text-align:left;
`

const Label = styled.div`
    width: 45%;
`
const Status = styled.div`
    width: 45%;
`

const OverlayButtons = styled.div`
  text-align:center;
  height: 6.8vh;
  display: flex;
  justify-content: center;
`

const ErrorText = styled.div`
    color:red;
`

const Success = styled.div`
    color:green;
`

const Warning = styled.div`
    color:	#FFBF00;
`

export const StartRideOverlay = (props) => {
    const {mode,rideState,devices,videoState,mapType, mapState,mapStateError, videoStateError,
        visible=true,width=DEFAULT_WIDTH,height=DEFAULT_HEIGHT,top=DEFAULT_TOP,left=DEFAULT_LEFT,videoProgress={}
    } = props;

    const bikeError = devices?.find( d=>(d.isControl||d.isMandatory) && (d.state===GEAR_STATES.START_FAILURE || d.status==='Error') )!==undefined
    const sensorError = devices?.find( d=>!(d.isControl||d.isMandatory) && (d.state===GEAR_STATES.START_FAILURE || d.status==='Error')) !==undefined

    const onCancel = (reason) => {    
        if (props.onCancel) props.onCancel(reason);    
    }

    const onRetry = () => {    
        if (props.onRetry) props.onRetry();    
    }

    const onIgnore = () => { 
        if (props.onIgnore) props.onIgnore();    
    }

    const isDeviceError = ()=>{
        return bikeError
    }

    const isSensorError = ()=>{
        return sensorError && !bikeError && (rideState==='startError' || rideState==='Error')
    }

    const isVideoError = ()=>{
        if (mode!==RIDE_MODES.VIDEO && mode!=='Video')
            return false;
        return (videoState===VIDEO_STATES.START_FAILED || videoState==='Error');
    }

    
    
    const mapStateText = ()=> {
        if (mapState==='Loaded')
            return <Success>Loaded</Success>
        if (mapState==='Loading')
            return 'Loading ...'

        return mapState
    }

    const videoStateText = ()=> {
        if (videoState===VIDEO_STATES.STARTED || videoState==='Started')
            return <Success>Started</Success>
        
        if (videoState===VIDEO_STATES.STARTING || videoState==='Starting') {
            let text = 'Starting ...';
            if ( videoProgress?.loaded && !videoProgress?.bufferTime ) 
                text = 'Buffering ...';
            if ( videoProgress?.loaded && videoProgress?.bufferTime>0 ) 
                text = `Buffering (${Math.round(videoProgress?.bufferTime)}s)`;
            return <span>{text}</span>;
        }
        else if (videoState) {
            return <span>{videoState}</span>;
        }

        return null
    }

    const deviceStateText = (device)=> {
        const {state,status,stateText} = device
        if (stateText?.length>0)
            return stateText
        
        if (state===GEAR_STATES.START_OK || status==='Started')
            return <Success>Started</Success>
        if (state===GEAR_STATES.STARTING || status==='Starting')
            return 'Starting ...';
        if (state===GEAR_STATES.START_FAILURE )
            return <ErrorText>Failed</ErrorText>
        if (state===GEAR_STATES.ERROR || status==='Error')
            return <ErrorText>Failed</ErrorText>
        return state;
    }
    
    const OverlayStarting = (props) => {
        return (
            <OverlayView visible={true}  width={width} left={left} height={height} top={top}>
                <OverlayText >
                    <b>Starting activity ...</b>
                </OverlayText>
                <OverlayDetails className='startoverlay-details'>

                    { devices ? devices.map( (device,idx) => 
                        <OverlayDetailsItem key={idx}> 
                            <Label>{device.name}</Label> 
                            <Status>{deviceStateText(device)}</Status>
                        </OverlayDetailsItem>       
                        ) : null}
                    { (mode===RIDE_MODES.VIDEO || mode==='Video') ? <OverlayDetailsItem> 
                        <Label>Video</Label> 
                        <Status>{videoStateText()}</Status>
                    </OverlayDetailsItem> : null}
                    { mapType ? <OverlayDetailsItem> 
                        <Label>{mapType}</Label> 
                        <Status>{mapStateText()}</Status>
                    </OverlayDetailsItem> : null}
                </OverlayDetails>
                <OverlayButtons >
                    {props.readyToStart ? <Button margin={'1.2vh 1.1vw'} onClick={()=>onIgnore()}>Start </Button> : null}
                    <Button margin={'1.2vh 1.1vw'} onClick={()=>onCancel()}>Cancel </Button>
                </OverlayButtons>
            </OverlayView>
        )
    }
    
    const OverlayDeviceError = (props) => {
        return(
            <OverlayView visible={true}  width={width} left={left} height={height} top={top}>
            <OverlayText>
                <ErrorText><b>Start failed</b></ErrorText>
            </OverlayText>
            <OverlayDetails>
                Please switch off the device, wait 5s, switch it on and try again
            </OverlayDetails>
            <OverlayButtons  >
                <Button margin={'1.2vh 1.1vw'} primary onClick={ ()=> onRetry() } >Retry</Button>
                <Button margin={'1.2vh 1.1vw'} onClick={ ()=>{onCancel({device:true})}}>Cancel </Button>
            </OverlayButtons>
        </OverlayView>    
        )
    }

    const OverlaySensorError = (props) => {
        return(
        <OverlayView visible={true}  width={width} left={left} height={height} top={top}>
            <OverlayText >
                <Warning><b>Could not start Sensor(s)</b></Warning>
            </OverlayText>
            <OverlayDetails className='startoverlay-details'>
                { devices ? devices.map( (device,idx) => 
                    <OverlayDetailsItem key={idx}> 
                        <Label>{device.name}</Label> 
                        <Status>{deviceStateText(device)}</Status>
                    </OverlayDetailsItem>       
                    ) : null}
                { (mode===RIDE_MODES.VIDEO || mode==='Video') ? <OverlayDetailsItem> 
                    <Label>Video</Label> 
                    <Status>{videoStateText()}</Status>
                </OverlayDetailsItem> : null}
            </OverlayDetails>
            <OverlayButtons  >
                <Button margin={'1.2vh 1.1vw'} primary onClick={ ()=> onRetry() } >Retry</Button>
                <Button margin={'1.2vh 1.1vw'} primary onClick={ ()=> onIgnore() } >Ignore</Button>
                <Button margin={'1.2vh 1.1vw'} onClick={ ()=>{onCancel({device:true})}}>Cancel </Button>
            </OverlayButtons>
        </OverlayView>
        )
    }
    
    const OverlayVideoError = (props) => {
        return(
            <OverlayView visible={true}  width={width} left={left} height={height} top={top}>
            <OverlayText>
                <ErrorText><b>Start failed</b></ErrorText>                
            </OverlayText>
            <OverlayDetails className='startoverlay-details'>
            {videoStateError || 'Could not load video.'}
            </OverlayDetails>
            <OverlayButtons  >
                <Button margin={'1.2vh 1.1vw'}  onClick={ ()=>{onCancel({video:true})}}>Cancel </Button>
            </OverlayButtons>
        </OverlayView>
    
        )
    }    
    const OverlayMapError = (props) => {
        return(
            <OverlayView visible={true}  width={width} left={left} height={height} top={top}>
            <OverlayText>
                <ErrorText><b>Start failed</b></ErrorText>                
            </OverlayText>
            <OverlayDetails className='startoverlay-details'>
            {mapStateError }
            </OverlayDetails>
            <OverlayButtons  >
                <Button margin={'1.2vh 1.1vw'}  onClick={ ()=>{onCancel({video:true})}}>Cancel </Button>
            </OverlayButtons>
        </OverlayView>
    
        )
    }    

    if (!visible) return <div/>;

    if (isDeviceError()) 
        return OverlayDeviceError(props);  

    if (mapStateError) 
        return OverlayMapError(props);  

    if (isVideoError()) 
        return OverlayVideoError(props);  
    if (isSensorError()) 
        return OverlaySensorError(props);  

    return OverlayStarting(props);


}


