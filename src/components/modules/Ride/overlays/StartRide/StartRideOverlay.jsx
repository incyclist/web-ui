import React from 'react';
import styled, { keyframes } from 'styled-components';

import { Button, LinkButton, Overlay} from '../../../../atoms'

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

// ---------------------------------------------------------------------------------------------
// Phased start overlay (only used when the services provide `startPhase`)
// ---------------------------------------------------------------------------------------------

const spin = keyframes`
    to { transform: rotate(360deg); }
`

const Spinner = styled.span`
    display: inline-block;
    box-sizing: border-box;
    width: 1.3vh;
    height: 1.3vh;
    min-width: 10px;
    min-height: 10px;
    margin-right: 0.5vw;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    vertical-align: middle;
    animation: ${spin} 0.9s linear infinite;

    @media (prefers-reduced-motion: reduce) {
        animation: none;
        border-right-color: currentColor;
        opacity: 0.6;
    }
`

const Muted = styled.span`
    color: #999999;
`

const HelperLine = styled.div`
    height: 2.6vh;
    line-height: 2.6vh;
    text-align: center;
    color: #999999;
    font-size: 90%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`

const PhasedDetails = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: left;
    padding: 0 1vw;
`

const PhasedRow = styled.div`
    height: 2.6vh;
    line-height: 2.6vh;
    display: flex;
    flex-direction: row;
    align-items: center;
`

const RowLabel = styled.div`
    width: 40%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

const RowStatus = styled.div`
    width: 32%;
    white-space: nowrap;
`

const RowActions = styled.div`
    width: 28%;
    display: flex;
    justify-content: flex-end;
    gap: 0.8vw;
    font-size: 90%;
`

const Divider = styled.div`
    height: 1.5vh;
    display: flex;
    align-items: center;
    gap: 0.5vw;
    color: #999999;
    font-size: 70%;

    &::after {
        content: '';
        flex: 1;
        border-top: 1px solid #666666;
    }
`

// Seconds of converted video after which an AVI ride can start
const AVI_PLAYABLE_SECONDS = 200

export const getPhaseHeading = (startPhase, startContent) => {
    if (startPhase === 'ready')
        return 'Ready to ride'
    if (startPhase === 'content') {
        switch (startContent?.kind) {
            case 'streetview': return 'Preparing Street View ...'
            case 'video': return startContent.progress ? 'Preparing video ...' : 'Loading video ...'
            case 'map':
            case 'satellite': return 'Loading map ...'
            default: return 'Preparing route ...'
        }
    }
    return 'Starting devices ...'
}

/** progress towards "playable" (not towards the end of the file), capped at 99 until the video is loaded */
export const getConvertPercent = (progress) => {
    const pct = progress?.convertPct ?? 0
    const byTime = progress?.convertSeconds ? (progress.convertSeconds / AVI_PLAYABLE_SECONDS) * 100 : 0
    return Math.min(99, Math.round(Math.max(pct, byTime)))
}

export const getReadyHelperText = (info) => {
    const pending = info?.pendingSensors ?? []
    const notConnected = info?.notConnectedSensors ?? []
    const total = pending.length + notConnected.length

    if (total > 1)
        return 'Some sensors aren\'t connected yet. You can start without them.'
    if (pending.length === 1)
        return `${pending[0]} is still connecting. You can start without it.`
    if (notConnected.length === 1)
        return `${notConnected[0]} isn't connected. You can start without it.`
    if (info?.viewFallback)
        return 'Street View isn\'t available right now. You\'ll ride with the Map.'
    return null
}

const getDeviceState = (device) => {
    if (device.startState)
        return device.startState
    const { state, status } = device
    if (state === GEAR_STATES.START_OK || status === 'Started') return 'started'
    if (state === GEAR_STATES.START_FAILURE || state === GEAR_STATES.ERROR || status === 'Error')
        return (device.isControl || device.isMandatory) ? 'failed' : 'not-connected'
    return 'starting'
}

const PhasedDeviceStatus = ({ device }) => {
    const startState = getDeviceState(device)
    switch (startState) {
        case 'started':
            return <Success>✓ Started</Success>
        case 'failed':
            return <ErrorText>Failed</ErrorText>
        case 'not-connected':
            return <Warning>▲ Not connected</Warning>
        case 'ignored':
            return <Muted>– Ignored</Muted>
        case 'uploading':
            return <><Spinner aria-hidden='true' />{device.stateText?.length > 0 ? device.stateText : 'Uploading ...'}</>
        case 'starting':
        default:
            return <><Spinner aria-hidden='true' />{device.slow ? 'Still starting ...' : 'Starting ...'}</>
    }
}

const PhasedContentStatus = ({ content, videoProgress, mapStateText }) => {
    const { kind, state, progress } = content

    if (state === 'ready')
        return <Success>✓ {kind === 'video' ? 'Started' : 'Loaded'}</Success>
    if (state === 'unavailable')
        return <Warning>▲ Unavailable – using Map</Warning>
    if (state === 'failed')
        return <ErrorText>Failed</ErrorText>
    if (state === 'waiting')
        return <Muted>○ Waiting</Muted>

    // loading
    let text = 'Loading ...'
    if (kind === 'video') {
        if (progress)
            text = `Preparing (${getConvertPercent(progress)}%)`
        else if (videoProgress?.loaded && videoProgress?.bufferTime > 0)
            text = `Buffering (${Math.round(videoProgress.bufferTime)}s)`
        else if (videoProgress?.loaded)
            text = 'Buffering ...'
        else
            text = 'Starting ...'
    }
    else if (kind === 'streetview' && mapStateText)
        text = mapStateText
    return <><Spinner aria-hidden='true' />{text}</>
}

