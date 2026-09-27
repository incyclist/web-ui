import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

const { FakeObserver, mockService, mockOpenDialog, screenProps, importRoutesDialogProps } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
        count(event) { return (this.listeners[event] ?? []).length }
    }
    return { FakeObserver, mockService: {}, mockOpenDialog: vi.fn(), screenProps: [], importRoutesDialogProps: [] }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useDevicePairing: () => ({ isReadyToStart: () => false }),
        useRouteList: () => mockService,
    }
})

// the screen is covered by its own tests - here it only records what the page passes to it
vi.mock('./screen', () => ({
    RouteListScreen: (props) => { screenProps.push(props); return <div data-testid='screen' /> }
}))

vi.mock('../../components/molecules', async () => {
    const React = await import('react')
    return {
        DialogLauncher: React.forwardRef((props, ref) => {
            React.useImperativeHandle(ref, () => ({ openDialog: mockOpenDialog, closeDialog: vi.fn() }))
            return null
        })
    }
})

vi.mock('../../components/modules/routeSelection/RouteDetails', () => ({ RouteDetailsDialog: () => null }))
vi.mock('../../components/modules/routeSelection/FreeRideSettings', () => ({ FreeRideSettingsDialog: () => null }))

// ImportRoutesDialog is not opened through DialogLauncher (its own props/tests cover its
// content) - here only whether it is mounted, and with what onClose, is this page's concern
vi.mock('../../components/modules/routeSelection/ImportRoutesDialog', () => ({
    ImportRoutesDialog: (props) => { importRoutesDialogProps.push(props); return <div data-testid='import-routes-dialog' /> }
}))

import { RouteListPage } from './page'
import { RouteDetailsDialog } from '../../components/modules/routeSelection/RouteDetails'
import { FreeRideSettingsDialog } from '../../components/modules/routeSelection/FreeRideSettings'

const makeRoutes = (n, prefix='r') => Array.from({length:n}, (_,i) => ({id:`${prefix}${i}`, title:`Route ${i}`}))

const makeCard = (type, id) => ({
    getId: () => id,
    getCardType: () => type,
    getDisplayProperties: () => ({ title:id }),
    delete: vi.fn(),
    retry: vi.fn(),
})

const last = () => screenProps[screenProps.length-1]

