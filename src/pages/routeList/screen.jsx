import React, { useCallback, useLayoutEffect, useRef, useState } from "react"
import styled from "styled-components"
import { UploadIcon } from "@primer/octicons-react"
import MainPage from "../../components/molecules/MainPage"
import { Button, Center, GroupTitle, Loader, PageTitle, Text } from "../../components/atoms"
import { Column, Row } from "../../components/atoms/layout/View"
import { BikeIcon } from "../../components/atoms/Icons/BikeIcon"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { DisplayTypeSelection } from "../../components/molecules/Lists/DisplayTypeSelection"
import { RoutesTable } from "../../components/modules/Search/RoutesTable"
import { RoutesGrid } from "../../components/modules/Search/RoutesGrid"
import { RouteListToolbar } from "../../components/modules/Search/Toolbar"
import { RouteFilterPanel } from "../../components/modules/Search/FilterPanel"
import { ActiveImportRow } from "../../components/modules/Search/ActiveImportRow"
import { useKey } from "../../hooks/ui/useKey"
import { CONTENT_PADDING, FREE_RIDE_TOOLTIP, SORT_OPTIONS, getFilterChips, getHeaderLayout } from "./utils"

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
`

const Header = styled.div`
    display: flex;
    flex-direction: ${props => props.$stacked ? 'column' : 'row'};
    align-items: ${props => props.$stacked ? 'stretch' : 'center'};
    justify-content: space-between;
    width: 100%;
`

// PageTitle centers itself across the full width - on this page the title sits left of the actions
const TitleArea = styled.div`
    flex: 1 1 auto;
    min-width: 0;
    & > div {
        justify-content: flex-start;
        text-align: left;
    }
`

const Actions = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: ${props => props.$stacked ? 'flex-start' : 'flex-end'};
    flex: 0 0 auto;
    width: ${props => props.$stacked ? '100%' : 'auto'};
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
        onFreeRide, onImportRoutes, closePage
    }) => {

    const contentRef = useRef(null)
    const listRef = useRef(null)
    const searchRef = useRef(null)
    const [fieldFocused,setFieldFocused] = useState(false)

    const contentWidth = useContentWidth(contentRef)
    const {actionsOnOwnRow, singleColumnFilters} = getHeaderLayout(contentWidth)

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

                <ContentArea ref={contentRef} className='route-list-page' onFocusCapture={onFocusCapture} onBlurCapture={onBlurCapture}>
                    <Header className='route-list-header' $stacked={actionsOnOwnRow} data-layout={actionsOnOwnRow ? 'stacked' : 'row'}>
                        <TitleArea><PageTitle>Routes</PageTitle></TitleArea>
                        <Actions className='route-list-actions' $stacked={actionsOnOwnRow}>
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
                </ContentArea>
            </View>
        </MainPage>
    )
}
