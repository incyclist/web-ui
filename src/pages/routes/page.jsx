
import React, { useEffect, useState,useRef,useCallback } from "react"
import { RoutesScreen } from "./screen"
import { Observer, useDevicePairing, useRouteList } from "incyclist-services"
import { useWindowDimensions,usePageLogger, useUnmountEffect } from "../../hooks"
import { getResponsiveHorizontal } from "./utils"
import { useNavigate  } from "react-router";
import { RouteDetailsDialog} from "../../components/modules/routeSelection/RouteDetails"
import { FreeRideSettingsDialog } from "../../components/modules/routeSelection/FreeRideSettings"
import { DialogLauncher } from "../../components/molecules/dialogs"

const PAGE_ID = 'RouteList'

export const RoutesPage =  () => {

    const service = useRouteList()
    const pairing = useDevicePairing()
    const hash = (l) => l.getCards().map(c=>`${c.getTitle()??''}:${c.getId()}`).join(',')

    const refInitialized = useRef(false)
    const [data,setData] = useState( null )

    const [loading,setLoading] = useState( false )
    const [screenProps,setScreenProps] = useState(service.getScreenProps())
    const [pageState,setPageState] = useState(null)

    const refLists = useRef([])
    const refObserver = useRef(null)
    const refListObservers = useRef({})
    const refListsVisibleArea = useRef({})
    const refStateUpdates = useRef(null)
    const refSyncBusy = useRef(0)

    const [logger,closePageLogger] = usePageLogger(PAGE_ID,pageState)

    
    const updateScreenProps = useCallback((w,h)=> {
        const prev = -1;

        let respList = getResponsiveHorizontal(w,h,{offset:210,padding:0})

        const {cardSize} = respList
        delete respList.cardSize
        

        const limits = Object.keys(respList)
        const aboveIdx = limits.findIndex( limit => limit>w)

        let updated

        if (aboveIdx!==-1) {
            const newFit = respList[ limits[aboveIdx-1] ]
            updated = newFit.items
        }
        else {
            updated = -1
        }

        const cardsCnt = Math.floor((w-210)/cardSize.width)

        // list has been updated or is opened for the first time
        if (prev!==updated ) {

            if (refLists.current && refListsVisibleArea.current) {
                Object.keys(refListsVisibleArea.current).forEach( key=> {
                    refListsVisibleArea.current[key].start = 0;
                    refListsVisibleArea.current[key].end  = cardsCnt;
                })
    
                
                refLists.current.forEach(l =>{                
                    l.list.getCards().forEach( (card,idx)=> {
                        card.setInitialized(false)                    
                        card.setVisible(idx<cardsCnt)
                    })
                        
                })    
            }

            const screenProps = {itemsFit:updated, responsive:respList, cardSize,offset:210, width:w, height:h}
            service.setScreenProps(screenProps)
            setScreenProps(screenProps)

            logger.logEvent( {message:'carousel calculated', width:w, height:h, cardSize, cardsCnt} )
        }

    },[logger, service])

    let { height, width } = useWindowDimensions( (current,prev)=> {
        service.onResize( current,prev)         
        updateScreenProps(current.width,current.height)
        width = current.width
        height = current.height
    });
    

    const ref = useRef();
    
    const navigate = useNavigate()

    let onStart;

    const onListsUpdated = useCallback( (lists,source)=> {

        if (source==='system' && (refSyncBusy.current??0)>0) {
            refStateUpdates.current = lists
            return;
        }
              
        if (!lists)
            return;

        try {

            const prevLists = refLists.current.map( i=>i.list?.getTitle()).join(',')
            const udpatedLists = lists.map( i=>i.title).join(',')

            if (prevLists!==udpatedLists) {
                setData( current => ({...current,lists}))
                return    
            }


            lists.forEach( (list,idx) => {

                const currentHash = refLists.current[idx].hash
                const newHash = hash(list)
                const changed = currentHash!==newHash

                if (changed) {
                    
                    refLists.current[idx] = {list,hash:newHash}

                    const observer = refListObservers.current[ list.getTitle()]
                    const {start,end} = refListsVisibleArea.current[ list.getTitle()]??{}
                    if (observer)
                        observer.emit('updated', list,newHash,start,end)
                }

            } )

        }
        catch(err) {
            setData( current => ({...current,lists}))
        }
        
    },[])


    const onSyncStart = useCallback( ()=> {
        refSyncBusy.current = (refSyncBusy.current??0)+1
    },[])

    

    const onSyncDone = useCallback( ()=> {
        refSyncBusy.current = (refSyncBusy.current??0)-1
        if (refSyncBusy.current<0) {
            refSyncBusy.current = 0
        }
        
        // still syncing ... nothing to do
        if (refSyncBusy.current) {
            return
        }

        const interim = refStateUpdates.current
        refStateUpdates.current = null

        // no updates -> no redraw or state updated required
        if (!interim) {
            return;
        }
        
        // enforce redraw of search screen
        setLoading(true)
        process.nextTick( ()=>{
            onListsUpdated(interim)   
            setLoading(false)
        })
        
        
    },[onListsUpdated])

    const init = useCallback( ()=>{
        try {

            if (refObserver.current!==null)
                return;

            const {observer,lists} = service.open()
                
            refObserver.current = observer
            observer.on( 'started', ()=>{  
                if (!loading && !data)
                    setLoading(true)
            })
            .on( 'updated', onListsUpdated)
            .on( 'selected', onStart)
            .on( 'loaded', onListsUpdated)
            .on('sync-start', onSyncStart)
            .on('sync-done', onSyncDone)


            if (!lists) {
                observer.on( 'loaded', (lists)=> {
                    lists.forEach( l=> {
                        l.observer = new Observer() 
                        refListObservers.current[ l.getTitle()] = l.observer
                    })

                    if (loading)
                        setLoading(false)
                    setData( current => ({...current,lists}))
                    refLists.current = lists.map (list=> ({list, hash:hash(list)}))
                    refInitialized.current = true

    
                })

            }
            else {
                refLists.current = lists.map (list=> ({list, hash:hash(list)}))

                lists.forEach( l=> {
                    l.observer = new Observer() 
                    refListObservers.current[ l.getTitle()] = l.observer
                })
                setLoading(false)
                setData( current => ({...current,lists}))
                refInitialized.current = true

            }

            
        }
        catch(err) {
            logger.logEvent( {message:'error', error:err.message, fn:'useEffect()', stack:err.stack} )
            refInitialized.current = true
        }


    },[data, loading, logger, onListsUpdated, onStart, onSyncDone, onSyncStart, service])


    useEffect( ()=>{
        if (screenProps)
            return;

        updateScreenProps(width,height)

    },[screenProps, updateScreenProps,width,height])

    useEffect( ()=>{

        if (refInitialized.current) {
            return;
        }

        if (service.isStillLoading()) {
            logger.logEvent({message:'preload still busy - waiting ...'})
            setLoading(true)

            service.preload().wait().then( () => {
                logger.logEvent({message:'preload done - init list'})
                init()
            })

        }
        else {
            setLoading(true)
            init()
        }

        setPageState('opened')
        refInitialized.current = true


    },[init, logger, refInitialized, service])

    useUnmountEffect( ()=> {
        if (refObserver.current)
            refObserver.current.stop()
        refObserver.current = null
            
    },[])


    const onInitialized = useCallback((list, e ) =>{
        const {item,itemsInSlide} =e
        //service.load(list,item,itemsinSlide+1)
        process.nextTick( ()=>{
            service.onCarouselInitialized(list,item,itemsInSlide)
        })

        refListsVisibleArea.current[ list.getTitle()] = { start:item, end:item+itemsInSlide }       
        logger.logEvent( {message:'Carousel initialized', list:list.getId(),item:e?.item, itemsInSlide:e?.itemsInSlide })
    },[service,logger])

    const onUpdated = useCallback((list,e ) =>{
        /* console.log('~~~ DEBUG:Carousel updated',new Date().toISOString(),e)*/
    },[])

    const onSlideChange = useCallback((list,e) =>{
        
    },[])

    const onSlideChanged = useCallback((list,e ) =>{
        const {item,itemsInSlide /*,isNextSlideDisabled,isPrevSlideDisabled, slide, type*/} = e;
        service.onCarouselUpdated(list,item,itemsInSlide)

        refListsVisibleArea.current[ list.getTitle()] = { start:item, end:item+itemsInSlide }

    },[service])

    const closePage = useCallback(async ()=> {
        closePageLogger()
    },[ service,closePageLogger])


    const onChangeFreeRide = async (settings) => { 

    }

    onStart = useCallback( async () => {
        const {id,title,videoUrl} = service.getStartSettings()??{}
        logger.logEvent( {message:'Attempting to start a ride',id,title,videoUrl,readyToStart:pairing.isReadyToStart(), } )
        
        service.close()       
        const next =  pairing.isReadyToStart() ? '/rideOK'  : '/pairingStart'
        navigate( next, {state: { source:'/routes' }})
        closePage()

    },[closePage, navigate, logger, pairing, service])

    const onAddWorkout = useCallback( async (settings) => {
        service.close()

        const next =  '/workouts' 
        navigate(next)
        closePage()
    },[closePage, navigate])


    const openDialog = ( Dialog,props)=> {
        ref.current.openDialog(Dialog,props)
    }

    const onOKClicked =  (card,settings) => {
        switch (card.getCardType()) {
            case 'Free-Ride':
                openDialog( FreeRideSettingsDialog, { onChange:onChangeFreeRide, onStart:onStart,onAddWorkout, card } )

                break;
            case 'Import':
                service.import(settings)               
                
                break;
            default:                
                openDialog (RouteDetailsDialog, {onStart,onAddWorkout, card})
    
        }
    }


    const onDeleteClicked = useCallback( (card) => {
        switch (card.getCardType()) {
            case 'Route':
            case 'ActiveImport':
                card.delete()
                break;
            default:
                // should never happen
                break;                
    
        }

    },[])

    const onRetryClicked = useCallback( (card) => {
        switch (card.getCardType()) {
            case 'ActiveImport':
                card.retry()
                break;
            default:
                // should never happen
                break;                
    
        }

    },[])

    if (pageState==='closed')
        return null;

    if (!pageState)
        return <RoutesScreen data={[]} loading={true}/>

    return <>
    
        <RoutesScreen data={data?.lists} loading={loading||!refInitialized.current} {...screenProps}  
            closePage={closePage}
            onOK={onOKClicked}
            onDelete={onDeleteClicked}
            onRetry={onRetryClicked}
            onInitialized={onInitialized} onUpdated={onUpdated} onSlideChange={onSlideChange} onSlideChanged={onSlideChanged}/>

        <DialogLauncher ref={ref}/>
    </>
        
    

}


        
        
          
