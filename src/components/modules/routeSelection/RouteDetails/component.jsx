import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {FileDirectoryIcon } from '@primer/octicons-react'

import {Button,ButtonBar, Divider, EditNumber, SingleSelect,Column, Overlay, Row,
        Text, Loader, EditText,ErrorBoundary, CheckBox, Image, Center, ErrorText, SegmentedControl } from '../../../atoms'
import {  Dialog, Dropzone, FreeMap,ElevationGraph, GradientBands, VideoProbe } from '../../../molecules'
import {VideoPreview } from '../../video'
import { useUnitConverter } from 'incyclist-services'
import { EventLogger } from 'gd-eventlog'

const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
    width: calc(100% - 0.8vw);
    padding-left:0.4vw;
    padding-right:0.4vw;
    overflow-y: auto;
`

// never yields its height to the rows the smoothing control adds below it - those absorb their
// own overflow (ContentArea scrolls) instead of squeezing the map/chart above them
const PreviewRow = styled(Row)`
    width: 100%;
    flex-shrink: 0;
`

const Preview = styled(Column)`
    position: relative;
    width: calc(50% - 0.25vw);
    height: 30vh;
    flex-shrink: 0;
    padding-right: ${props => props?.position==='left'? '0.25vw' :undefined};
    padding-left: ${props => props?.position==='right'? '0.25vw' :undefined};
    margin-bottom: 1vh;

`
// height is fixed per route type (video vs GPX), never toggled by the smoothing level - nothing
// in this container may change size or position as a consequence of the level a user picks
const ElevationContainer = styled(Column)`
    width:100%;
    height: ${props => props.height || '50%'};
    position:absolute;
    bottom:0;
    left:0;
    z-index: 100;
    background: none;
    opacity: ${props => props.dimmed ? 0.6 : 1};
`

// leaves room for the gradient bands below it inside the fixed-height ElevationContainer
const GraphSlot = styled.div`
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    position: relative;
`

// GradientBands renders through Autosize, which defaults an unset height to CSS `height:100%`.
// With no explicit height of its own, this wrapper's height stays content-based (`auto`), which
// makes that 100% resolve to `auto` too (percentage heights against a non-definite ancestor height
// compute to auto per spec) - so GradientBands sizes to its real ~2-row content instead of
// claiming the whole panel as its flex-basis and starving GraphSlot next to it down to nothing.
const BandsSlot = styled.div`
    flex: 0 0 auto;
    width: 100%;
`

// aligns the copy with the chips rather than with the label column (10vw label + 0.4vw margin)
const SmoothingCopy = styled.div`
    padding: 0 0 1vh 10.4vw;
    opacity: ${props => props.dimmed ? 0.6 : 1};
`

const SmoothingNote = styled.div`
    font-size: 1.2vh;
    color: #EEEEEE;
`

const SmoothingDetail = styled.div`
    font-size: 1.1vh;
    color: #9fa4a8;
    padding: 0.3vh 0 0 0;
`

const ErrorRow = styled.div`
    text-overflow: ellipsis;
    width: 18vw;
    overflow: hidden;
