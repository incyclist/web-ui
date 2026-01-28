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

export const AutoConvertVideo = ( { src, startTime, observer, width, height,muted=true,loop=false,hidden=false,
                         onPlaybackUpdate, onLoaded, onLoadError, onPlaybackError, onStalled, onWaiting, onEnded,
                         } ) => {

    const mime = 'video/mp4; codecs="avc1.4D0029"';
    const refVideo = useRef(null)
    const [state,setState] = useState({mounted:false})
    const refInfo = useRef({
        playing:false, loading:false, canPlay:false,  startPlaying:false, ended:false, isReady:false
    })
    const loggerRef = useRef( new EventLogger('video'))

    const logEvent = (e)=> {
        try {
            loggerRef.current.logEvent(e)
        }
        catch {}
    }

    const logError = useCallback( ( fn, e, args={}) => {
        logEvent( {message:'error',fn,...args})
    },[])

    const startPlay = useCallback(()=> {

        if (refInfo.current.playing)
            return;

        if (!refVideo.current)
            return

        refInfo.current.startPlaying = true
        refInfo.current.ended = false
        refVideo.current.play()       
            .then( ()=>  refInfo.current.playing = true)
            .catch( e=> logError('startPlay',e))
            .finally( ()=> refInfo.current.startPlaying = false)
    }, [logError])


    const pausePlay = ()=> {
        if (!refInfo.current.playing)
            return;

        if (!refVideo.current || refInfo.current.paused || refInfo.current.startPlaying) 
            return;

        refVideo.current.pause()            
        refInfo.current.playing = false
    }

    const getBufferedTime = ()=> {
        const {buffered,currentTime: time} = refVideo.current??{}

        let bufferEnd=time
        let infos = []

        for (let i=0; i<buffered?.length; i++) {
            
            const start = Math.floor(buffered?.start(i)*10)/10
            const end = Math.floor(buffered?.end(i)*10) /10

            infos.push({start,end})
            if ( (time===0 && buffered.length<2) || (start<=time && end>=time)) {                    
                bufferEnd = end
            }
            
        }
        //console.log('# buffer info', infos,buffered, time)

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

        if (rate===undefined || rate===null || Number.isNaN(rate) || !Number.isFinite(rate))    
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

    },[startPlay])


    const setTime = useCallback( (time) => {
        if (!refVideo.current)
            return

        if (time===undefined || time===null || Number.isNaN(time) || !Number.isFinite(time))    
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

        if (refInfo.current.nextSegment) {
            getNextSegment()
        }

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
        
        logEvent({message:'loaded metadata', duration: refVideo.current?.duration})

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

        const error = refInfo.current?.error ?? refVideo.current.error

        if (refInfo.current?.loading && onLoadError) {
            const {conversion} = refInfo.current??{}
            if (conversion)
                conversion.stop();
            onLoadError(error)
        }
        else if (!refInfo.current?.loading && onPlaybackError) {
            onPlaybackError(error)
        }
    }

    const onWaitingHandler = () => {
        if (refInfo.current?.ended)
            return

        if (onWaiting) {
            const time = refVideo.current?.currentTime
            const rate = refVideo.current?.playbackRate

            const bufferedTime = getBufferedTime()  
            onWaiting(time,rate, bufferedTime, getBufferedArray())
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

        logEvent({message:'video can play'})
        refInfo.current.canPlay = true
    }


    const getNextSegment  =  async ()=> {
        
        if (refInfo.current?.appendBusy )
            return

        if (!refInfo.current?.conversion || !refInfo.current?.buffer )  {
            return;
        }

        let segment;

        const {conversion,buffer} = refInfo.current
        try {

            segment = refInfo.current.nextSegment ?? await conversion.getNextSegment();
            delete refInfo.current.nextSegment 


            refInfo.current.appendBusy = true
            buffer.appendBuffer(segment)
            refInfo.current.appendBusy = false

        }
        catch(err) {
            refInfo.current.appendBusy = false

            if (err.name==='QuotaExceededError' || err.message.startsWith('QuotaExceededError')) {
                refInfo.current.nextSegment = segment
                return;
            }

            if (refInfo.current) {
                refInfo.current.error = new Error('Conversion Error')
                this.logError(err,'getNextSegment')
                onError()
            }            
            

        }

        if (refInfo.current.canPlay && !refInfo.current.isReady) {

            const bufferedTime = getBufferedTime()  
            if (bufferedTime>30) {
                if (refInfo.current.initObserver) {
                    refInfo.current.initObserver.emit('ready')
                }
            }
        }

        else if (!refInfo.current.canPlay && !refInfo.current.isReady) { 

            const bufferedTime = getBufferedTime()  
            const timeSinceConversionStart = Date.now() - (refInfo.current.tsConvertStart||0)   

            if (bufferedTime>60 && timeSinceConversionStart>10) {
                if (refInfo.current.initObserver) {
                    refInfo.current.initObserver.emit('ready')
                }
            }


        }




    }

    const initMediaSource = () => {
                // init mediasource
        const video = refVideo.current;
        const mediaSource = new MediaSource();

        if (!MediaSource.isTypeSupported(mime)) {
            //TODO: handle error
            return;
        }

        video.src = URL.createObjectURL(mediaSource); 


        mediaSource.addEventListener('error', function(e) {
            logEvent( {message:'video error', readyState: mediaSource.readyState})
        });

        mediaSource.addEventListener('sourceopen', () => { 
            const buffer = refInfo.current.buffer = mediaSource.addSourceBuffer(mime)
            refInfo.current.mediaSourceOpened = true
            getNextSegment()

            buffer.addEventListener( 'updateend',(...args)=> {
                getNextSegment()
            })

        })

        
        
        refInfo.current.mediaSource = mediaSource
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

    useEffect( ()=> {

        if (!refVideo.current)
            return

        if (refInfo.current?.conversion)
            return

        const conversion = src
        refInfo.current.conversion = conversion

        conversion.getObserver()
            .once('convert-start', ()=>{  
                refInfo.current.converting = true
                refInfo.current.tsConvertStart = Date.now()
            })

        initMediaSource()
        conversion.convert()


    })


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

        if (refInfo.current?.conversion) {
            const conversion = refInfo.current?.conversion
            conversion.stop()
            refInfo.current.conversion = null
            refInfo.current.converting = false
        }
    })


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
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        onError={onError}
                        onEnded={onEndedHandler}
                        onWaiting={ onWaitingHandler }   
                        onCanPlay={ onCanPlay }
                        onCanPlayThrough={ onCanPlay}
                        onStalled={onStalledHandler}
                        muted={muted}                 
                        controls={false}  
                        autoPlay={false}
                    />   :
                    <VideoView  ref={refVideo}    className='video-no-loop'
                        width={width} height={height} hidden={hidden}
                        preload='auto'
                        onTimeUpdate={onTimeUpdate}
                        onLoadedMetadata={onLoadedMetadata}
                        onError={onError}
                        onEnded={onEndedHandler}
                        onWaiting={ onWaitingHandler }   
                        onCanPlay={ onCanPlay }
                        onCanPlayThrough={ onCanPlay}
                        onStalled={onStalledHandler}
                        muted={muted}                 
                        controls={false}  
                        autoPlay={false}
                    />
                }
            
        </ErrorBoundary>)   
        
    }
    catch(err) {
        logError('<AutoConvertVideo>', err)
        return null
    }

}
