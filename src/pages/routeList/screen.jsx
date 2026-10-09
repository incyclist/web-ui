import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import styled from "styled-components"
import MainPage from "../../components/molecules/MainPage"
import { Button, Center, Loader, PageTitle, Text, Tooltip } from "../../components/atoms"
import { Column, Row } from "../../components/atoms/layout/View"
import { BikeIcon } from "../../components/atoms/Icons/BikeIcon"
import { ImportIcon } from "../../components/atoms/Icons/ImportIcon"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { Dropzone } from "../../components/molecules"
import { RoutesTable } from "../../components/modules/Search/RoutesTable"
import { RouteTiles } from "../../components/modules/Search/RouteTiles"
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
    overflow-x: hidden;
    box-sizing: border-box;
    position: relative;
`

// page-level drop overlay - the existing Dropzone molecule, relocated to cover the
// whole content area instead of one carousel card. Only rendered while a file is being dragged
// over the page, so its own click-to-pick behaviour never competes with clicking a route row.
const DropOverlay = styled(Dropzone)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    // Dropzone adds padding and a border on top of the 100% it is given - without border-box the
    // overlay is wider than the page and a horizontal scrollbar appears while dragging
    box-sizing: border-box;
    margin: 0;
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

// Header, one row, three slots: Free Ride (left) / title (center) / Import Routes (right). The
// left and right slots are both 1fr, so the title sits at the true horizontal center of the row,
// exactly like every other page's title.
//
// When the buttons and the title don't all fit in one row at the current window size (see
// getHeaderLayout() in utils.js), this falls back to a stacked layout: title alone, centered, on
// its own row; Free Ride (left) and Import Routes (right) on a second row. Both layouts render the
// exact same elements - only the grid template changes - so the refs used to measure their
// rendered widths keep pointing at live DOM nodes across the switch.
const HeaderLayout = styled.div`
    display: grid;
    grid-template-columns: ${props => props.$stacked ? '1fr 1fr' : '1fr auto 1fr'};
    grid-template-areas: ${props => props.$stacked ? '"title title" "free import"' : '"free title import"'};
    align-items: center;
    row-gap: 1vh;
    width: 100%;
`

// max-content: the wrapper's width is the button's own width, whatever its grid column offers.
// display:flex: the Button atom floats itself, which would otherwise collapse the wrapper's height.
const HeaderSlot = styled.div`
    display: flex;
    width: max-content;
    grid-area: ${props => props.$area};
    justify-self: ${props => props.$end ? 'end' : 'start'};
`

// The bare PageTitle atom (unchanged) - PageTitle sets width:100% internally to center its own
// text, so this wrapper constrains it back down to its content size while the header is a
// three-slot grid (an `auto` column sizes to its content only while its item doesn't stretch to
// fill it - hence the nowrap, no explicit width here). In the stacked fallback it goes back to
// full width, letting PageTitle center itself across the whole row exactly as it did before.
const TitleCell = styled.div`
    grid-area: title;
    ${props => props.$stacked ? 'width: 100%;' : 'white-space: nowrap;'}
`

// header buttons are never truncated or collapsed to icon-only, they stack instead
const HeaderButtonContent = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    flex-shrink: 0;
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
    color: white;
`

