import React from 'react';
import styled, { keyframes } from 'styled-components';

import { Button, LinkButton, Overlay} from '../../../../atoms'

const DEFAULT_WIDTH = 'max(30vw, 480px)';
const DEFAULT_HEIGHT = 'fit-content';

// The box grows with its content (never below 30vh) and is centred without fixed offsets.
// Width is a floor so that the text columns keep a usable size in small windows.
const OverlayView = styled(Overlay)`
    box-sizing: border-box;
    inset: 0;
    margin: auto;
    max-width: calc(100vw - 32px);
    min-height: 30vh;
    max-height: calc(100vh - 32px);
    container: startoverlay / inline-size;
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
  flex: none;
  min-height: max(4.8vh, 2em);
  vertical-align: middle;
  line-height: 100%;
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align:center;
`

const OverlayDetails = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  vertical-align: middle;
  line-height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: safe center;
  align-content: center;
  flex-direction: column;
  text-align:left;
`

const OverlayButtons = styled.div`
  flex: none;
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
// Phased start overlay
// ---------------------------------------------------------------------------------------------

const spin = keyframes`
    to { transform: rotate(360deg); }
`

const Spinner = styled.span`
    display: inline-block;
    box-sizing: border-box;
    width: 1em;
    height: 1em;
    margin-right: 0.4em;
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
    flex: none;
    min-height: max(2.6vh, 1.5em);
    line-height: 1.3;
    text-align: center;
    color: #999999;
    font-size: 90%;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
`

const PhasedDetails = styled.div`
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    justify-content: safe center;
    text-align: left;
    padding: 0 1vw;
`

// One grid template for every row, so the columns line up across rows
const PhasedRow = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 9.5em 7em;
    column-gap: 0.75em;
    align-items: center;
    min-height: max(2.6vh, 1.6em);
    line-height: 1.25;

    @container startoverlay (max-width: 440px) {
        grid-template-columns: minmax(0, 1fr) 9.5em;
    }
`

const RowLabel = styled.div`
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
`

// rows without actions let the status use the actions column as well
const RowStatus = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    ${props => props.$wide ? 'grid-column: 2 / -1;' : ''}
`

const RowActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75em;
    font-size: 90%;

    @container startoverlay (max-width: 440px) {
        grid-column: 2;
        grid-row: 2;
        justify-self: end;
    }
`

const Divider = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5em;
    min-height: 1.5em;
    padding: 0.35em 0;
    line-height: 1;
    color: #999999;
    font-size: max(12px, 0.75em);

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
        case 'reconnecting':
            return <><Spinner aria-hidden='true' />{device.slow ? 'Still reconnecting ...' : 'Reconnecting ...'}</>
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
        viewState, width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT } = props

    const isControl = (d) => d.isControl || d.isMandatory
    const controls = (devices ?? []).filter(isControl)
    const sensors = (devices ?? []).filter(d => !isControl(d))

    const heading = getPhaseHeading(startPhase, startContent)

    const isConverting = startContent?.kind === 'video' && startContent.progress !== undefined && startContent.state === 'loading'
    const isReconnecting = controls.some(d => d.startState === 'reconnecting')
    let line = null
    if (isReconnecting)
        line = 'No response yet. Reconnecting automatically ...'
    else if (startSlow)
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
        <OverlayView visible={true} width={width} height={height}>
            <OverlayText>
                <b>{heading}</b>
            </OverlayText>
            <HelperLine>{line}</HelperLine>
            <PhasedDetails className='startoverlay-details'>
                {controls.map(renderRow)}
                {startContent ? <PhasedRow>
                    <RowLabel title={startContent.label}>{startContent.label}</RowLabel>
                    <RowStatus $wide><PhasedContentStatus content={startContent} videoProgress={videoProgress} mapStateText={contentSlowText} /></RowStatus>
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
    const {mode,devices,videoState,mapStateError, videoStateError,
        visible=true,width=DEFAULT_WIDTH,height=DEFAULT_HEIGHT
    } = props;

    const bikeError = devices?.find( d=>(d.isControl||d.isMandatory) && (d.state===GEAR_STATES.START_FAILURE || d.status==='Error') )!==undefined

    const onCancel = (reason) => {
        if (props.onCancel) props.onCancel(reason);
    }

    const onRetry = () => {
        if (props.onRetry) props.onRetry();
    }

    const isDeviceError = ()=>{
        return bikeError
    }

    const isVideoError = ()=>{
        if (mode!==RIDE_MODES.VIDEO && mode!=='Video')
            return false;
        return (videoState===VIDEO_STATES.START_FAILED || videoState==='Error');
    }

    const OverlayDeviceError = (props) => {
        return(
            <OverlayView visible={true} width={width} height={height}>
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

    const OverlayVideoError = (props) => {
        return(
            <OverlayView visible={true} width={width} height={height}>
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
            <OverlayView visible={true} width={width} height={height}>
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

    // failed sensors are handled inline on their row of the phased overlay
    return <OverlayStartingPhased {...props} />
}


