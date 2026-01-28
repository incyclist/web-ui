import React, { useCallback, useRef, useState,useEffect } from "react";
import { useDevicePairing, useRouteList } from "incyclist-services";
import { SearchScreen } from "./screen";
import { usePageLogger, useUnmountEffect } from "../../hooks";
import { DialogLauncher } from "../../components/molecules";
import { RouteDetailsDialog } from "../../components/modules/routeSelection/RouteDetails";
import { useNavigate  } from "react-router";
import { ErrorBoundary } from "../../components/atoms/ErrorBoundary";

const PAGE_ID = 'Search'

export const SearchPage =  () => {

    const service = useRouteList()
    const pairing = useDevicePairing()
    const [ loading, setLoading  ] = useState(false)
    const [ displayType, setDisplayType ] = useState( service.getDisplayType() )

    const [pageState,setPageState] = useState(null)
    const ref=useRef()
    
    const [logger,closePageLogger] = usePageLogger(PAGE_ID,pageState)
    const [state,setState] = useState( {})

    const [hotkeysDisabled,setHotkeysDisabled] = useState(false)
    const refStateUpdates = useRef(null)
    const refSyncBusy = useRef(false)

    const [initialized,setInitialized] = useState(false)
    
    const navigate = useNavigate()


    const updateState = useCallback( (displayProps)=> {
        if (refSyncBusy.current) {
            refStateUpdates.current = {data:displayProps}
            return;
        }
        setState( current => ({...current,data:{...displayProps}}))                    
    },[])


    const onSyncStart = useCallback( ()=> {
        refSyncBusy.current = (refSyncBusy.current??0)+1
    },[])

    

    const onSyncDone = useCallback( ()=> {
        refSyncBusy.current = (refSyncBusy.current??0)-1

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
            setState( current => ({...current,...interim}))   
            setLoading(false)
        })
        
        
    },[])


    const init = useCallback( async ({searchFilters,loading=true,refresh=false}={})=>{
        const filters = searchFilters??state?.data?.filters


        const doInit=()=>{
            const update = service.search(filters)

            updateState(update)   
            if (loading)
                setLoading(false)         
            
            const {observer} = update
            if (observer) {
                observer.on('updated', updateState)
                observer.on('sync-start', onSyncStart)
                observer.on('sync-done', onSyncDone)
            }
    
        }

        if (loading) {
            setLoading(true)
            process.nextTick( ()=>{
                doInit()
            })
        }
        else {
            doInit()
        }

        
        
    },[state, service, updateState, onSyncStart, onSyncDone])

    useEffect( ()=>{
        if (initialized) {
            return;
        }

        if (service.isStillLoading()) {
            setLoading(true)
            try {
                service.preload().wait().then( () => { init()})
            }
            catch{ 
                init()
            }

        }
        else {
            init( {loading:false})
        }
        setPageState('opened')
        setInitialized(true)      
    },[init, initialized, service, state] )

    useUnmountEffect( ()=> {
        //console.log('# search page unmounted')
    })

    const closePage = useCallback(async ()=> {
        closePageLogger()
    },[closePageLogger])

    const onStart =  async (settings) => {

        const {id,title,videoUrl} = settings??{}
        logger.logEvent( {message:'Attempting to start a ride',id,title,videoUrl,readyToStart:pairing.isReadyToStart(), } )

        setHotkeysDisabled(false)

        const next =  pairing.isReadyToStart() ? '/rideOK'  : '/pairingStart'
        navigate( next, { state: { source:'/search' } })
        closePage()


    }

    

    const openDialog = ( Dialog,props)=> {
        //disableBackKey()        
        setHotkeysDisabled(true)
        ref.current.openDialog(Dialog,props)
    }

    const onAddWorkout = useCallback( async (settings) => {
        navigate('/workouts')
        closePage()
    },[closePage, navigate])


    const onSelect = (routeId) => { 
        const card = service.getCard(routeId)
        
        logger.logEvent({message:'item seleced', title:card.getDisplayProperties()?.title, type:card.getCardType(), eventSource:'user' })
        if (card)
            openDialog (RouteDetailsDialog, {onStart,onAddWorkout,card})
    }

    const onDelete = (routeId) => {
        const card = service.getCard(routeId)
        if (card)
            card.delete()
    }


    const onChangeFilter= (filter) => {
        init({searchFilters:filter})
    }

    const onDisplayTypeSelected = (type) => {
        setDisplayType(type)    // save in component state
        service.setDisplayType(type) // save in global state/preferences
    }

    const filterOptions = service.getFilterOptions()
    const {data} = state    
    const {routes,cards,filters,units} = data||{};
    
    const searchProps = {routes,cards, filters,units,...filterOptions,loading,hotkeysDisabled,displayType,onDisplayTypeSelected}
    if (pageState==='closed' )
        searchProps.loading = true

    console.log('# render search page', {searchProps, data})
    return (
    <ErrorBoundary history> 
        <SearchScreen {...searchProps}
            onChangeFilter={onChangeFilter} 
            onSelect={onSelect} 
            onDelete={onDelete}
            closePage={closePage} 
        />
        <DialogLauncher ref={ref}/>
    </ErrorBoundary>)
}