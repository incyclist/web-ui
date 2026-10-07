import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'

vi.mock('../../components/molecules/MainPage', () => ({
    default: ({children}) => <div data-testid='main-page'>{children}</div>
}))

vi.mock('../../components/molecules/NavigationBar', () => ({
    NavigationBar: ({selected, hotkeysDisabled}) => <div data-testid='nav' data-selected={selected} data-hotkeys-disabled={String(!!hotkeysDisabled)} />
}))

vi.mock('../../components/modules/Search/RoutesTable', () => ({
    RoutesTable: ({routes}) => <div data-testid='routes-table' className='routes' data-count={routes?.length} />
}))

vi.mock('./RouteTiles', () => ({
    RouteTiles: ({cards}) => <div data-testid='routes-grid' data-count={cards?.length} />
}))

// Dropzone talks to the native file dialog and native drag/drop internals, neither of which
// works under jsdom - stubbed to capture the props the screen passed it and let a test call
// onDrop directly, per this repo's convention for heavy/native molecules (see LandingView's test).
const { rendered } = vi.hoisted(() => ({ rendered: { dropzoneProps: null } }))
vi.mock('../../components/molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dropzone: (props) => {
            rendered.dropzoneProps = props
            // like the real Dropzone, the file hand-over happens in the element's own (bubble-phase) drop handler
            return <div data-testid='drop-overlay' className={props.className} onDrop={() => props.onDrop?.([{type:'url', url:'file:///routes/ride.gpx'}])}>{props.text}</div>
        }
    }
})

import { RouteListScreen } from './screen'
import { DEFAULT_FILTERS } from '../../components/modules/routeSelection/UploadCard/summary'

const routes = [{id:'r1', title:'Alpe'}, {id:'r2', title:'Ventoux'}]
const cards = [{id:'r1'}, {id:'r2'}]

const baseProps = {
    routes, cards, filters:{}, totalCount:2, countText:'2 routes', loading:false,
    displayType:'list', sortOrder:'suggested', filtersExpanded:false, listKey:0,
}

let contentWidth
const setContentWidth = (w) => { contentWidth = w }

// measured widths of the header's actions group and title, read through `scrollWidth` exactly
// like the header component itself does - defaults to 0 (unmeasured), which never forces a stack
let actionsWidth
let titleWidth
const setActionsWidth = (w) => { actionsWidth = w }
const setTitleWidth = (w) => { titleWidth = w }

