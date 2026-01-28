import React, { useCallback, useEffect, useRef, useState } from "react"
import { RouteDetails } from "./component"
import { VideoProcessing } from "../../../../bindings/video"
import { sleep, valid } from "../../../../utils/coding"
import { useAppUI } from "../../../../bindings/native-ui"
import { useActivityList, useOnlineStatusMonitoring, useRouteList, useUserSettings } from "incyclist-services"
import { EventLogger } from "gd-eventlog"
import { useUnmountEffect } from "../../../../hooks"

export const RouteDetailsDialog = (props) => {
    const {onStart,onCancel,onAddWorkout,card} = props

    const [prevRides,setPrevRides] = useState(false)

    const refInitialized = useRef(false)    
    const [route,setRoute] = useState(card.getData())
    const [loading,setLoading] = useState(false)
    const [settings,setSettings] = useState({})
    const [download,setDownload] = useState(card.getCurrentDownload())
    const [convert,setConvert] = useState(card.getCurrentConversion())
    const [downloadState,setDownloadState] = useState(null)
    const [convertState,setConvertState] = useState(null)
    const onlineStatusMonitor = useOnlineStatusMonitoring()
    const [videoSelectedError, setVideoSelectedError] = useState(undefined)
    
    const [requestVideoDir,setRequestVideoDir] = useState(false)
    const [videoState,setVideoState] = useState({
        canStart: card.canStart({isOnline:onlineStatusMonitor.onlineStatus}),
        videoChecking:false,
        videoMissing:false
    })
    const ui = useAppUI();
    const userSettings = useUserSettings()
    const propsRef = useRef()
    const activities = useActivityList()
    const service = useRouteList()
    const refMounted = useRef(false)

    let convertStart
    let downloadStart

    const logger = new EventLogger('RouteDetails')


    const initDownloadHandlers = useCallback((observer) => {
        if (!refMounted.current)
            return

        const videoDir = card.getVideoDir()
        if (videoDir && requestVideoDir)
            setRequestVideoDir(false)
        if (!videoDir && !requestVideoDir)
            setRequestVideoDir(true)

        setDownloadState({})

        observer.on('progress',(downloadProgress)=>{
            setDownloadState( current=> {
                const updated = {...current,downloadProgress}
                return updated
            })
        })
        observer.on('done',()=>{
            setDownloadState( null)
            setDownload( null)
            setRoute(card.getData())
        })
        observer.on('error',async (error)=>{
            const duration = Date.now()-downloadStart            
            if (duration<500)
                await sleep(500-duration)

            setDownloadState({downloadError:error.message??error})
        })
        observer.on('videoDir.unknown',()=>{
            if (!requestVideoDir)
                setRequestVideoDir(true)
        })
        observer.on('videoDir.ok',()=>{
            setRequestVideoDir(false)
        })
    },[card, downloadStart, requestVideoDir])

    const initConvertHandlers = useCallback((observer) => {
        if (!refMounted.current)
            return
        setConvertState({})

        observer.on('progress',(convertProgress)=>{
            setConvertState( current=> {
                const updated = {...current,convertProgress}
                return updated
            })
        })
        observer.on('done',()=>{
            setConvertState( null)
            setConvert(null)
            setRoute(card.getData())
        })
        observer.on('error',async (err)=>{
            const duration = Date.now()-convertStart            
            if (duration<500)
                await sleep(500-duration)

            setConvertState( {convertError:err.message})
        })

    },[card, convertStart])

    const getShowPrev = useCallback (( prev=prevRides)=> {
        return prev?.length>0 && userSettings.get('preferences.showPrevRides',true)
    },[prevRides, userSettings])

    const refreshPastActivities = useCallback(async (data) => {
        if (!route || !refMounted.current)
            return;

        let routeId
        const routeHash = route.description.routeHash
        if (!routeHash)
            routeId = route.description.id


        const {startPos,endPos,segment,realityFactor} = data??{}

        const prev = await activities.getPastActivitiesWithDetails({routeHash,routeId,startPos,endPos, realityFactor })

        if (prev.length>0)
            logger.logEvent({message: 'previous rides', route:route.title, cnt:prev?.length,settings:{startPos,endPos,segment,realityFactor}})
        
        
        return { prevRides: prev?.length>0 ? prev : null, showPrev: getShowPrev(prev) }
    },[activities, getShowPrev, logger, route])

    const getVideoSettings = useCallback( (props) => {
        if (!refMounted.current)
            return

        const {canStart, videoChecking, videoMissing} = props

        if ( videoChecking) {

            if (videoMissing) {
                videoMissing.then( isMissing => {  
                    if (!route) { // user cancelled 
                        setVideoState(  {canStart:false, videoChecking:false, videoMissing:undefined});
                        return 
                    }

                    else if (isMissing)
                        logger.logEvent({message:'video missing',videoUrl:card.getRouteDescription()?.videoUrl})
                    
                    const isOnline = onlineStatusMonitor.onlineStatus
                    setVideoState( { videoChecking:false, videoMissing:isMissing, canStart:card.canStart({isOnline})&&!isMissing } )                            
                })
                return { canStart, videoChecking:true, videoMissing:false}
            }
            return { canStart, videoChecking:false, videoMissing:false}
        }

        setVideoState( { canStart, videoChecking, videoMissing:false} )
    },[card, logger, onlineStatusMonitor.onlineStatus, route])



    useEffect( ()=>{

        const inititialized = refInitialized.current

        if(inititialized || !route)
            return;

        refMounted.current = true

        try {
            onlineStatusMonitor.start('RouteDetails',()=> {
                getVideoSettings( card.openSettings())
            })
    
            const props = propsRef.current = card.openSettings()
            const settingsFromService = props.settings
            if (download)     
                initDownloadHandlers(download)
    
            const ongoingConversion = card.getCurrentConversion()
            if(ongoingConversion) {
                initConvertHandlers(ongoingConversion)
                setConvert(ongoingConversion)
            }
    
            refInitialized.current = true      
            setSettings(settingsFromService)
            getVideoSettings(props)
    
            refreshPastActivities(settingsFromService).then( ({prevRides}) => {                
                setPrevRides(prevRides)
            })

    
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'RouteDetailsDialog#useEffect', error:err.message,stack:err.stack})
        }


    },[card, download, getVideoSettings, initConvertHandlers, initDownloadHandlers, refInitialized, logger, onlineStatusMonitor, refreshPastActivities, route])


    useEffect( ()=>{
        if (!route)
            return

        if (refInitialized.current && !loading && !route.details) {
            
            setLoading(true)
            service.getRouteDetails(route.description?.id).then( details=> {
                if (details) {
                    setLoading(false)
                }
            })
            .catch(err => {
                logger.logEvent({message:'error',fn:'RouteDetailsDialog#route details effect', error:err.message,stack:err.stack})                
                setLoading(false)
            })
        }
    },[loading, logger, route, service])

    useUnmountEffect( ()=> {
        refMounted.current = false
    })


    const setInitialized = (value) => {
        refInitialized.current = value
    }

    const onStartHandler = (data) => {
        const settings = {...data}
        delete settings.markers
        delete settings.prevRides

        card.changeSettings(settings)
        card.start()
        setInitialized(false)
        setRoute(null)
        if (onStart) {
            onStart(route,data)        
        }
        onlineStatusMonitor.stop('RouteDetails')

    }

    const onAddWorkoutHandler = (data) => {
        const settings = {...data}
        delete settings.markers
        delete settings.prevRides
        card.changeSettings(settings)
        card.addWorkout()
        if (onAddWorkout)
            onAddWorkout(route)        

    }

    const onCancelHandler = (data) =>  {
        card.cancel(data)
        setRoute(null)
        setInitialized(false)
        onlineStatusMonitor.stop('RouteDetails')
        if (onCancel)
            onCancel(route,data)        
    }

    const onDownloadHandler = ()  => {
        const observer = card.download()
        initDownloadHandlers(observer)
        setDownload(observer)

    }
    const onCancelDownloadHandler = () =>  {
        if (!refMounted.current)
            return

        setDownload(null)
        card.stopDownload(true)
        setDownloadState({})
        
    }

    const onConvertHandler = (route)  => {
        if (!refMounted.current)
            return

        const observer = card.convert()
        setConvert(observer)
        setConvertState({convertProgress:0})
        initConvertHandlers(observer)

    }
    const onCancelConvertHandler = (route) =>  {
        card.stopConversion()
        if (!refMounted.current)
            return
        
        setConvert(null)
    }
    const onSelectVideoDirHandler = async () =>  {
        const res = await ui.selectDirectory();
        if (res?.selected) {
            card.setVideoDir(res.selected)          
            setRequestVideoDir(false)  
        }
        
    }

    const onPrevRidesClicked = (value) => {
        userSettings.set('preferences.showPrevRides',value)
    }

    const onVideoSelected = async (video) => {
        try {
            const error = await card.onVideoSelected(video)

            const props = propsRef.current = card.openSettings()        
            if (error)
                setVideoSelectedError(error)                
            else {
                setRoute(card.getData())
                getVideoSettings(props)
            }
            logger.logEvent({message:'video selected',videoUrl:card.getRouteDescription()?.videoUrl, canStart:propsRef.current.canStart})
            setLoading(false)
        }
        catch(err) {
            logger.logEvent({message:'error',fn:'onVideoSelected', error:err.message,stack:err.stack})
        }
        

    }

    const onChangeVideoDir = ( )=> {   
        card.setVideoDir(null)
        onCancelDownloadHandler()


        
        onDownloadHandler()
    }


    const convertSupported = new VideoProcessing().isConvertSuported() && !videoState.isMissing
    const isOnline = onlineStatusMonitor.onlineStatus
    const markers = card.getMarkers()
    const dialogProps = propsRef?.current || {}
    const {showLoopOverwrite,showNextOverwrite} = dialogProps
    const {hasWorkout,totalDistance,totalElevation,xScale,yScale, updateStartPos, updateMarkers} = propsRef.current||{}
    const showWorkout = !hasWorkout
    const showPrev = getShowPrev()
    const videoDir = card.getVideoDir()

    const args = {route,totalDistance,totalElevation,xScale,yScale,markers,showLoopOverwrite,showNextOverwrite, ...settings,...convertState,...downloadState, requestVideoDir, convertOngoing:valid(convert), downloadOngoing:valid(download),  convertSupported, ...videoState, isOnline, showWorkout,
                  showPrev,prevRides,loading,videoDir,onChangeVideoDir,
                 onVideoSelected,videoSelectedError}

    if(!refInitialized.current || !route)
        return null;

    return <RouteDetails {...args} 
    onStart={onStartHandler} onCancel={onCancelHandler}  onAddWorkout={onAddWorkoutHandler}
    onDownload={onDownloadHandler} onCancelDownload={onCancelDownloadHandler} 
    onConvert={onConvertHandler} onCancelConvert={onCancelConvertHandler}
    onPrevRidesClicked={onPrevRidesClicked}
    onSelectVideoDir={onSelectVideoDirHandler}
    updateMarkers={updateMarkers}
    updateStartPos={updateStartPos}
    onRefresh={refreshPastActivities}
    />


}