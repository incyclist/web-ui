import React, { useCallback, useEffect, useRef,useState } from 'react';
import styled from 'styled-components';
import { Observer } from 'incyclist-services';
import { EventLogger } from 'gd-eventlog';

import { Autosize, ErrorBoundary, Loader } from '../../atoms';
import { useUnmountEffect } from '../../../hooks';


export const VideoContainer = styled(Autosize)`
    width: ${props => props.width};
    height: ${props => props.height};   
`

export const VideoView = styled.video`
    object-fit:fill;
    width:100%;
    height:100%;

    // display: ${props => props.hidden ?  'none' : 'block'  };
` 

export const Video = ( { src, startTime, observer, width, height,muted=true,loop=false,hidden=false,
                         onPlaybackUpdate, onLoaded, onLoadError, onPlaybackError, onStalled, onWaiting, onEnded } ) => {

    const refVideo = useRef(null)
    const [state,setState] = useState({mounted:false})
    const refInfo = useRef({
        playing:false, loading:false, canPlay:false,  startPlaying:false, ended:false
    })

    const loggerRef = useRef( new EventLogger('video'))

    const logEvent = useCallback((e)=> {
        try {
            if (e) {
                e.video = src
            }
            loggerRef.current.logEvent(e)
        }
        catch {}
    },[src])

    const logError = useCallback( ( fn, e, args={}) => {
        logEvent( {message:'error',fn,error:e?.message,...args})
    },[logEvent])


    const startPlay = useCallback(()=> {
        if (!refVideo.current || refInfo.current.playing)
            return

        refInfo.current.startPlaying = true
        refInfo.current.ended = false
        refVideo.current.play()       
            .then( ()=>  refInfo.current.playing = true)
            .catch( e=> logError('startPlay',e))
            .finally( ()=> refInfo.current.startPlaying = false)
    },[logError])

    const pausePlay = ()=> {
        if (!refVideo.current || refInfo.current.paused || refInfo.current.startPlaying) 
            return;

        refVideo.current.pause()            
        refInfo.current.playing = false;
    }

    const getBufferedTime = ()=> {
        const {buffered,currentTime: time} = refVideo.current??{}

        let bufferEnd=time

        for (let i=0; i<buffered?.length; i++) {
            
            const start = buffered?.start(i)
            const end = buffered?.end(i) 
            if (start<=time && end>=time) {                    
                bufferEnd = end
            }
        }

        return bufferEnd-time
    }
    const getBufferedArray = ()=> {
        const {buffered} = refVideo.current??{}

        const bufferedArray = []

        for (let i=0; i<buffered?.length; i++) {
            
            const start = buffered?.start(i)
            const end = buffered?.end(i) 
            bufferedArray.push({start,end})
        }

        return bufferedArray
    }


    const setRate = useCallback( ( rate )=> {       
        if (!refVideo.current)
            return

        if (rate===undefined || rate===null || isNaN(rate) || !isFinite(rate))    
            return

        if (rate===refVideo.current.playbackRate) 
            return;


        try {
            refVideo.current.playbackRate = rate        
            if (rate>0)
                startPlay()
            else if (rate===0) 
                pausePlay() 

        }
        catch (err) {
            logEvent({message:'failed to set rate', reason:err.message})
        }

    },[logEvent, startPlay])


    const setTime = useCallback( (time) => {
        if (!refVideo.current)
            return

        if (time===undefined || time===null || isNaN(time) || !isFinite(time))    
            return
        
        refVideo.current.currentTime = time
        try {
            refInfo.current.requestedTime = time
        } catch {}

    },[refVideo])

    const onTimeUpdate = () => {


        if (typeof onPlaybackUpdate!=='function' || refInfo.current.ended)
            return

        const time = refVideo.current?.currentTime
        const rate = refVideo.current?.playbackRate

        if (!refInfo.current.initObserver ) {

            const {readyState,networkState} = refVideo.current??{}
            const bufferedTime = getBufferedTime()

            if (typeof onPlaybackUpdate ==='function')
                onPlaybackUpdate(time,rate,{readyState,networkState,bufferedTime})
        }
        else  {
            if ( refInfo.current?.requestedTime===time ) {        
                refInfo.current.initObserver.emit('done')
            }
        }
    }

    const onLoadedMetadata = (e) => {
        if (!refVideo.current)
            refVideo.current = e.target
        
        refInfo.current.loading = false;
        refInfo.current.loaded = true;
        refInfo.current.initObserver = new Observer()

        if (startTime!==undefined && startTime!==null && !isNaN(startTime) && isFinite(startTime)) {
            setTime(startTime)
        }

        refInfo.current.initObserver.once('ready',()=> {
            if (onLoaded) {
                const bufferedTime = getBufferedTime()  
                onLoaded(bufferedTime)
            }

            refInfo.current.initObserver.stop()
            delete refInfo.current.initObserver            
        })


    }

    const onEndedHandler = () => {
        if (!refVideo.current)
            return

        refInfo.current.playing = false
        refInfo.current.ended = true
        setRate(0)

        if (typeof onEnded === 'function') {
            onEnded()
        }
    }

    const onError = (e) => {
        if (!refVideo.current)
            refVideo.current = e.target

        if (refInfo.current?.loading && onLoadError) {
            onLoadError(refVideo.current.error)
        }
        else if (!refInfo.current?.loading && onPlaybackError) {
            onPlaybackError(refVideo.current.error)
        }
    }

    const onWaitingHandler = () => {
        if (refInfo.current?.ended)
            return

        if (onWaiting) {
            const time = refVideo.current?.currentTime
            const rate = refVideo.current?.playbackRate

            const bufferedTime = getBufferedTime()  
            onWaiting(time, rate, bufferedTime, getBufferedArray())
        }
    }   

    const onStalledHandler = () => {
        if (onStalled) {
            const time = refVideo.current?.currentTime
            const bufferedTime = getBufferedTime()  
            onStalled(time, bufferedTime, getBufferedArray())
        }
    }

    const onCanPlay = ()=> {
        const wasReady = refInfo.current?.canPlay
        if (wasReady)
            return

        refInfo.current.canPlay = true
        if (refInfo.current.initObserver) {
            refInfo.current.initObserver.emit('ready')
        }

    }

    useEffect( ()=>{
        if (state.mounted)
            return;

        refInfo.current.loading = true;
        refInfo.current.loaded = false;
        refInfo.current.playing = false;

        if (observer)
            observer
                .on('rate-update',setRate)
                .on('time-update',setTime)
                


        setState({mounted:true})
    },[observer, setRate, setTime, src, startTime, state])

    // start time changes
    useEffect( ()=>{
        if (startTime!==undefined)
            setTime(startTime)
    },[setTime, src, startTime])


    useUnmountEffect( ()=>{
        if (observer) {
            observer.stop()
        }
        try {
            setRate(0)
            refVideo.current.pause()            
        }
        catch {}
    })

    if (typeof src !== 'string') {
        return null
    }

    try {
        if (!state.mounted) { 
            return  (
            <ErrorBoundary hideOnError debug>            
                <VideoContainer width={width} height={height} className='video-container'>
                    <Loader /> 
                </VideoContainer>
            </ErrorBoundary>)   

        }
        return  (
        <ErrorBoundary hideOnError debug>
        
            
                {loop ? 
                    <VideoView  ref={refVideo}   className='video-loop' 
                        width={width} height={height} hidden={hidden}
                        preload='auto'
                        loop
                        src={src} 
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        onError={onError}
                        onEnded={onEndedHandler}
                        onWaiting={ onWaitingHandler }   
                        onCanPlay={ onCanPlay }
                        onStalled={onStalledHandler}
                        muted={muted}                 
                        controls={false}  
                        autoPlay={false}
                    />   :
                    <VideoView  ref={refVideo}    className='video-no-loop'
                        width={width} height={height} hidden={hidden}
                        preload='auto'
                        src={src} 
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        onError={onError}
                        onEnded={onEndedHandler}
                        onWaiting={ onWaitingHandler }   
                        onCanPlay={ onCanPlay }
                        onStalled={onStalledHandler}
                        muted={muted}                 
                        controls={false}  
                        autoPlay={false}
                    />
                }
            
        </ErrorBoundary>)   
        
    }
    catch(err) {
        logError('<Video>', err)
        return null
    }

}
