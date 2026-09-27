import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDevicePairing, useRouteList } from "incyclist-services";
import { useNavigate  } from "react-router";
import { RouteListScreen } from "./screen";
import { usePageLogger, useUnmountEffect } from "../../hooks";
import { DialogLauncher } from "../../components/molecules";
import { RouteDetailsDialog } from "../../components/modules/routeSelection/RouteDetails";
import { FreeRideSettingsDialog } from "../../components/modules/routeSelection/FreeRideSettings";
import { ErrorBoundary } from "../../components/atoms/ErrorBoundary";
import { clearPanelFilters, countActiveFilters, getNoMatchHint, getRouteCountText, hasActiveFilters, removeFilter } from "./utils";

const PAGE_ID = 'Routes'

/** cards of a given type that are not part of the searchable route set (Free Ride, in-flight imports) */
const findSpecialCards = (service, type) => {
    try {
        const cards = []
        service.getLists(false)?.forEach( list => {
            list?.getCards()?.forEach( card => {
                if (card?.getCardType()===type)
                    cards.push(card)
            })
        })
        return cards
    }
    catch {
        return []
    }
}

const countRoutes = (service, filters) => {
    try {
        return service.searchRepo(filters)?.routes?.length ?? 0
    }
    catch {
        return 0
    }
}

/**
 * The merged Routes page: one flat, searchable and sortable list (or tile grid) of all routes,
 * with Free Ride and Import as page actions.
 *
 * Reached via `/routes` and via `/search` (permanent alias) while the NEW_SEARCH_UI feature is enabled.
 */
