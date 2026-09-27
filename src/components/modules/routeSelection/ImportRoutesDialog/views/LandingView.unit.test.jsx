import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { mockSelectDirectory, rendered } = vi.hoisted(() => ({
    mockSelectDirectory: vi.fn(),
    rendered: { dropzoneProps: null },
}))

// Dropzone talks to the native file dialog and drag/drop events - neither works under
// jsdom. Stubbed to a simple button that captures the props LandingView passed it (so the
// filters/multi-select contract can be asserted) and lets a test fire onDrop directly,
// per this repo's convention for heavy/native molecules (see RouteDetails' component test).
vi.mock('../../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dropzone: (props) => {
            rendered.dropzoneProps = props
            return <button data-testid="add-route-tile">{props.text}</button>
        },
    }
})

vi.mock('../../../../../bindings/native-ui', () => ({
    useAppUI: () => ({ selectDirectory: mockSelectDirectory }),
}))

import { LandingView, ADD_ROUTE_FILTERS } from './LandingView'

describe('LandingView', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        rendered.dropzoneProps = null
    })

    test('renders both tiles with the exact copy-deck labels', () => {
        render(<LandingView onAddRoute={vi.fn()} onSelectFolder={vi.fn()} />)

        expect(screen.getByText('Add a route')).toBeTruthy()
        expect(screen.getByText('One route from a file on your computer — GPX, EPM, RLV or XML')).toBeTruthy()
        expect(screen.getByText('Import a whole folder')).toBeTruthy()
        expect(screen.getByText('Find every video route in a folder and its sub-folders — a library on a disk or NAS')).toBeTruthy()
        expect(screen.getByText('…or drop route files anywhere on the Routes page')).toBeTruthy()
    })

    test('the file tile keeps the combined "Routes" filter with .rlv added, multi-select', () => {
        render(<LandingView onAddRoute={vi.fn()} onSelectFolder={vi.fn()} />)

        expect(rendered.dropzoneProps.multiple).toBe(true)
        expect(rendered.dropzoneProps.filters).toEqual(ADD_ROUTE_FILTERS)
        expect(ADD_ROUTE_FILTERS[0]).toEqual({ name: 'Routes', extensions: ['gpx', 'epm', 'xml', 'rlv'] })
        // per-format entries underneath are reused unchanged
        expect(ADD_ROUTE_FILTERS.slice(1)).toEqual([
            { name: 'Tracks', extensions: ['gpx'] },
            { name: 'RLV: ErgoPlanet', extensions: ['epm'] },
            { name: 'RLV: Incyclist, KWT, Rouvy,Virtualtrainer ', extensions: ['xml'] },
        ])
    })

    test('picking a file calls onAddRoute with the chosen file', () => {
        const onAddRoute = vi.fn()
        render(<LandingView onAddRoute={onAddRoute} onSelectFolder={vi.fn()} />)

        // simulate Dropzone resolving the native picker with one file
        act(() => {
            rendered.dropzoneProps.onDrop([{ type: 'url', name: 'route.gpx', dir: '/tmp', ext: 'gpx', delimiter: '/' }])
        })

        expect(onAddRoute).toHaveBeenCalledTimes(1)
        expect(onAddRoute).toHaveBeenCalledWith([{ type: 'url', name: 'route.gpx', dir: '/tmp', ext: 'gpx', delimiter: '/' }])
    })

    test('picking several files (e.g. a batch of GPX routes) hands every one of them on, in one call', () => {
        const onAddRoute = vi.fn()
        render(<LandingView onAddRoute={onAddRoute} onSelectFolder={vi.fn()} />)

        const picked = ['a.gpx', 'b.gpx', 'c.gpx'].map(name => ({ type: 'url', name, dir: '/tmp', ext: 'gpx', delimiter: '/' }))
        act(() => { rendered.dropzoneProps.onDrop(picked) })

        expect(onAddRoute).toHaveBeenCalledTimes(1)
        expect(onAddRoute).toHaveBeenCalledWith(picked)
    })

    test('a cancelled picker (no files) does not call onAddRoute', () => {
        const onAddRoute = vi.fn()
        render(<LandingView onAddRoute={onAddRoute} onSelectFolder={vi.fn()} />)

        act(() => { rendered.dropzoneProps.onDrop([]) })

        expect(onAddRoute).not.toHaveBeenCalled()
    })

    test('choosing a folder calls onSelectFolder with the scanner-shaped folder info', async () => {
        mockSelectDirectory.mockResolvedValue({ selected: '/videos/NAS', displayName: 'NAS' })
        const onSelectFolder = vi.fn()
        render(<LandingView onAddRoute={vi.fn()} onSelectFolder={onSelectFolder} />)

        await act(async () => {
            fireEvent.click(screen.getByText('Import a whole folder'))
        })

        expect(mockSelectDirectory).toHaveBeenCalled()
        expect(onSelectFolder).toHaveBeenCalledWith({ uri: '/videos/NAS', displayName: 'NAS' })
    })

    test('cancelling the folder picker does not call onSelectFolder', async () => {
        mockSelectDirectory.mockResolvedValue({ canceled: true })
        const onSelectFolder = vi.fn()
        render(<LandingView onAddRoute={vi.fn()} onSelectFolder={onSelectFolder} />)

        await act(async () => {
            fireEvent.click(screen.getByText('Import a whole folder'))
        })

        expect(onSelectFolder).not.toHaveBeenCalled()
    })
})
