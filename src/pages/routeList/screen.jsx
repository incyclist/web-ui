import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import styled from "styled-components"
import { UploadIcon } from "@primer/octicons-react"
import MainPage from "../../components/molecules/MainPage"
import { Button, Center, GroupTitle, Loader, PageTitle, Text } from "../../components/atoms"
import { Column, Row } from "../../components/atoms/layout/View"
import { BikeIcon } from "../../components/atoms/Icons/BikeIcon"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { DisplayTypeSelection } from "../../components/molecules/Lists/DisplayTypeSelection"
import { Dropzone } from "../../components/molecules"
import { RoutesTable } from "../../components/modules/Search/RoutesTable"
import { RoutesGrid } from "../../components/modules/Search/RoutesGrid"
import { RouteListToolbar } from "../../components/modules/Search/Toolbar"
import { RouteFilterPanel } from "../../components/modules/Search/FilterPanel"
import { ActiveImportRow } from "../../components/modules/Search/ActiveImportRow"
import { DEFAULT_FILTERS } from "../../components/modules/routeSelection/UploadCard/summary"
import { useKey } from "../../hooks/ui/useKey"
import { CONTENT_PADDING, DROP_OVERLAY_TITLE, FREE_RIDE_TOOLTIP, SORT_OPTIONS, getDropOverlayHint, getFilterChips, getHeaderLayout } from "./utils"

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const PAGE_UP = 'PageUp'
const PAGE_DOWN = 'PageDown'

// approximate height of one row/card incl. its gap - used for the Up/Down key scroll step
const ROW_STEP_VH = { list: 7.5, tiles: 26.5 }

const View = styled(Row)`
    width: 100%;
    height: 100%;
    overflow-y: hidden;
`

const ContentArea = styled(Column)`
    width: 100%;
    min-width: 0;
    user-select:none;
    height: 100%;
    padding-left:${CONTENT_PADDING/2}px;
    padding-right: ${CONTENT_PADDING/2}px;
    overflow-y: hidden;
    box-sizing: border-box;
    position: relative;
`

// page-level drop overlay (ux.md §5.7) - the existing Dropzone molecule, relocated to cover the
// whole content area instead of one carousel card. Only rendered while a file is being dragged
// over the page, so its own click-to-pick behaviour never competes with clicking a route row.
const DropOverlay = styled(Dropzone)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 20;
    background-color: rgba(0,0,0,0.6);
    border-width: 3px;
    border-color: #dd9933;
    border-radius: 8px;
    color: white;
`

const DropOverlayTitle = styled.div`
    font-size: 2.4vh;
    font-weight: bold;
`

const DropOverlayHint = styled.div`
    font-size: 1.6vh;
    margin-top: 0.6vh;
    opacity: 0.85;
`

// Title row (the bare PageTitle atom, centered) and the actions row below it, always stacked -
// see ux.md §3.1/§3.10: the title never shares its row with anything else, on any page.
const Header = styled(Column)`
    width: 100%;
`

const Actions = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
`

const ButtonContent = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.6ch;
    padding: 0 0.5ch;
`

const ListArea = styled.div`
    flex: 1 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    position: relative;
    width: 100%;
`

const PinnedArea = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin-bottom: 0.5vh;
`

const StateArea = styled(Column)`
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
`

const StateText = styled(Text)`
    max-width: 60ch;
    margin: 1vh 0 1vh 0;
    font-size: 2vh;
    white-space: normal;
`

const isFormField = (el) => {
    const tag = el?.tagName
    return tag==='INPUT' || tag==='SELECT' || tag==='TEXTAREA'
}

/**
 * Measures the width of the page's content area (excluding its padding), tracking window resizes.
 */
const useContentWidth = (ref) => {
    const [width,setWidth] = useState(undefined)

    useLayoutEffect( ()=>{
        const measure = ()=>{
            const el = ref.current
            if (!el)
                return
            const w = el.clientWidth ? el.clientWidth-CONTENT_PADDING : undefined
            setWidth(w)
        }

        measure()

        let observer
        if (typeof ResizeObserver !== 'undefined' && ref.current) {
            observer = new ResizeObserver(measure)
            observer.observe(ref.current)
        }
        window.addEventListener('resize',measure)
        return ()=>{
            window.removeEventListener('resize',measure)
            observer?.disconnect()
        }
    },[ref])

    return width
}

const FreeRideButton = ({onClick, secondary}) => (
    <Button id='freeRide' title={FREE_RIDE_TOOLTIP} secondary={secondary} onClick={onClick}>
        <ButtonContent><BikeIcon width={32} height={18} color='currentColor'/>Free Ride</ButtonContent>
    </Button>
)