describe('RouteListScreen', () => {

    let clientWidthDescriptor
    let scrollWidthDescriptor

    beforeEach(() => {
        contentWidth = 0
        actionsWidth = 0
        titleWidth = 0
        rendered.dropzoneProps = null
        clientWidthDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth')
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
            configurable: true,
            get() { return this.classList?.contains('route-list-page') ? contentWidth : 0 }
        })
        scrollWidthDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'scrollWidth')
        Object.defineProperty(HTMLElement.prototype, 'scrollWidth', {
            configurable: true,
            get() {
                if (this.classList?.contains('route-list-free-ride') || this.classList?.contains('route-list-import')) return actionsWidth
                if (this.classList?.contains('route-list-title')) return titleWidth
                return 0
            }
        })
    })

    afterEach(() => {
        if (clientWidthDescriptor)
            Object.defineProperty(HTMLElement.prototype, 'clientWidth', clientWidthDescriptor)
        if (scrollWidthDescriptor)
            Object.defineProperty(HTMLElement.prototype, 'scrollWidth', scrollWidthDescriptor)
        vi.clearAllMocks()
    })

    describe('header', () => {

        test('title and the two labelled actions, highlighting the Routes nav icon', () => {
            render(<RouteListScreen {...baseProps} />)

            expect(screen.getByText('Routes')).toBeInTheDocument()
            expect(screen.getByText('Free Ride')).toBeInTheDocument()
            expect(screen.getByText('Import Routes')).toBeInTheDocument()
            expect(screen.getByTestId('nav').dataset.selected).toBe('routes')
        })

        test('Free Ride carries its tooltip', () => {
            render(<RouteListScreen {...baseProps} />)
            expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent(
                'Pick any spot on the map and ride the real roads from there'
            )
        })

        test('header actions call their handlers', () => {
            const onFreeRide = vi.fn()
            const onImportRoutes = vi.fn()
            render(<RouteListScreen {...baseProps} onFreeRide={onFreeRide} onImportRoutes={onImportRoutes} />)

            fireEvent.click(screen.getByText('Free Ride'))
            fireEvent.click(screen.getByText('Import Routes'))
            expect(onFreeRide).toHaveBeenCalledTimes(1)
            expect(onImportRoutes).toHaveBeenCalledTimes(1)
        })

        test('renders as a single-row, three-slot header by default (actions/title both fit)', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)

            const header = container.querySelector('.route-list-header')
            expect(header.dataset.headerLayout).toBe('grid')
            // Free Ride (left), title (center) and Import Routes (right) are all part of the one row
            expect(header.querySelector('.route-list-free-ride #freeRide')).not.toBeNull()
            expect(header.querySelector('.route-list-title')).not.toBeNull()
            expect(header.querySelector('.route-list-import #importRoutes')).not.toBeNull()
        })

        test('the List/Tile toggle lives in the toolbar, not in the header actions', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)

            const actions = container.querySelector('.route-list-header')
            const toolbar = container.querySelector('.route-list-toolbar')
            expect(actions.querySelector('#list')).toBeNull()
            expect(actions.querySelector('#tiles')).toBeNull()
            expect(toolbar.querySelector('#list')).not.toBeNull()
            expect(toolbar.querySelector('#tiles')).not.toBeNull()
        })

        test('the List/Tile toggle in the toolbar reports selection back to the screen', () => {
            const onDisplayTypeSelected = vi.fn()
            const { container } = render(<RouteListScreen {...baseProps} onDisplayTypeSelected={onDisplayTypeSelected} />)

            fireEvent.click(container.querySelector('.route-list-toolbar #tiles'))
            expect(onDisplayTypeSelected).toHaveBeenCalledWith('tiles')
        })

        test.each([
            [1080+80, undefined],
            [1000+80, undefined],
            [999+80,  '3'],
            [700+80,  '3'],
            [699+80,  '1'],
        ])('content area %ipx wide, actions/title unmeasured: filter columns %s, header stays single-row', (width, columns) => {
            setContentWidth(width)
            const { container } = render(<RouteListScreen {...baseProps} filtersExpanded />)

            // stackHeader is driven by the actions/title's own measured widths, not content width
            // on its own - with both unmeasured (0) here, the header never stacks
            expect(container.querySelector('.route-list-header').dataset.headerLayout).toBe('grid')
            expect(screen.getByText('Routes')).toBeInTheDocument()
            expect(screen.getByText('Free Ride')).toBeInTheDocument()
            expect(screen.getByText('Import Routes')).toBeInTheDocument()
            if (columns)
                expect(container.querySelector('.route-filter-panel').dataset.columns).toBe(columns)
        })

        test('filter panel column count follows window resizes', () => {
            setContentWidth(1400)
            const { container } = render(<RouteListScreen {...baseProps} filtersExpanded />)
            expect(container.querySelector('.route-filter-panel').dataset.columns).toBe('3')

            setContentWidth(620)
            act(() => { window.dispatchEvent(new Event('resize')) })
            expect(container.querySelector('.route-filter-panel').dataset.columns).toBe('1')
        })

        test('actions and title fitting next to each other renders the single-row grid header', () => {
            setContentWidth(1000)
            setActionsWidth(300)
            setTitleWidth(200)
            const { container } = render(<RouteListScreen {...baseProps} />)

            expect(container.querySelector('.route-list-header').dataset.headerLayout).toBe('grid')
        })

        test('actions and title overflowing the content width falls back to the stacked header', () => {
            setContentWidth(800)
            setActionsWidth(500)
            setTitleWidth(400)
            const { container } = render(<RouteListScreen {...baseProps} />)

            const header = container.querySelector('.route-list-header')
            expect(header.dataset.headerLayout).toBe('stacked')
            // still the exact same title/actions, just stacked - nothing is dropped
            expect(screen.getByText('Routes')).toBeInTheDocument()
            expect(screen.getByText('Free Ride')).toBeInTheDocument()
            expect(screen.getByText('Import Routes')).toBeInTheDocument()
        })

        test('the header re-measures and can flip to stacked after a resize', () => {
            setContentWidth(1200)
            setActionsWidth(300)
            setTitleWidth(200)
            const { container } = render(<RouteListScreen {...baseProps} />)
            expect(container.querySelector('.route-list-header').dataset.headerLayout).toBe('grid')

            setContentWidth(400)
            act(() => { window.dispatchEvent(new Event('resize')) })
            expect(container.querySelector('.route-list-header').dataset.headerLayout).toBe('stacked')
        })
    })

    describe('filters', () => {

        test('filter panel is only rendered when expanded, chips always', () => {
            const filters = {contentType:'Video', country:'France'}
            const { container, rerender } = render(<RouteListScreen {...baseProps} filters={filters} />)

            expect(container.querySelector('.route-filter-panel')).toBeNull()
            expect(container.querySelectorAll('.filter-chip')).toHaveLength(2)
            expect(container.querySelector('.filters-count')).toHaveTextContent('2')

            rerender(<RouteListScreen {...baseProps} filters={filters} filtersExpanded />)
            expect(container.querySelector('.route-filter-panel')).not.toBeNull()
            expect(container.querySelectorAll('.filter-chip')).toHaveLength(2)
        })

        test('Route Content and Route Type are chip rows in the panel', () => {
            render(<RouteListScreen {...baseProps} filtersExpanded contentTypes={['Video','GPX']} routeTypes={['Loop','Point to Point']} />)

            expect(screen.getByRole('radiogroup', {name:'Route Content'})).toBeInTheDocument()
            expect(screen.getByRole('radiogroup', {name:'Route Type'})).toBeInTheDocument()
            expect(screen.getByRole('radio', {name:'Point to Point'})).toBeInTheDocument()
        })

        test('selecting a chip row option changes the filter', () => {
            const onChangeFilter = vi.fn()
            render(<RouteListScreen {...baseProps} filters={{title:'Alpe'}} filtersExpanded contentTypes={['Video','GPX']} onChangeFilter={onChangeFilter} />)

            fireEvent.click(screen.getByRole('radio', {name:'Video'}))
            expect(onChangeFilter).toHaveBeenCalledWith({title:'Alpe', contentType:'Video'})
        })

        test('the search box keeps the other filters', () => {
            vi.useFakeTimers()
            try {
                const onChangeFilter = vi.fn()
                render(<RouteListScreen {...baseProps} filters={{country:'France'}} onChangeFilter={onChangeFilter} />)

                fireEvent.change(screen.getByPlaceholderText('Search routes by name'), {target:{value:'Alpe'}})
                act(() => { vi.advanceTimersByTime(500) })
                expect(onChangeFilter).toHaveBeenCalledWith({country:'France', title:'Alpe'})
            }
            finally {
                vi.useRealTimers()
            }
        })

        test('shows the result count', () => {
            render(<RouteListScreen {...baseProps} countText='38 of 1 247 routes' />)
            expect(screen.getByText('38 of 1 247 routes')).toBeInTheDocument()
        })
    })

    describe('list area', () => {

        test('renders the table in list view', () => {
            render(<RouteListScreen {...baseProps} displayType='list' />)
            expect(screen.getByTestId('routes-table').dataset.count).toBe('2')
            expect(screen.queryByTestId('routes-grid')).toBeNull()
        })

        test('renders the grid in tile view', () => {
            render(<RouteListScreen {...baseProps} displayType='tiles' />)
            expect(screen.getByTestId('routes-grid').dataset.count).toBe('2')
            expect(screen.queryByTestId('routes-table')).toBeNull()
        })

        test('loading shows the loader only', () => {
            render(<RouteListScreen {...baseProps} loading />)
            expect(screen.queryByTestId('routes-table')).toBeNull()
            expect(screen.queryByText('No routes yet')).toBeNull()
        })

        test('an empty library explains what to do; the actions are the header buttons, not repeated in the empty state', () => {
            const onImportRoutes = vi.fn()
            const onFreeRide = vi.fn()
            const { container } = render(<RouteListScreen {...baseProps} routes={[]} cards={[]} totalCount={0}
                onImportRoutes={onImportRoutes} onFreeRide={onFreeRide} />)

            const empty = container.querySelector('.empty-library')
            expect(empty).toHaveTextContent('No routes yet')
            expect(empty).toHaveTextContent('Import your own GPX routes or a folder of video routes — or start a Free Ride and pick any road on the map.')
            expect(screen.queryByText('No Routes found')).toBeNull()
            expect(empty.querySelectorAll('button')).toHaveLength(0)

            // exactly one Import Routes and one Free Ride button on the page: the header's
            expect(container.querySelectorAll('#importRoutes')).toHaveLength(1)
            expect(container.querySelectorAll('#freeRide')).toHaveLength(1)
            fireEvent.click(container.querySelector('#importRoutes'))
            fireEvent.click(container.querySelector('#freeRide'))
            expect(onImportRoutes).toHaveBeenCalledTimes(1)
            expect(onFreeRide).toHaveBeenCalledTimes(1)
        })

        test('no match: names the cheapest relaxation and offers Clear all filters', () => {
            const onClearAllFilters = vi.fn()
            const hint = 'Try removing a filter — 3 routes match “Ventoux” on its own.'
            const { container } = render(<RouteListScreen {...baseProps} routes={[]} cards={[]} totalCount={1247}
                filters={{title:'Ventoux', country:'France'}} noMatchHint={hint} onClearAllFilters={onClearAllFilters} />)

            const noMatch = container.querySelector('.no-match')
            expect(noMatch).toHaveTextContent('No routes match')
            expect(noMatch).toHaveTextContent(hint)
            expect(screen.queryByText('No routes yet')).toBeNull()

            fireEvent.click(screen.getByText('Clear all filters'))
            expect(onClearAllFilters).toHaveBeenCalledTimes(1)
        })

        test('in-flight imports are pinned above the list', () => {
            const makeCard = (name) => ({
                getId: () => name,
                getDisplayProperties: () => ({name, error:null, observer:null}),
            })
            const { container } = render(<RouteListScreen {...baseProps} activeImports={[makeCard('a.gpx'), makeCard('b.gpx')]} />)

            const pinned = container.querySelectorAll('.pinned-imports .active-import')
            expect(pinned).toHaveLength(2)
            expect(pinned[0]).toHaveTextContent('a.gpx')

            // pinned area comes before the list area
            const pinnedArea = container.querySelector('.pinned-imports')
            const listArea = container.querySelector('.route-list-scroll')
            expect(pinnedArea.compareDocumentPosition(listArea) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        })
    })

    describe('keyboard', () => {

        const keyUp = (key, props={}) => act(() => {
            window.dispatchEvent(new KeyboardEvent('keyup', {key, ...props}))
        })

        test('Up/Down/PageUp/PageDown scroll the list', () => {
            render(<RouteListScreen {...baseProps} />)
            const table = screen.getByTestId('routes-table')
            table.scrollBy = vi.fn()

            keyUp('ArrowDown')
            keyUp('PageDown')
            keyUp('ArrowUp')
            keyUp('PageUp')

            const tops = table.scrollBy.mock.calls.map( c=>c[0].top)
            expect(tops).toHaveLength(4)
            expect(tops[0]).toBeGreaterThan(0)
            expect(tops[1]).toBeGreaterThan(0)
            expect(tops[2]).toBeLessThan(0)
            expect(tops[3]).toBeLessThan(0)
        })

        test('arrow keys do not scroll while typing in the search box', () => {
            render(<RouteListScreen {...baseProps} />)
            const table = screen.getByTestId('routes-table')
            table.scrollBy = vi.fn()

            screen.getByPlaceholderText('Search routes by name').focus()
            keyUp('ArrowDown')
            expect(table.scrollBy).not.toHaveBeenCalled()
        })

        test('Ctrl+F and / focus the search box', () => {
            render(<RouteListScreen {...baseProps} />)
            const input = screen.getByPlaceholderText('Search routes by name')

            keyUp('f', {ctrlKey:true})
            expect(document.activeElement).toBe(input)

            input.blur()
            keyUp('/')
            expect(document.activeElement).toBe(input)
        })

        test('navigation bar hotkeys are disabled while a field has focus', () => {
            render(<RouteListScreen {...baseProps} />)
            expect(screen.getByTestId('nav').dataset.hotkeysDisabled).toBe('false')

            const input = screen.getByPlaceholderText('Search routes by name')
            act(() => { input.focus() })
            expect(screen.getByTestId('nav').dataset.hotkeysDisabled).toBe('true')

            act(() => { input.blur() })
            expect(screen.getByTestId('nav').dataset.hotkeysDisabled).toBe('false')
        })
    })

    describe('page-level drop overlay', () => {

        test('appears on drag-enter over the content area, with its text', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)
            const contentArea = container.querySelector('.route-list-page')

            expect(container.querySelector('.route-drop-overlay')).toBeNull()

            fireEvent.dragEnter(contentArea, {dataTransfer:{items:{length:2}}})

            const overlay = container.querySelector('.route-drop-overlay')
            expect(overlay).not.toBeNull()
            expect(overlay).toHaveTextContent('Drop to import')
            expect(overlay).toHaveTextContent('2 files · .gpx, .epm and .xml are supported')
        })

        test('disappears on drag-leave', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)
            const contentArea = container.querySelector('.route-list-page')

            fireEvent.dragEnter(contentArea, {dataTransfer:{items:{length:1}}})
            expect(container.querySelector('.route-drop-overlay')).not.toBeNull()

            fireEvent.dragLeave(contentArea)
            expect(container.querySelector('.route-drop-overlay')).toBeNull()
        })

        test('disappears on drop', async () => {
            const { container } = render(<RouteListScreen {...baseProps} />)
            const contentArea = container.querySelector('.route-list-page')

            fireEvent.dragEnter(contentArea, {dataTransfer:{items:{length:1}}})
            expect(container.querySelector('.route-drop-overlay')).not.toBeNull()

            fireEvent.drop(contentArea)
            await waitFor(() => expect(container.querySelector('.route-drop-overlay')).toBeNull())
        })

        test('a file dropped on the overlay reaches onImportFiles - the overlay is still mounted when its own drop handler runs', async () => {
            const onImportFiles = vi.fn()
            const { container } = render(<RouteListScreen {...baseProps} onImportFiles={onImportFiles} />)

            fireEvent.dragEnter(container.querySelector('.route-list-page'), {dataTransfer:{items:{length:1}}})
            fireEvent.drop(container.querySelector('.route-drop-overlay'))

            expect(onImportFiles).toHaveBeenCalledWith([{type:'url', url:'file:///routes/ride.gpx'}])
            await waitFor(() => expect(container.querySelector('.route-drop-overlay')).toBeNull())
        })

        test('a drag crossing into and back out of a nested row does not flicker the overlay', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)
            const contentArea = container.querySelector('.route-list-page')
            const nestedRow = screen.getByTestId('routes-table')

            fireEvent.dragEnter(contentArea, {dataTransfer:{items:{length:1}}})
            expect(container.querySelector('.route-drop-overlay')).not.toBeNull()

            // pointer moves onto a child element inside the content area
            fireEvent.dragEnter(nestedRow, {dataTransfer:{items:{length:1}}})
            expect(container.querySelector('.route-drop-overlay')).not.toBeNull()

            // ... and back out of it, while still over the content area as a whole -
            // this is exactly the nested-target boundary crossing that must not hide the overlay
            fireEvent.dragLeave(nestedRow)
            expect(container.querySelector('.route-drop-overlay')).not.toBeNull()

            // only leaving the content area itself hides it
            fireEvent.dragLeave(contentArea)
            expect(container.querySelector('.route-drop-overlay')).toBeNull()
        })

        test('dragging over the navigation bar does not open the overlay', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)
            const nav = screen.getByTestId('nav')

            fireEvent.dragEnter(nav, {dataTransfer:{items:{length:1}}})
            expect(container.querySelector('.route-drop-overlay')).toBeNull()
        })

        test('reuses the exact combined route filters (no RLV) and allows multiple files', () => {
            const { container } = render(<RouteListScreen {...baseProps} />)
            const contentArea = container.querySelector('.route-list-page')

            fireEvent.dragEnter(contentArea, {dataTransfer:{items:{length:1}}})

            expect(rendered.dropzoneProps.multiple).toBe(true)
            expect(rendered.dropzoneProps.filters).toBe(DEFAULT_FILTERS)
        })

        test('a drop is always prevented at the capture phase, even without the overlay mounted', () => {
            // regression: an unprevented drop's default action is the browser navigating the
            // window to the dropped file instead of importing it - this must not depend on the
            // overlay Dropzone's own (bubble-phase, conditionally-mounted) preventDefault()
            const { container } = render(<RouteListScreen {...baseProps} />)
            const contentArea = container.querySelector('.route-list-page')

            const notCancelled = fireEvent.drop(contentArea, {dataTransfer:{items:{length:1}}})

            expect(notCancelled).toBe(false) // dispatchEvent() returns false once preventDefault() was called
        })

        test('dropping calls the existing import path and never opens the Import Routes dialog', () => {
            const onImportFiles = vi.fn()
            const onImportRoutes = vi.fn()
            const { container } = render(<RouteListScreen {...baseProps} onImportFiles={onImportFiles} onImportRoutes={onImportRoutes} />)
            const contentArea = container.querySelector('.route-list-page')

            fireEvent.dragEnter(contentArea, {dataTransfer:{items:{length:1}}})

            const dropInfo = [{type:'url', name:'route.gpx', dir:'/tmp', ext:'gpx'}]
            act(() => { rendered.dropzoneProps.onDrop(dropInfo) })

            expect(onImportFiles).toHaveBeenCalledWith(dropInfo)
            expect(onImportRoutes).not.toHaveBeenCalled()
        })
    })
})
