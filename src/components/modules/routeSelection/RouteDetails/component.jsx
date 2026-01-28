import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {FileDirectoryIcon } from '@primer/octicons-react'

import {Button,ButtonBar, Divider, EditNumber, SingleSelect,Column, Overlay, Row, 
        Text, Loader, EditText,ErrorBoundary, CheckBox, Image, Center, ErrorText } from '../../../atoms'
import {  Dialog, Dropzone, FreeMap,ElevationGraph } from '../../../molecules'
import {VideoPreview } from '../../video'

const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
    width: calc(100% - 0.8vw);
    padding-left:0.4vw;
    padding-right:0.4vw;
`

const Preview = styled(Column)`
    position: relative;
    width: calc(50% - 0.25vw);
    height: 30vh;
    padding-right: ${props => props?.position==='left'? '0.25vw' :undefined};
    padding-left: ${props => props?.position==='right'? '0.25vw' :undefined};
    margin-bottom: 1vh;
    
`
const ElevationContainer = styled(Row)`
    width:100%;
    height: ${props => props.height || '50%'};
    position:absolute;
    bottom:0;
    left:0;
    z-index: 100;
    background: none;
`

const ErrorRow = styled.div`
    text-overflow: ellipsis;
    width: 18vw;
    overflow: hidden;
`
export const RouteDetails = ( {route, markers,segment, startPos,endPos,realityFactor,downloadProgress,convertOngoing, convertSupported,convertProgress,activeRides, convertError,downloadOngoing, downloadError,canStart=true,isOnline=true, requestVideoDir=false,
                                showLoopOverwrite=false, showNextOverwrite=false,
                                videoChecking, videoMissing, onVideoSelected,videoDir, 
                                loopOverwrite, nextOverwrite,showWorkout,
                                totalDistance, totalElevation, xScale, yScale,
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
        loopOverwrite, nextOverwrite,showPrev
    }

    const [data,setData] = useState(dataFromProps)


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
            console.log('# ERROR',err)
        }            
    }

    const onSegmentChanged =(value) => {
        try {
            const prev = data.segment||'Please select ...'
            if (value!==prev) {
                data.segment = value
                const start = Number(routeDescr?.segments.find( s=>s.name===value)?.start)
                const endPos = Number(routeDescr?.segments.find( s=>s.name===value)?.end)
    
                if (start!==undefined && (start!==data.startPos || endPos!==data.endPos)) {
                    setData( prev=> {
                        const updated = {...prev}
                        updated.startPos = start
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
        catch{}
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
        catch {}        
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
            <ContentArea>

                <Row>                
                <Preview position='left'>
                    {!isOnline ? <div style={{zIndex:1000}}>{offlineWarning}</div>:null}
                    {points && isOnline && routeDescr?.hasGpx ? <FreeMap  zoomControl={true} points={points} startPos={0} draggable={canChangeStartpos} marker={startMarker} onPositionChanged={onStartPosChanged}/>  
                    : null}
                    {points && !routeDescr?.hasGpx ?                     
                        <ElevationContainer height='50%'>
                            <ElevationGraph zoneCalc={{speed:20,weight:85,ftp:226,realityFactor:data.realityFactor}}  position={data.startPos}
                                            routeData={routeData} xScale={xScale} yScale={yScale} line={ {color:'white'}} showYAxis={false} showXAxis={true} backgroundColor='white' pctReality={data.realityFactor} 
                            />
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
                            <ElevationContainer height='30%'>
                                <ElevationGraph zoneCalc={{speed:20,weight:85,ftp:226,realityFactor:data?.realityFactor}} position={data.startPos}
                                                routeData={routeData} xScale={xScale} yScale={yScale}  line={ {color:'white'}} showYAxis={false} showXAxis={true} backgroundColor='white' pctReality={data?.realityFactor} 
                                />
                            </ElevationContainer>
                        : null}


                </Preview>
                </Row>
                <Row>
                    <Column width='50%'>
                        <Text {...common} label='Distance' text={totalDistance?.value??distance} unit={totalDistance?.unit??'km'} />
                        <Text {...common} label='Elevation' text={totalElevation?.value??elevation} unit={totalElevation?.unit??'m'} />
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