`

const ROUTE_LINE_COLOR = '#9fa4a8'
const PROFILE_LINE = { color: 'white' }

const buildSmoothingOptions = (maxLevel) => {
    const levels = Number.isFinite(maxLevel) && maxLevel>0 ? Math.round(maxLevel) : 0
    const options = [{value:0, label:'Off'}]
    for (let level=1; level<=levels; level++)
        options.push({value:level, label:String(level)})
    return options
}

const formatDelta = (smoothed, original) => {
    const delta = Math.round(smoothed-original)
    return delta>0 ? `+${delta}` : `−${Math.abs(delta)}`
}
export const RouteDetails = ( {route, markers,segment, startPos,endPos,realityFactor,downloadProgress,convertOngoing, convertSupported,convertProgress,activeRides, convertError,downloadOngoing, downloadError,canStart=true,isOnline=true, requestVideoDir=false,
                                showLoopOverwrite=false, showNextOverwrite=false,
                                videoChecking, videoMissing, onVideoSelected,videoDir, 
                                loopOverwrite, nextOverwrite,showWorkout,
                                totalDistance, totalElevation, xScale, yScale,
                                smoothingLevel, smoothingAvailable=false, smoothingMaxLevel=0, smoothedElevation, smoothedPoints, smoothedGradient, onSmoothingPreview,
                                showPrev=false,prevRides,onRefresh,onPrevRidesClicked,loading,onChangeVideoDir,
                                onStart, onCancel,onDownload, onCancelDownload,onConvert,onCancelConvert,onSelectVideoDir, onAddWorkout,updateMarkers, updateStartPos })=>{


    const [dialogState,setDialogState] = useState(null)
    const [initialized,setInitialized] = useState(false)

    const routeDescr = route.description??{}
    const routeData = route.details??{}
    const points = routeDescr?.points??routeData?.points

    if (!routeData.points) routeData.points = points

    const dataFromProps = {
        startPos:startPos===undefined ? {value:0, unit:totalDistance?.unit??'km'} : startPos,
        endPos,
        realityFactor:realityFactor===undefined ? 100: realityFactor,
        segment,
        markers,prevRides,
        loopOverwrite, nextOverwrite,showPrev,
        smoothingLevel: smoothingLevel??0
    }

    const [data,setData] = useState(dataFromProps)

    // a route that was left with a level of 1..5 arrives already smoothed - the profile and the
    // figures have to show that before the user touches the control
    const [smoothing,setSmoothing] = useState({level: smoothingLevel??0, smoothedPoints, smoothedElevation, smoothedGradient})
    const [pendingLevel,setPendingLevel] = useState(null)

    const logger = new EventLogger('Incyclist')


    useEffect( ()=>{
        if (initialized)
            return

        setInitialized(true)
        setData(dataFromProps)

    },[dataFromProps, initialized ])

    useEffect(() => {
        setData(prev => ({...prev,showPrev,prevRides}))
    }, [showPrev, prevRides]);

    useEffect(() => {
        if (dialogState===null)
            setDialogState('open')

    }, [dialogState]);

    // the recompute runs one render after the tap, so the chip can show the new selection while the
    // chart and the figures are still showing (dimmed) the previous curve
    useEffect(() => {
        if (pendingLevel===null)
            return

        const level = pendingLevel
        let preview = {}

        try {
            if (level>0 && typeof onSmoothingPreview === 'function')
                preview = onSmoothingPreview(level)??{}
        }
        catch (err) {
            new EventLogger('Incyclist').logEvent({message:'error',fn:'smoothingPreview', error:err.message, stack:err.stack})
        }

        setPendingLevel(null)
        setSmoothing({level, smoothedPoints:preview.smoothedPoints, smoothedElevation:preview.smoothedElevation, smoothedGradient:preview.smoothedGradient})

    }, [pendingLevel, onSmoothingPreview]);

    const close = async () =>{
        setInitialized(false)
        setDialogState('closed')
        await new Promise(done => process.nextTick(()=>{done()}))
    }

    const onStartClicked = async (i) => {       
        
        if (onStart) {
            onStart( data) // + segment or start/end + realityFactor 
            await close();
        }
    }

    const onCancelClicked = async (i) => {       
        if (onCancel) {
            await close();
            onCancel( data)
        }
    }

    const onDownloadClicked = async (i) => {       
        if (onDownload) {
            onDownload( )
        }
    }
    const onAddWorkoutClicked = async (i) => {      
        if (onAddWorkout) {
            onAddWorkout(data )
        }
    }


    const onConvertClicked = async (i) => {       
        if (onConvert) {
            onConvert( )
        }
    }

    const onStopDownloadClicked = async (i) => {       
        if (onCancelDownload) {
            onCancelDownload( )
        }
    }

    const onStopConvertClicked = async (i) => {       
        if (onCancelConvert) {
            onCancelConvert( )
        }
    }

    const checkPrevRides = (updated)=> {
        if (onRefresh) {
            onRefresh(updated).then( ({prevRides,showPrev}) => { 
                setData( {...updated,prevRides,showPrev} )
            })
        }


    }

    const onStartPosChanged =(update) => {
        try {


            if (!updateStartPos || typeof updateStartPos !=='function')
                return;

            const updated = updateStartPos(update, data)
            if (!updated)
                return

            setData( prev => {
                try {
                    const {startPos, endPos,segment} = updated
                    let markers = prev.markers
                    if (updateMarkers) {
                        markers = updateMarkers(startPos)
                        if (markers.length===0)
                            markers = prev.markers
                    }


                    const newData = {...prev,startPos, endPos,segment,markers}
                    checkPrevRides(newData)

                    return newData
                }
                catch {}        
                return prev
            })
        }
        catch (err) {
            logger.logEvent({message:'error',fn:'onStartPosChanged', error:err.message, stack:err.stack})
        }            
    }

    const onSegmentChanged =(value) => {
        const converter = useUnitConverter();

        try {
            const prev = data.segment||'Please select ...'
            
            if (value!==prev) {


                data.segment = value
                const segmentDefs = routeDescr?.segments??[]
                
                const seg = segmentDefs.find(s => s.name === value);

                if (!seg)
                    return;

                const startPos = { 
                    value: converter.convert(seg.start, 'distance', { from: 'm', to: data.startPos?.unit ?? 'km' }), 
                    unit: data.startPos?.unit ?? 'km' 
                }
                const endPos = seg.end ? { 
                    value: converter.convert(seg.end, 'distance', { from: 'm', to: data.startPos?.unit ?? 'km' }), 
                    unit: data.startPos?.unit ?? 'km' 
                } : undefined


                if (startPos?.value!==undefined && (startPos.value!==data.startPos?.value || endPos!==data.endPos?.value)) {
                    setData( prev=> {
                        const updated = {...prev}
                        updated.startPos = startPos
                        updated.endPos = endPos
                        if (updateMarkers) {
                            updated.markers = updateMarkers(updated)
                        }
                        checkPrevRides(updated)
                    
                        return updated    
                    } )
                }
            }
    
        }        
        catch (err) {
            logger.logEvent({message:'error',fn:'onSegmentChanged', error:err.message, stack:err.stack})
        }            
    }

    const onRealityFactorChanged =(value) => {


        if (value===data.realityFactor)
            return;

        try {
            setData( prev => {
                const updated = {...prev,realityFactor: value}
                checkPrevRides(updated)

                return updated
            })
        }
        catch (err) {
            logger.logEvent({message:'error',fn:'onRealityFactorChanged', error:err.message, stack:err.stack})
        }            
    }

    // selecting a level only previews it - it is written to the settings when the ride is started
    const onSmoothingLevelChanged = (value) => {
        const level = Number(value)

        if (level===(pendingLevel??smoothing.level))
            return

        setData( prev => ({...prev, smoothingLevel: level}))
        setPendingLevel(level)
    }

    const onLoopOverwriteChanged = (value) => {
        setData( prev => ({...prev,loopOverwrite: value}))
    }

    const onNextOverwriteChanged = (value) => {
        setData( prev => ({...prev,nextOverwrite: value}))
    }
    const onCompareRidesChanged = (value) => {
        if (typeof onPrevRidesClicked === 'function') onPrevRidesClicked(value)
        setData( prev => ({...prev,showPrev: value}))
    }

    const getRouteType = () => {
        const {isLoop,hasVideo} = routeDescr

        let routeType = `${hasVideo?'Video':'GPX'} - ${isLoop? 'Loop':'Point to Point'}`
        return routeType
    }

    const onMapPositionChanged = (position) => {
        try {
            const {routeDistance} = position||{}
            onStartPosChanged(routeDistance/1000)
        }
        catch  {}
    }

    const parseConvertError = (error) => {
        const parts = error.split(':')
        return parts.filter( p=> !p.startsWith('ffmpeg')).join(':')
    }

    const getSegments = (route) => {
        try {
            return route?.segments?.map(s=>s.name) 
        }
        catch(err) {
            return []
        }
    }
   
    const common= { labelWidth:'10vw', labelPosition:'before', align:'right'}

    
    const distance = routeDescr?.distance ? (routeDescr.distance/1000).toFixed(1) : undefined
    const elevation = routeDescr?.elevation ? (routeDescr.elevation).toFixed(0) : undefined

    const selectedSmoothingLevel = pendingLevel??smoothing.level??0
    const smoothingOptions = buildSmoothingOptions(smoothingMaxLevel)
    const smoothingComputing = pendingLevel!==null
    const smoothingOn = smoothingAvailable && selectedSmoothingLevel>0
    const smoothedProfile = smoothingOn && smoothing.smoothedPoints?.length>0 ? smoothing.smoothedPoints : undefined
    const routeElevation = Number(totalElevation?.value??elevation)
    const smoothedElevationValue = smoothingOn ? smoothing.smoothedElevation?.value : undefined
    const showSmoothedElevation = Number.isFinite(smoothedElevationValue) && Number.isFinite(routeElevation)
    const elevationUnit = smoothing.smoothedElevation?.unit??totalElevation?.unit??'m'

    const profileRouteData = smoothedProfile ? {...routeData, points: smoothedProfile} : routeData
    const profileVersion = smoothedProfile ? `smoothed-${smoothing.level}` : 'route'

    // the bands container mounts whenever the control could be offered at all - Off included - so
    // its height is reserved and nothing here resizes when the level changes. But at Off there is
    // nothing to compare against, so neither band draws content there - only its reserved rows do.
    const showGradientBands = smoothingAvailable
    const bandRouteData = smoothingOn ? routeData : null
    const smoothedBandRouteData = smoothedProfile ? profileRouteData : null

    const gradient = smoothingOn ? smoothing.smoothedGradient : undefined
    const smoothingBarelyVisible = gradient?.hasVisibleEffect === false

    const buildSmoothingDetail = () => {
        if (!smoothingOn) return ' '
        if (smoothingBarelyVisible) return 'This level changes very little on this route — try a higher one.'

        const routeSteepest = Number.isFinite(gradient?.routeSteepest) ? Math.round(gradient.routeSteepest) : undefined
        const smoothedSteepest = Number.isFinite(gradient?.smoothedSteepest) ? Math.round(gradient.smoothedSteepest) : undefined
        const gradientPart = (routeSteepest!==undefined && smoothedSteepest!==undefined)
            ? `Steepest gradient ${routeSteepest}% → ${smoothedSteepest}%. ` : ''

        if (!showSmoothedElevation) return gradientPart || ' '

        return `${gradientPart}This ride records ${smoothedElevationValue} ${elevationUnit} elevation gain instead of ${routeElevation} ${elevationUnit}.`
    }

    const {previewUrl,videoUrl,videoFormat,isLocal,requiresDownload,isDownloaded, hasVideo}   = routeDescr||{}
    const localVideoFile = hasVideo && ( isLocal  && !videoUrl?.startsWith('http'))

    const showStopDownload = downloadOngoing && !requestVideoDir && ( downloadProgress!==100 && downloadError===undefined)
    const showRetryDownload = downloadError!==undefined
    const showDownloadButton = !downloadOngoing && hasVideo && (requiresDownload || !localVideoFile) && !isDownloaded && !showStopDownload  && !showRetryDownload
    
    const showVideoDir = downloadOngoing //&& requestVideoDir

    const showRetryConvert = convertError!==undefined
    const showStopConvert = convertOngoing && (convertProgress!==100 && convertError===undefined )
    const showConvert = !convertOngoing && convertSupported && hasVideo && isLocal && videoFormat==='avi' && !showStopConvert && !showRetryConvert

    const showSettings = !showStopConvert && !showStopDownload && !showRetryConvert && !showRetryDownload && !showVideoDir
    const showStart = !showStopConvert && showSettings && (!requiresDownload || isDownloaded)
    const canChangeStartpos = (!hasVideo ||videoFormat==='mp4' )
    
    let segments = getSegments(routeDescr)
    const startMarker = (data.markers??[])[0]

    let videoPath 
    let onDrop = ()=>{} 
    const filters = [{name: 'Video files', extensions: ['mp4','avi'] }]

    if (hasVideo && videoMissing && videoUrl) {
        videoPath = videoUrl.replace('file:///','').replace('video:///','')
        if (onVideoSelected)
            onDrop = onVideoSelected
    }

    let offlineWarning = points && routeDescr.hasGpx ? <Center>You are offline (no network)<br/>Map cannot be displayed</Center> : <Center>You are offline (no network)</Center>


    if (loading)
        return  <Dialog id='RouteDetails' log={{title:routeDescr?.title}} title={routeDescr?.title} /*onOutsideClicked={onUserCancel}*/ width="60vw" height="70vh" zIndex={100} onESC={onCancelClicked}> 
            <ContentArea>
                <Row align='center' justify='center' height='100%'>
                    <Loader/>
                </Row>
                
            </ContentArea>
            <ButtonBar justify='center'>
                <Button text='Cancel' primary={!canStart && !isOnline} onClick = { onCancelClicked}/>
            </ButtonBar>

        </Dialog>

    if (!initialized)
        return false

    return (
        <ErrorBoundary>
            <Dialog id='RouteDetails' log={{title:route?.title}} title={route?.title} /*onOutsideClicked={onUserCancel}*/ width="60vw" height="70vh" zIndex={100} onESC={onCancelClicked}>
            {hasVideo && videoUrl && !videoMissing && videoFormat!=='avi' ? <VideoProbe url={videoUrl} routeId={routeDescr?.id} extension={videoFormat}/> : null}
            <ContentArea>

                <PreviewRow>
                <Preview position='left'>
                    {!isOnline ? <div style={{zIndex:1000}}>{offlineWarning}</div>:null}
                    {points && isOnline && routeDescr?.hasGpx ? <FreeMap  zoomControl={true} points={points} startPos={0} draggable={canChangeStartpos} marker={startMarker} onPositionChanged={onStartPosChanged}/>
                    : null}
                    {points && !routeDescr?.hasGpx ?
                        <ElevationContainer height='50%' dimmed={smoothingComputing}>
                            <GraphSlot>
                                <ElevationGraph zoneCalc={{speed:20,weight:85,ftp:226,realityFactor:data.realityFactor}}  position={data.startPos}
                                                routeData={profileRouteData} dataVersion={profileVersion}
                                                xScale={xScale} yScale={yScale} line={PROFILE_LINE} showYAxis={false} showXAxis={true} backgroundColor='white' pctReality={data.realityFactor}
                                />
                            </GraphSlot>
                            {showGradientBands ?
                                <BandsSlot>
                                    <GradientBands routeData={bandRouteData} smoothedRouteData={smoothedBandRouteData}
                                                   pctReality={data.realityFactor} bandHeight='8px' dimmed={smoothingComputing} active={smoothingOn}/>
                                </BandsSlot>
                            : null}
                        </ElevationContainer>
                    : null}

                </Preview>
                <Preview position='right'>
                        {previewUrl&&!videoMissing&&hasVideo  ? <Image width='100%' height={points  ? 'calc(100% - 3vh)' : '100%'} src={previewUrl}/>
                        : null}

                        {!previewUrl&&videoUrl&&!videoChecking&&!videoMissing ? <VideoPreview url={videoUrl} background='none' autoPlay={false}/>
                        : null}

                        {videoChecking ? <Center><Loader/></Center> : null}     

                        {videoMissing ?
                            <Overlay zIndex={1000} width='60%' height='60%' left='20%' top='20%' opacity='0.9' padding='5px' border='red'> 
                                <Column height='100%' position='relative' >
                                    <Row height='50%'  justify='start' align='start' >
                                        <Column>
                                            <Row>
                                                <ErrorText size='1.5vh'>
                                                    <b>Video file could not be opened:</b><br/>
                                                    <ErrorRow>
                                                    {videoPath}
                                                    </ErrorRow>
                                                </ErrorText>
                                            </Row>
                                            <Row>                                                    
                                                <Text size='1.5vh'>Please select the correct video file</Text>
                                            </Row>
                                        </Column>

                                    </Row>

                                    <Row height='50%' style={{minHeight:'50%'}} >
                                        <Dropzone label='Upload Video' onDrop = {onDrop}multiple={false} filters={filters}/>  
                                    </Row>
                                </Column>

                            </Overlay>
                                : null }

                        {points && routeDescr?.hasGpx ?
                            // fixed permanently by route type, not by the smoothing level: a video
                            // route keeps its still and its strip; a GPX route gets the panel's
                            // otherwise-empty space, in every state, Off included (never both 30%
                            // and 100% for the same route - that was the resize this replaces)
                            <ElevationContainer height={hasVideo ? '30%' : '100%'} dimmed={smoothingComputing}>
                                <GraphSlot>
                                    <ElevationGraph zoneCalc={{speed:20,weight:85,ftp:226,realityFactor:data?.realityFactor}} position={data.startPos}
                                                    routeData={profileRouteData} dataVersion={profileVersion}
                                                    xScale={xScale} yScale={yScale}  line={PROFILE_LINE} showYAxis={false} showXAxis={true} backgroundColor='white' pctReality={data?.realityFactor}
                                    />
                                </GraphSlot>
                                {showGradientBands ?
                                    <BandsSlot>
                                        <GradientBands routeData={bandRouteData} smoothedRouteData={smoothedBandRouteData}
                                                       pctReality={data?.realityFactor} bandHeight='8px' dimmed={smoothingComputing} active={smoothingOn}/>
                                    </BandsSlot>
                                : null}
                            </ElevationContainer>
                        : null}


                </Preview>
                </PreviewRow>
                <Row>
                    <Column width='50%'>
                        <Text {...common} label='Distance' text={totalDistance?.value??distance} unit={totalDistance?.unit??'km'} />
                        <Text {...common} noPadding label='Elevation' text={totalElevation?.value??elevation} unit={totalElevation?.unit??'m'} />
                        {/* the row's height is reserved even at Off (an empty line, not a collapsed
                            one) so switching a level in or out never reflows anything below it -
                            omitting the label keeps document.getElementById('Smoothed') null, as
                            it was before, while the row itself still occupies its line */}
                        <Text {...common} size='1.2vh' color={ROUTE_LINE_COLOR} style={{opacity: smoothingComputing? 0.6:1}}
                              label={showSmoothedElevation ? 'Smoothed' : undefined}
                              text={showSmoothedElevation ? `${smoothedElevationValue} ${elevationUnit} (${formatDelta(smoothedElevationValue,routeElevation)} ${elevationUnit})` : ' '} />
                    </Column>
                    <Column width='50%'>
                        {videoFormat ? <Text {...common} label='Video Format' text={videoFormat.toUpperCase()}  /> : null}
                        <Text {...common} label='Route Type' text={getRouteType()}  /> 
                    </Column>

                </Row>
                <Divider width='90%' />
                
                {showSettings && routeDescr?.segments?.length ? 
                    <SingleSelect label='Segment' disabled={videoFormat==='avi'} selected={data.segment??null} options={segments} 
                        onValueChange={onSegmentChanged} {...common} align='left'/>
                : null }
                {showSettings ?
                    <EditNumber label='Start at' unit={data.startPos?.unit??totalDistance?.unit??'km'} min={0} max={totalDistance?.value??routeDescr.distance/1000} digits={1} value={data.startPos?.value} maxLength={5} disabled={videoFormat==='avi'} 
                        onValueChange={onStartPosChanged} {...common} /> : null}
                {showSettings ?
                    <EditNumber  unit='%' label='Reality Factor' min={0} max={100} digits={0} value={data.realityFactor} maxLength={5}
                        onValueChange={onRealityFactorChanged} {...common} />
                : null}

                {showSettings && smoothingAvailable ?
                    <>
                        <SegmentedControl label='Terrain Smoothing' options={smoothingOptions} value={selectedSmoothingLevel}
                            onValueChange={onSmoothingLevelChanged} {...common} />
                        {/* both lines are always rendered, sized to the tallest (two-line) state,
                            so the block occupies the same height whether it is Off, On, or On but
                            barely doing anything on this route - nothing below it reflows */}
                        <SmoothingCopy dimmed={smoothingComputing}>
                            {smoothingOn ?
                                <SmoothingNote>Riding a smoothed profile. Your saved route is unchanged.</SmoothingNote>
                            :   <SmoothingNote>Softens sharp gradient changes for steadier trainer resistance.</SmoothingNote>}
                            <SmoothingDetail>{buildSmoothingDetail()}</SmoothingDetail>
                        </SmoothingCopy>
                    </>
                : null}

                {showLoopOverwrite ?
                    <CheckBox label='Stop at end of loop' min={0} max={100} digits={0} value={data.loopOverwrite} 
                        onValueChange={onLoopOverwriteChanged} {...common} />
                : null}
                {showNextOverwrite ?
                    <CheckBox label='Stop at end of current movie' min={0} max={100} digits={0} value={data.nextOverwrite} 
                        onValueChange={onNextOverwriteChanged} {...common} />
                : null}
                {data.prevRides ?
                    <CheckBox label='Compare against previous rides' min={0} max={100} digits={0} value={data.showPrev} 
                        onValueChange={onCompareRidesChanged} {...common} />
                : null}
 
                {showStopConvert ? <Row height='5vh' align='center'>
                    <Text {...common} height='4vh'  align='center' noPadding label='Conversion' text=""/>
                    <Loader size='4vh' progress={convertProgress}/>
                    <Button size='small' text='Stop' secondary={true} onClick={onStopConvertClicked}/>
                </Row> :null}
                {showRetryConvert ? <Row height='5vh' align='center'>
                    <Text {...common} height='4vh'  align='center' noPadding label='Conversion' error={true} text={parseConvertError(convertError)} />
                    <Button size='small' text='Retry' secondary={true} onClick={onConvertClicked}/>
                </Row> :null}

                {showVideoDir?
                <Row>
                    <Column>
                        {!videoDir ? <Text {...common}  padding={'0 0 0.5vh 0'} noPadding text="Please specify the directory the videos should be stored:"/> : null }
                        <Row>
                            <EditText {...common} align='left' disabled={true} noPadding label='Directory' value={videoDir || 'click button to select ...'}/>
                            {!videoDir ? 
                                <Button  size='small' margin='0 0 0 0.5vw' onClick={onSelectVideoDir} id={'select video dir'} ><FileDirectoryIcon/></Button> :
                                <Button size='small' margin='0 0 0 0.5vw' text='Change' secondary={true} onClick={onChangeVideoDir}/>
                            }
                        </Row>
                    </Column>
                </Row> :null}
                {showStopDownload ? <Row height='5vh' align='center'>
                    <Text {...common} height='4vh'  align='center' noPadding label='Download' text=""/>
                    <Loader size='4vh' progress={downloadProgress}/>                
                    <Button size='small' text='Stop' secondary={true} onClick={onStopDownloadClicked}/>
                </Row> :null}
                {showRetryDownload ? <Row height='5vh' align='center'>
                    <Text {...common} height='4vh'  align='center' noPadding label='Download' error={true} text={downloadError} />
                    <Button size='small' text='Retry' secondary={true} onClick={onDownloadClicked}/>
                </Row> :null}

    
                
            </ContentArea>
            <ButtonBar justify='center'>
                {showStart ? <Button primary={canStart} text='Start' disabled={!canStart} onClick = { onStartClicked}/> : null}
                <Button text='Cancel' primary={!canStart && !isOnline} onClick = { onCancelClicked}/>
                {showStart && showWorkout ? <Button primary={false} disabled={!canStart} secondary={true} text='Start With Workout' onClick = { onAddWorkoutClicked}/>: null} 
                {showDownloadButton ? <Button primary={!showStart && isOnline} disabled={!isOnline} secondary={showStart} text='Download' onClick = { onDownloadClicked}/> : null}
                {showConvert ? <Button primary={false} secondary={true} text='Convert' onClick = { onConvertClicked}/> : null}            
            </ButtonBar>
            
        </Dialog>
        </ErrorBoundary>
    )
}