describe('RouteListPage', () => {

    let observer
    let routes
    let allRoutes
    let freeRideCard
    let importCard
    let routeCard

    beforeEach(() => {
        screenProps.length = 0
        importRoutesDialogProps.length = 0
        observer = new FakeObserver()
        allRoutes = makeRoutes(5)
        routes = allRoutes
        freeRideCard = makeCard('Free-Ride','Free-Ride')
        importCard = makeCard('ActiveImport','new.gpx')
        routeCard = makeCard('Route','r1')

        Object.assign(mockService, {
            getDisplayType: vi.fn(() => 'tiles'),
            setDisplayType: vi.fn(),
            getSortOrder: vi.fn(() => 'suggested'),
            setSortOrder: vi.fn(),
            getFiltersExpanded: vi.fn(() => false),
            setFiltersExpanded: vi.fn(),
            getListTop: vi.fn(),
            setListTop: vi.fn(),
            isStillLoading: vi.fn(() => false),
            preload: vi.fn(() => ({ wait: () => Promise.resolve() })),
            search: vi.fn((filters) => ({ routes, cards:routes, filters:filters??{}, observer, units:{distance:'km', elevation:'m'} })),
            searchRepo: vi.fn((filters) => ({ routes: filters?.title ? allRoutes.slice(0,3) : allRoutes })),
            getFilterOptions: vi.fn(() => ({ countries:['France'], contentTypes:['Video','GPX'], routeTypes:['Loop'], routeSources:['Local'] })),
            getCard: vi.fn(() => routeCard),
            getLists: vi.fn(() => [{ getCards: () => [freeRideCard, importCard, routeCard] }]),
        })
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderPage = () => render(<MemoryRouter><RouteListPage /></MemoryRouter>)

    test('the first render already uses the persisted view, sort order and filter panel state', () => {
        mockService.getFiltersExpanded.mockReturnValue(true)
        mockService.getSortOrder.mockReturnValue('distance')
        renderPage()

        expect(screenProps[0].displayType).toBe('tiles')
        expect(screenProps[0].sortOrder).toBe('distance')
        expect(screenProps[0].filtersExpanded).toBe(true)
    })

    test('searches on open and passes the result to the screen', () => {
        renderPage()

        expect(mockService.search).toHaveBeenCalledTimes(1)
        expect(last().routes).toHaveLength(5)
        expect(last().loading).toBe(false)
        expect(last().countText).toBe('5 routes')
        expect(last().totalCount).toBe(5)
        expect(last().countries).toEqual(['France'])
    })

    test('waits for the preload if the route list is still loading', async () => {
        let resolve
        mockService.isStillLoading.mockReturnValue(true)
        mockService.preload.mockReturnValue({ wait: () => new Promise(r => { resolve = r }) })

        renderPage()
        expect(last().loading).toBe(true)
        expect(mockService.search).not.toHaveBeenCalled()

        await act(async () => { resolve() })
        expect(mockService.search).toHaveBeenCalledTimes(1)
        expect(last().loading).toBe(false)
    })

    test('list updates from the service (import, delete, sync) refresh the page without restarting the list', () => {
        renderPage()
        const key = last().listKey

        act(() => { observer.emit('updated', { routes:makeRoutes(6), cards:[], filters:{}, observer }) })
        expect(last().routes).toHaveLength(6)
        expect(last().listKey).toBe(key)
    })

    test('updates during a sync are applied once the sync is done', () => {
        renderPage()

        act(() => { observer.emit('sync-start') })
        act(() => { observer.emit('updated', { routes:makeRoutes(7), cards:[], filters:{}, observer }) })
        expect(last().routes).toHaveLength(5)

        act(() => { observer.emit('sync-done') })
        expect(last().routes).toHaveLength(7)
    })

    test('subscribes to the service observer only once, and unsubscribes on close', () => {
        const { unmount } = renderPage()
        act(() => { last().onChangeFilter({title:'Alpe'}) })
        act(() => { last().onSortOrderChanged('name') })

        expect(observer.count('updated')).toBe(1)
        unmount()
        expect(observer.count('updated')).toBe(0)
        expect(observer.count('sync-start')).toBe(0)
        expect(observer.count('sync-done')).toBe(0)
    })

    describe('filters', () => {

        test('a filter change searches again and restarts the list at the top', () => {
            renderPage()
            const key = last().listKey

            act(() => { last().onChangeFilter({title:'Alpe', country:'France'}) })
            expect(mockService.search).toHaveBeenLastCalledWith({title:'Alpe', country:'France'})
            expect(last().listKey).not.toBe(key)
        })

        test('removing a chip and Clear all keep the title search, Clear all filters does not', () => {
            renderPage()
            act(() => { last().onChangeFilter({title:'Alpe', country:'France', contentType:'Video'}) })

            act(() => { last().onRemoveFilter('country') })
            expect(mockService.search).toHaveBeenLastCalledWith({title:'Alpe', contentType:'Video'})

            act(() => { last().onClearPanelFilters() })
            expect(mockService.search).toHaveBeenLastCalledWith({title:'Alpe'})

            act(() => { last().onClearAllFilters() })
            expect(mockService.search).toHaveBeenLastCalledWith({})
        })

        test('the filter panel state is persisted', () => {
            renderPage()
            expect(last().filtersExpanded).toBe(false)

            act(() => { last().onToggleFilters() })
            expect(mockService.setFiltersExpanded).toHaveBeenCalledWith(true)
            expect(last().filtersExpanded).toBe(true)

            act(() => { last().onToggleFilters() })
            expect(mockService.setFiltersExpanded).toHaveBeenLastCalledWith(false)
            expect(last().filtersExpanded).toBe(false)
        })

        test('a filtered list reports "<n> of <m> routes"', () => {
            renderPage()
            routes = allRoutes.slice(0,2)
            act(() => { last().onChangeFilter({country:'France'}) })

            expect(last().countText).toBe('2 of 5 routes')
            expect(last().totalCount).toBe(5)
        })

        test('no match: suggests the title search on its own', () => {
            renderPage()
            routes = []
            act(() => { last().onChangeFilter({title:'Ventoux', country:'France'}) })

            expect(last().routes).toHaveLength(0)
            expect(last().noMatchHint).toBe('Try removing a filter — 3 routes match “Ventoux” on its own.')
        })

        test('an empty library reports a total of 0', () => {
            routes = []
            allRoutes = []
            renderPage()
            expect(last().totalCount).toBe(0)
        })
    })

    describe('sort and view', () => {

        test('changing the sort order persists it, resets both scroll positions and searches again', () => {
            renderPage()
            const key = last().listKey
            const searches = mockService.search.mock.calls.length

            act(() => { last().onSortOrderChanged('name') })

            expect(mockService.setSortOrder).toHaveBeenCalledWith('name')
            expect(mockService.setListTop).toHaveBeenCalledWith('list',0)
            expect(mockService.setListTop).toHaveBeenCalledWith('tiles',0)
            expect(mockService.search.mock.calls.length).toBe(searches+1)
            expect(last().sortOrder).toBe('name')
            expect(last().listKey).not.toBe(key)
        })

        test('selecting the current sort order again does nothing', () => {
            renderPage()
            act(() => { last().onSortOrderChanged('suggested') })
            expect(mockService.setSortOrder).not.toHaveBeenCalled()
        })

        test('switching the view persists it', () => {
            renderPage()
            act(() => { last().onDisplayTypeSelected('list') })
            expect(mockService.setDisplayType).toHaveBeenCalledWith('list')
            expect(last().displayType).toBe('list')
        })
    })

    describe('actions', () => {

        test('Free Ride opens the free ride settings for the free ride card', () => {
            renderPage()
            act(() => { last().onFreeRide() })

            expect(mockOpenDialog).toHaveBeenCalledTimes(1)
            const [Dialog, props] = mockOpenDialog.mock.calls[0]
            expect(Dialog).toBe(FreeRideSettingsDialog)
            expect(props.card).toBe(freeRideCard)
            expect(typeof props.onStart).toBe('function')
        })

        test('Import Routes mounts the dialog, not through DialogLauncher', () => {
            const { container } = renderPage()
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).toBeNull()

            act(() => { last().onImportRoutes() })

            expect(mockOpenDialog).not.toHaveBeenCalled()
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).not.toBeNull()
        })

        test('closing the dialog unmounts it, and reopening mounts a fresh instance', () => {
            const { container } = renderPage()

            act(() => { last().onImportRoutes() })
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).not.toBeNull()
            const propsAtFirstOpen = importRoutesDialogProps.length

            act(() => { importRoutesDialogProps[importRoutesDialogProps.length-1].onClose() })
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).toBeNull()

            act(() => { last().onImportRoutes() })
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).not.toBeNull()
            // a genuinely new mount (not the same instance carrying stale phase state across opens)
            expect(importRoutesDialogProps.length).toBeGreaterThan(propsAtFirstOpen)
        })

        test('selecting a route opens its details', () => {
            renderPage()
            act(() => { last().onSelect('r1') })

            const [Dialog, props] = mockOpenDialog.mock.calls[0]
            expect(Dialog).toBe(RouteDetailsDialog)
            expect(props.card).toBe(routeCard)
        })

        test('deleting a route deletes its card', () => {
            renderPage()
            act(() => { last().onDelete('r1') })
            expect(mockService.getCard).toHaveBeenCalledWith('r1')
            expect(routeCard.delete).toHaveBeenCalledTimes(1)
        })

        test('in-flight imports are passed to the screen separately from the routes', () => {
            renderPage()
            expect(last().activeImports).toEqual([importCard])

            act(() => { last().onRetryImport(importCard) })
            expect(importCard.retry).toHaveBeenCalled()
            act(() => { last().onDeleteImport(importCard) })
            expect(importCard.delete).toHaveBeenCalled()
        })

        test('files dropped on the page-level overlay import through the same service call the old carousel used, no dialog', () => {
            mockService.import = vi.fn()
            const { container } = renderPage()

            const dropInfo = [{type:'url', name:'route.gpx', dir:'/tmp', ext:'gpx'}]
            act(() => { last().onImportFiles(dropInfo) })

            expect(mockService.import).toHaveBeenCalledWith(dropInfo)
            expect(mockOpenDialog).not.toHaveBeenCalled()
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).toBeNull()
        })

        test('a multi-file drop (e.g. a batch of GPX routes) is one import call, still no dialog', () => {
            mockService.import = vi.fn()
            const { container } = renderPage()

            const dropInfo = ['a.gpx','b.gpx','c.gpx'].map( name => ({type:'url', name, dir:'/tmp', ext:'gpx'}))
            act(() => { last().onImportFiles(dropInfo) })

            expect(mockService.import).toHaveBeenCalledTimes(1)
            expect(mockService.import).toHaveBeenCalledWith(dropInfo)
            expect(importRoutesDialogProps).toHaveLength(0)
            expect(container.querySelector('[data-testid="import-routes-dialog"]')).toBeNull()
        })
    })
})