// GroupTitle is left-aligned and full width (it titles a form group); this is a centered
// headline of a state that fills the whole content area
const StateTitle = styled.div`
    font-size: 3vh;
    font-weight: bold;
    color: white;
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

/**
 * Measures an element's own rendered (scroll) width, tracking window/element resizes. Used to
 * measure the header's actions group and title so getHeaderLayout() can decide, from their actual
 * rendered sizes, whether they still fit next to each other.
 */
const useElementWidth = (ref) => {
    const [width,setWidth] = useState(undefined)

    useLayoutEffect( ()=>{
        const measure = ()=>{
            const el = ref.current
            if (!el)
                return
            setWidth(el.scrollWidth)
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

const FreeRideButton = ({onClick}) => (
    <Tooltip text={FREE_RIDE_TOOLTIP}>
        <Button id='freeRide' outline no3D margin='0' onClick={onClick}>
            <HeaderButtonContent><BikeIcon width='1.9em' height='1.25em' color='currentColor'/>Free Ride</HeaderButtonContent>
        </Button>
    </Tooltip>
)

const ImportRoutesButton = ({onClick}) => (
    <Button id='importRoutes' outline no3D margin='0' onClick={onClick}>
        <HeaderButtonContent><ImportIcon/>Import Routes</HeaderButtonContent>
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
    const freeRideRef = useRef(null)
    const importRef = useRef(null)
    const titleRef = useRef(null)
    const [fieldFocused,setFieldFocused] = useState(false)

    // --- page-level drop overlay ---
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
        // The overlay is hidden only after this event has been fully dispatched. React flushes a
        // state change made here before the event reaches the overlay's own (bubble-phase) drop
        // handler, which would unmount the overlay and lose the drop.
        setTimeout( ()=>{
            dragDepth.current = 0
            setDragActive(false)
        },0)
    }

    // dropping never opens ImportRoutesDialog - it imports immediately through the same
    // RouteListService.import() the old carousel's UploadCard called, reporting progress as
    // pinned ActiveImport rows
    const onOverlayDrop = (dropInfo) => {
        if (typeof onImportFiles === 'function')
            onImportFiles(dropInfo)
    }

    const contentWidth = useContentWidth(contentRef)
    const freeRideWidth = useElementWidth(freeRideRef)
    const importWidth = useElementWidth(importRef)
    const titleWidth = useElementWidth(titleRef)
    const {stackHeader, singleColumnFilters} = getHeaderLayout(freeRideWidth, importWidth, titleWidth, contentWidth)

    const chips = getFilterChips(filters)

    // --- keyboard ---

    // RoutesTable/RouteTiles render their scroll container as the list area's only child
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
                    <StateTitle>No routes yet</StateTitle>
                    <StateText align='center' color='white' text='Import your own GPX routes or a folder of video routes — or start a Free Ride and pick any road on the map.' />
                </StateArea>
            )
        }

        if (!routes?.length) {
            return (
                <StateArea className='no-match'>
                    <StateTitle>No routes match</StateTitle>
                    {noMatchHint ? <StateText align='center' color='white' text={noMatchHint} /> : null}
                    <Row justify='center'>
                        <Button id='clearAllFilters' primary onClick={onClearAllFilters}>Clear all filters</Button>
                    </Row>
                </StateArea>
            )
        }

        if (displayType==='tiles') {
            return <RouteTiles key={`tiles-${listKey}`} cards={cards} onSelect={onSelect} onDelete={onDelete}/>
        }
        return <RoutesTable key={`list-${listKey}`} variant='routeList' routes={routes} onSelect={onSelect} onDelete={onDelete}/>
    }

    return (
        <MainPage >
            <View >
                <NavigationBar closePage={closePage} selected='routes' hotkeysDisabled={fieldFocused}/>

                <ContentArea ref={contentRef} className='route-list-page' onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}
                    onDragEnterCapture={onContentDragEnterCapture} onDragOverCapture={onContentDragOverCapture}
                    onDragLeaveCapture={onContentDragLeaveCapture} onDropCapture={onContentDropCapture}>
                    <HeaderLayout className='route-list-header' $stacked={stackHeader} data-header-layout={stackHeader ? 'stacked' : 'grid'}>
                        <HeaderSlot className='route-list-free-ride' ref={freeRideRef} $area='free'>
                            <FreeRideButton onClick={onFreeRide} />
                        </HeaderSlot>
                        <TitleCell className='route-list-title' ref={titleRef} $stacked={stackHeader}>
                            <PageTitle>Routes</PageTitle>
                        </TitleCell>
                        <HeaderSlot className='route-list-import' ref={importRef} $area='import' $end>
                            <ImportRoutesButton onClick={onImportRoutes} />
                        </HeaderSlot>
                    </HeaderLayout>

                    <RouteListToolbar ref={searchRef}
                        title={filters?.title}
                        chips={chips}
                        filtersExpanded={filtersExpanded}
                        countText={loading ? undefined : countText}
                        sortOrder={sortOrder}
                        sortOptions={SORT_OPTIONS}
                        displayType={displayType}
                        onDisplayTypeSelected={onDisplayTypeSelected}
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