export const OverlayStartingPhased = (props) => {
    const { devices, startPhase, startSlow, startContent, startReadyInfo, readyToStart, videoProgress,
        viewState, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT, top = DEFAULT_TOP, left = DEFAULT_LEFT } = props

    const isControl = (d) => d.isControl || d.isMandatory
    const controls = (devices ?? []).filter(isControl)
    const sensors = (devices ?? []).filter(d => !isControl(d))

    const heading = getPhaseHeading(startPhase, startContent)

    const isConverting = startContent?.kind === 'video' && startContent.progress !== undefined && startContent.state === 'loading'
    let line = null
    if (startSlow)
        line = 'This is taking longer than usual.'
    else if (isConverting)
        line = 'This video has to be prepared before it can play. This can take a minute.'
    else if (startPhase === 'ready')
        line = getReadyHelperText(startReadyInfo)

    const svSlow = startContent?.kind === 'streetview' && viewState === 'slow'
    const contentSlowText = svSlow ? 'Still loading ...' : undefined

    const renderRow = (device) => {
        const startState = getDeviceState(device)
        const logContext = { device: device.name, isControl: isControl(device) }
        return <PhasedRow key={device.udid ?? device.name}>
            <RowLabel title={device.name}>{device.name}</RowLabel>
            <RowStatus><PhasedDeviceStatus device={device} /></RowStatus>
            <RowActions>
                {device.canRetry && startState !== 'started' ?
                    <LinkButton label='Retry' ariaLabel={`Retry ${device.name}`} logContext={logContext}
                        onClick={() => props.onRetryDevice?.(device.udid)} /> : null}
                {device.canIgnore && startState !== 'started' && startState !== 'ignored' ?
                    <LinkButton label='Ignore' ariaLabel={`Ignore ${device.name}`} logContext={logContext}
                        onClick={() => props.onIgnoreDevice?.(device.udid)} /> : null}
            </RowActions>
        </PhasedRow>
    }

    return (
        <OverlayView visible={true} width={width} left={left} height={height} top={top}>
            <OverlayText>
                <b>{heading}</b>
            </OverlayText>
            <HelperLine>{line}</HelperLine>
            <PhasedDetails className='startoverlay-details'>
                {controls.map(renderRow)}
                {startContent ? <PhasedRow>
                    <RowLabel>{startContent.label}</RowLabel>
                    <RowStatus><PhasedContentStatus content={startContent} videoProgress={videoProgress} mapStateText={contentSlowText} /></RowStatus>
                    <RowActions />
                </PhasedRow> : null}
                {sensors.length > 0 ? <Divider role='separator'>Optional</Divider> : null}
                {sensors.map(renderRow)}
            </PhasedDetails>
            <OverlayButtons>
                {readyToStart ? <Button margin={'1.2vh 1.1vw'} primary={startPhase === 'ready'} onClick={() => props.onIgnore?.()}>Start </Button> : null}
                {startContent?.kind === 'streetview' && viewState === 'slow' ? <Button margin={'1.2vh 1.1vw'} onClick={() => props.onStartWithMap?.()}>Start with Map </Button> : null}
                <Button margin={'1.2vh 1.1vw'} onClick={() => props.onCancel?.()}>Cancel </Button>
            </OverlayButtons>
        </OverlayView>
    )
}

export const StartRideOverlay = (props) => {
    const {mode,rideState,devices,videoState,mapType, mapState,mapStateError, videoStateError,
        viewState,
        visible=true,width=DEFAULT_WIDTH,height=DEFAULT_HEIGHT,top=DEFAULT_TOP,left=DEFAULT_LEFT,videoProgress={}
    } = props;

    // Street View-specific content only - gated on viewState so Video, Workout-only and
    // Map/Satellite starts render exactly as today.
    const isStreetViewStart = viewState !== undefined

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

    const onStartWithMap = () => {
        if (props.onStartWithMap) props.onStartWithMap();
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

    // Street View row text - only used when isStreetViewStart
    const viewStateText = ()=> {
        switch (viewState) {
            case 'loaded': return <Success>Loaded</Success>
            case 'unavailable': return <Warning>Unavailable – using Map</Warning>
            case 'loading': return 'Loading ...'
            case 'slow': return 'Still loading ...'
            case 'waiting':
            default: return 'Waiting'
        }
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
        // "Preparing Street View ..." only while it's actually loading.
        // Every other case - including every non-Street-View start - keeps today's heading.
        const heading = isStreetViewStart && (viewState==='loading' || viewState==='slow')
            ? 'Preparing Street View ...'
            : 'Starting activity ...'

        return (
            <OverlayView visible={true}  width={width} left={left} height={height} top={top}>
                <OverlayText >
                    <b>{heading}</b>
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
                        <Status>{isStreetViewStart ? viewStateText() : mapStateText()}</Status>
                    </OverlayDetailsItem> : null}
                </OverlayDetails>
                <OverlayButtons >
                    {props.readyToStart ? <Button margin={'1.2vh 1.1vw'} onClick={()=>onIgnore()}>Start </Button> : null}
                    {isStreetViewStart && viewState==='slow' ? <Button margin={'1.2vh 1.1vw'} onClick={()=>onStartWithMap()}>Start with Map </Button> : null}
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

    // phased renderer: failed sensors are handled inline on their row, so no separate sensor-error screen
    if (props.startPhase !== undefined)
        return <OverlayStartingPhased {...props} />

    if (isSensorError())
        return OverlaySensorError(props);

    return OverlayStarting(props);


}