export const RouteListPage =  () => {

    const service = useRouteList()
    const pairing = useDevicePairing()
    const navigate = useNavigate()

    const [loading,setLoading] = useState(false)
    // initial values are read from the service, so the first render already shows the persisted view
    const [displayType,setDisplayType] = useState( ()=>service.getDisplayType() )
    const [sortOrder,setSortOrder] = useState( ()=>service.getSortOrder() )
    const [filtersExpanded,setFiltersExpanded] = useState( ()=>service.getFiltersExpanded() )
    // consumed by the Import Routes dialog, once it is available
    const [importDialogOpen,setImportDialogOpen] = useState(false)   // eslint-disable-line no-unused-vars
    // changed whenever the result set is re-queried by the user, so the list restarts at the top
    const [listKey,setListKey] = useState(0)

    const [pageState,setPageState] = useState(null)
    const [logger,closePageLogger] = usePageLogger(PAGE_ID,pageState)
    const [state,setState] = useState({})
    const [initialized,setInitialized] = useState(false)

    const ref = useRef()
    const refStateUpdates = useRef(null)
    const refSyncBusy = useRef(0)
    const refObserver = useRef(null)
    const refStarting = useRef(false)

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
        refSyncBusy.current = Math.max(0,(refSyncBusy.current??0)-1)

        // still syncing ... nothing to do
        if (refSyncBusy.current) {
            return
        }

        const interim = refStateUpdates.current
        refStateUpdates.current = null
        if (!interim) {
            return;
        }
        setState( current => ({...current,...interim}))
    },[])

    // the service returns the same observer for every search - subscribe only once
    const subscribe = useCallback( (observer)=>{
        if (!observer || refObserver.current===observer)
            return

        const prev = refObserver.current
        if (prev) {
            prev.off('updated', updateState)
            prev.off('sync-start', onSyncStart)
            prev.off('sync-done', onSyncDone)
        }

        refObserver.current = observer
        observer.on('updated', updateState)
        observer.on('sync-start', onSyncStart)
        observer.on('sync-done', onSyncDone)
    },[updateState, onSyncStart, onSyncDone])

    const runSearch = useCallback( (filters)=>{
        const update = service.search(filters)
        updateState(update)
        subscribe(update?.observer)
    },[service, updateState, subscribe])

    const init = useCallback( ()=>{
        try {
            runSearch(state?.data?.filters)
        }
        catch(err) {
            logger.logEvent({message:'error', fn:'init', error:err.message, stack:err.stack})
        }
        setLoading(false)
    },[runSearch, state, logger])

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
            init()
        }
        setPageState('opened')
        setInitialized(true)
    },[init, initialized, service] )

    useUnmountEffect( ()=> {
        const observer = refObserver.current
        if (observer) {
            observer.off('updated', updateState)
            observer.off('sync-start', onSyncStart)
            observer.off('sync-done', onSyncDone)
        }
        refObserver.current = null
    })

    const closePage = useCallback(async ()=> {
        closePageLogger()
    },[closePageLogger])

    const openDialog = ( Dialog,props)=> {
        ref.current?.openDialog(Dialog,props)
    }

    const onStart = async (settings) => {
        if (refStarting.current)
            return
        refStarting.current = true

        const {id,title,videoUrl,type} = settings??{}
        logger.logEvent( {message:'Attempting to start a ride',id,title,videoUrl,type,readyToStart:pairing.isReadyToStart(), } )

        const next =  pairing.isReadyToStart() ? '/rideOK'  : '/pairingStart'
        navigate( next, { state: { source:'/routes' } })
        closePage()
    }

    const onAddWorkout = useCallback( async () => {
        navigate('/workouts')
        closePage()
    },[closePage, navigate])


    // --- list ---

    const onSelect = (routeId) => {
        const card = service.getCard(routeId)
        if (!card)
            return

        logger.logEvent({message:'item seleced', title:card.getDisplayProperties()?.title, type:card.getCardType(), eventSource:'user' })
        openDialog (RouteDetailsDialog, {onStart,onAddWorkout,card})
    }

    // single entry point for deleting a route from the list (hover delete icon)
    const onDelete = (routeId) => {
        const card = service.getCard(routeId)
        if (card)
            card.delete()
    }

    const onRetryImport = (card) => {
        card?.retry()
    }

    const onDeleteImport = (card) => {
        card?.delete()
    }

    // --- filters, sort and view ---

    const getCurrentFilters = () => state?.data?.filters ?? {}

    const onChangeFilter = (filters) => {
        runSearch(filters)
        setListKey( k=>k+1 )
    }

    const onRemoveFilter = (key) => {
        onChangeFilter( removeFilter(getCurrentFilters(),key))
    }

    const onClearPanelFilters = () => {
        onChangeFilter( clearPanelFilters(getCurrentFilters()))
    }

    const onClearAllFilters = () => {
        onChangeFilter( {} )
    }

    const onToggleFilters = () => {
        const expanded = !filtersExpanded
        setFiltersExpanded(expanded)
        service.setFiltersExpanded(expanded)
    }

    const onSortOrderChanged = (order) => {
        if (!order || order===sortOrder)
            return

        setSortOrder(order)
        service.setSortOrder(order)

        // a new order starts at the top, in both views
        service.setListTop('list',0)
        service.setListTop('tiles',0)
        runSearch(getCurrentFilters())
        setListKey( k=>k+1 )
    }

    const onDisplayTypeSelected = (type) => {
        setDisplayType(type)    // save in component state
        service.setDisplayType(type) // save in global state/preferences
    }

    // --- page actions ---

    const onFreeRide = () => {
        const [card] = findSpecialCards(service,'Free-Ride')
        if (!card) {
            logger.logEvent({message:'error', fn:'onFreeRide', error:'free ride card not found'})
            return
        }
        openDialog( FreeRideSettingsDialog, { onStart, onAddWorkout, card } )
    }

    const onImportRoutes = () => {
        setImportDialogOpen(true)
    }


    // --- render ---

    const {data} = state
    const {routes,cards,filters,units} = data||{};
    const filterOptions = service.getFilterOptions(filters)

    const filtered = hasActiveFilters(filters)
    const shown = routes?.length ?? 0
    const totalCount = filtered ? countRoutes(service, {includeDeleted:filters?.includeDeleted}) : shown

    let noMatchHint
    if (!loading && shown===0 && totalCount>0 && filters?.title && countActiveFilters(filters)>0) {
        const titleOnly = countRoutes(service, {title:filters.title, includeDeleted:filters.includeDeleted})
        noMatchHint = getNoMatchHint(titleOnly, filters.title)
    }

    const activeImports = findSpecialCards(service,'ActiveImport')

    const screenProps = {
        routes, cards, filters, units, ...filterOptions,
        totalCount,
        countText: getRouteCountText(shown,totalCount,filtered),
        noMatchHint,
        activeImports,
        loading: loading || pageState==='closed' || !data,
        displayType, sortOrder, filtersExpanded, listKey
    }

    return (
    <ErrorBoundary history>
        <RouteListScreen {...screenProps}
            onChangeFilter={onChangeFilter}
            onRemoveFilter={onRemoveFilter}
            onClearPanelFilters={onClearPanelFilters}
            onClearAllFilters={onClearAllFilters}
            onToggleFilters={onToggleFilters}
            onSortOrderChanged={onSortOrderChanged}
            onDisplayTypeSelected={onDisplayTypeSelected}
            onSelect={onSelect}
            onDelete={onDelete}
            onRetryImport={onRetryImport}
            onDeleteImport={onDeleteImport}
            onFreeRide={onFreeRide}
            onImportRoutes={onImportRoutes}
            closePage={closePage}
        />
        <DialogLauncher ref={ref}/>
    </ErrorBoundary>)
}