const ImportRoutesButton = ({onClick, primary}) => (
    <Button id='importRoutes' primary={primary} onClick={onClick}>
        <ButtonContent><UploadIcon size={16}/>Import Routes</ButtonContent>
    </Button>
)

/**
 * The merged Routes page (list/tiles, search, filters, sort, Free Ride and Import actions).
 */
export const RouteListScreen = ({
        routes, cards, filters={}, units, countries, contentTypes, routeTypes, routeSources,
        totalCount, countText, noMatchHint, activeImports=[],
        loading, displayType='list', sortOrder='suggested', filtersExpanded=false, listKey,
        onChangeFilter, onRemoveFilter, onClearPanelFilters, onClearAllFilters,
        onToggleFilters, onSortOrderChanged, onDisplayTypeSelected,
        onSelect, onDelete, onRetryImport, onDeleteImport,
        onFreeRide, onImportRoutes, onImportFiles, closePage
    }) => {

    const contentRef = useRef(null)
    const listRef = useRef(null)
    const searchRef = useRef(null)
    const [fieldFocused,setFieldFocused] = useState(false)

    // --- page-level drop overlay (ux.md §5.7) ---
    // a plain counter, exactly like the one the Dropzone molecule itself keeps, so a drag
    // crossing into/out of a nested row (RouteItem, a button, ...) doesn't flicker the overlay -
    // only the transition to/from zero shows or hides it. Capture-phase handlers see every
    // enter/leave that bubbles through this subtree regardless of what a nested Dropzone's own
    // (bubble-phase) handlers do further down, so the overlay's lifecycle never depends on them.
    const dragDepth = useRef(0)
    const [dragActive,setDragActive] = useState(false)
    const [dragFileCount,setDragFileCount] = useState(0)

    const onContentDragEnterCapture = (e) => {
        e.preventDefault()
        dragDepth.current += 1
        if (dragDepth.current===1) {
            const count = e.dataTransfer?.items?.length ?? e.dataTransfer?.files?.length ?? 0
            setDragFileCount(count)
            setDragActive(true)
        }
    }

    const onContentDragOverCapture = (e) => {
        e.preventDefault()
    }

    const onContentDragLeaveCapture = () => {
        dragDepth.current = Math.max(0,dragDepth.current-1)
        if (dragDepth.current===0)
            setDragActive(false)
    }

    const onContentDropCapture = (e) => {
        // must not rely on the overlay Dropzone's own (bubble-phase) preventDefault(): a drop can
        // reach the browser before the overlay ever mounts, and an unhandled drop's default action
        // is to navigate the window to the dropped file instead of importing it.
        e.preventDefault()
        dragDepth.current = 0
        setDragActive(false)
    }

    // dropping never opens ImportRoutesDialog - it imports immediately through the same
    // RouteListService.import() the old carousel's UploadCard called, reporting progress as
    // pinned ActiveImport rows (HLD §4.3/§4.7)
    const onOverlayDrop = (dropInfo) => {
        if (typeof onImportFiles === 'function')
            onImportFiles(dropInfo)
    }

    const contentWidth = useContentWidth(contentRef)
    const {singleColumnFilters} = getHeaderLayout(contentWidth)

    const chips = getFilterChips(filters)

    // --- keyboard ---

    // RoutesTable/RoutesGrid render their scroll container as the list area's only child
    const getScrollContainer = () => listRef.current?.firstElementChild ?? null

    const scroll = (direction, page) => {
        const div = getScrollContainer()
        if (!div)
            return

        const step = page ? (div.clientHeight || window.innerHeight*0.6)
                          : window.innerHeight*(ROW_STEP_VH[displayType]??ROW_STEP_VH.list)/100
        const top = direction*step

        div.focus?.()
        if (typeof div.scrollBy === 'function')
            div.scrollBy({left:0, top, behavior:'smooth'})
        else
            div.scrollTop = (div.scrollTop??0)+top
    }

    const onScrollKey = (info) => {
        if (isFormField(document.activeElement))
            return

        switch (info.key) {
            case UP:        scroll(-1,false); break;
            case DOWN:      scroll(1,false); break;
            case PAGE_UP:   scroll(-1,true); break;
            case PAGE_DOWN: scroll(1,true); break;
            default: break;
        }
    }
    useKey([UP,DOWN,PAGE_UP,PAGE_DOWN], onScrollKey)

    const onFocusSearchKey = (info) => {
        // '/' typed into another field is just a character
        if (info.key==='/' && isFormField(document.activeElement))
            return
        searchRef.current?.focus()
    }
    useKey([{key:'f',ctrlKey:true},'/'], onFocusSearchKey)

    // bare-letter hotkeys of the navigation bar must not fire while the user types
    const onFocusCapture = useCallback( (e)=>{ if (isFormField(e.target)) setFieldFocused(true) },[])
    const onBlurCapture = useCallback( (e)=>{ if (isFormField(e.target)) setFieldFocused(false) },[])

    const onTitleChange = (title) => {
        if (typeof onChangeFilter === 'function')
            onChangeFilter({...filters, title})
    }

    // --- list area ---

    const renderList = () => {
        if (loading)
            return <Center><Loader/></Center>

        if (!totalCount) {
            return (
                <StateArea className='empty-library'>
                    <GroupTitle>No routes yet</GroupTitle>
                    <StateText text='Import your own GPX routes or a folder of video routes — or start a Free Ride and pick any road on the map.' />
                    <Row justify='center'>
                        <ImportRoutesButton primary onClick={onImportRoutes} />
                        <FreeRideButton secondary onClick={onFreeRide} />
                    </Row>
                </StateArea>
            )
        }

        if (!routes?.length) {
            return (
                <StateArea className='no-match'>
                    <GroupTitle>No routes match</GroupTitle>
                    {noMatchHint ? <StateText text={noMatchHint} /> : null}
                    <Row justify='center'>
                        <Button id='clearAllFilters' primary onClick={onClearAllFilters}>Clear all filters</Button>
                    </Row>
                </StateArea>
            )
        }

        if (displayType==='tiles') {
            return <RoutesGrid key={`tiles-${listKey}`} cards={cards} onSelect={onSelect} onDelete={onDelete}/>
        }
        return <RoutesTable key={`list-${listKey}`} routes={routes} onSelect={onSelect} onDelete={onDelete}/>
    }

    return (
        <MainPage >
            <View >
                <NavigationBar closePage={closePage} selected='routes' hotkeysDisabled={fieldFocused}/>

                <ContentArea ref={contentRef} className='route-list-page' onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}
                    onDragEnterCapture={onContentDragEnterCapture} onDragOverCapture={onContentDragOverCapture}
                    onDragLeaveCapture={onContentDragLeaveCapture} onDropCapture={onContentDropCapture}>
                    <Header className='route-list-header'>
                        <PageTitle>Routes</PageTitle>
                        <Actions className='route-list-actions'>
                            <FreeRideButton onClick={onFreeRide} />
                            <ImportRoutesButton onClick={onImportRoutes} />
                            <DisplayTypeSelection selected={displayType} onSelected={onDisplayTypeSelected} />
                        </Actions>
                    </Header>

                    <RouteListToolbar ref={searchRef}
                        title={filters?.title}
                        chips={chips}
                        filtersExpanded={filtersExpanded}
                        countText={loading ? undefined : countText}
                        sortOrder={sortOrder}
                        sortOptions={SORT_OPTIONS}
                        onTitleChange={onTitleChange}
                        onToggleFilters={onToggleFilters}
                        onRemoveFilter={onRemoveFilter}
                        onClearFilters={onClearPanelFilters}
                        onSortOrderChange={onSortOrderChanged}
                    />

                    {filtersExpanded ?
                        <RouteFilterPanel filters={filters} units={units}
                            countries={countries} contentTypes={contentTypes} routeTypes={routeTypes} routeSources={routeSources}
                            onChange={onChangeFilter} singleColumn={singleColumnFilters} />
                        : null}

                    {activeImports.length>0 ?
                        <PinnedArea className='pinned-imports'>
                            {activeImports.map( (card,idx) => (
                                <ActiveImportRow key={card.getId?.() ?? idx} card={card} onRetry={onRetryImport} onDelete={onDeleteImport} />
                            ))}
                        </PinnedArea>
                        : null}

                    <ListArea ref={listRef} className='route-list-scroll'>
                        {renderList()}
                    </ListArea>

                    {dragActive ?
                        <DropOverlay className='route-drop-overlay' width='100%' height='100%'
                            multiple filters={DEFAULT_FILTERS} onDrop={onOverlayDrop}
                            text={
                                <>
                                    <DropOverlayTitle>{DROP_OVERLAY_TITLE}</DropOverlayTitle>
                                    <DropOverlayHint>{getDropOverlayHint(dragFileCount)}</DropOverlayHint>
                                </>
                            } />
                        : null}
                </ContentArea>
            </View>
        </MainPage>
    )
}
