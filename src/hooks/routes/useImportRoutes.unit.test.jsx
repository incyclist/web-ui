import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useImportRoutes } from './useImportRoutes'

// Minimal stand-in for incyclist-services' Observer (on/off/emit, chainable .on()) - same
// shape as the one used in pages/routes/page.unit.test.jsx.
const { FakeObserver, mockScanner, mockRouteList, setDisplayProps } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
        listenerCount(event) { return (this.listeners[event] ?? []).length }
    }

    let displayProps = { phase: 'landing', routes: [], hasICloudDownloadFailures: false }

    const mockScanner = {
        getDisplayProps: vi.fn(() => displayProps),
        scan: vi.fn(),
        parse: vi.fn(),
        ingest: vi.fn(),
        importSingle: vi.fn(),
        importFiles: vi.fn(),
        cancel: vi.fn(),
        done: vi.fn(),
    }

    // the drop path's entry point - the one that pins ActiveImport rows above the list
    const mockRouteList = { import: vi.fn() }

    return { FakeObserver, mockScanner, mockRouteList, setDisplayProps: (next) => { displayProps = next } }
})

vi.mock('incyclist-services', () => ({
    useRouteLibraryScanner: () => mockScanner,
    useRouteList: () => mockRouteList,
}))

describe('useImportRoutes', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        setDisplayProps({ phase: 'landing', routes: [], hasICloudDownloadFailures: false })
    })

    test('initial displayProps reflect the scanner state at mount', () => {
        const { result } = renderHook(() => useImportRoutes())
        expect(result.current.displayProps.phase).toBe('landing')
    })

    test('scan() subscribes to the scan observer and refreshes displayProps on progress', () => {
        const scanObserver = new FakeObserver()
        mockScanner.scan.mockReturnValue(scanObserver)

        const { result } = renderHook(() => useImportRoutes())

        act(() => { result.current.scan({ uri: '/videos', displayName: '/videos' }) })
        expect(mockScanner.scan).toHaveBeenCalledWith({ uri: '/videos', displayName: '/videos' })

        setDisplayProps({ phase: 'scanning', routes: [], scanProgress: { scannedFolders: 3 } })
        act(() => { scanObserver.emit('scan-progress', { scannedFolders: 3 }) })

        expect(result.current.displayProps.scanProgress).toEqual({ scannedFolders: 3 })
    })

    test('scan-complete automatically chains into parse() with the scanned routes', () => {
        const scanObserver = new FakeObserver()
        const parseObserver = new FakeObserver()
        mockScanner.scan.mockReturnValue(scanObserver)
        mockScanner.parse.mockReturnValue(parseObserver)

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.scan({ uri: '/videos', displayName: '/videos' }) })

        const scannedRoutes = [{ controlFileUri: '/videos/a.rlv' }]
        setDisplayProps({ phase: 'parsing', routes: [], parseProgress: { parsed: 0, total: 1 } })
        act(() => { scanObserver.emit('scan-complete', scannedRoutes) })

        expect(mockScanner.parse).toHaveBeenCalledWith(scannedRoutes)
        expect(result.current.displayProps.phase).toBe('parsing')
        // the scan observer is detached once parse() takes over
        expect(scanObserver.listenerCount('scan-complete')).toBe(0)
    })

    test('importSelected() ingests only the selected, importable parsed routes', () => {
        const scanObserver = new FakeObserver()
        const parseObserver = new FakeObserver()
        const ingestObserver = new FakeObserver()
        mockScanner.scan.mockReturnValue(scanObserver)
        mockScanner.parse.mockReturnValue(parseObserver)
        mockScanner.ingest.mockReturnValue(ingestObserver)

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.scan({ uri: '/videos', displayName: '/videos' }) })
        act(() => { scanObserver.emit('scan-complete', []) })

        const routeA = { route: { description: { id: 'a' } }, controlFileUri: '/a.rlv' }
        const routeB = { route: { description: { id: 'b' } }, controlFileUri: '/b.rlv', parseError: 'bad' }
        act(() => {
            parseObserver.emit('parse-result', routeA)
            parseObserver.emit('parse-result', routeB)
        })

        setDisplayProps({
            phase: 'selecting',
            routes: [
                { id: 'a', importable: true },
                { id: 'b', importable: false },
            ],
        })
        act(() => { parseObserver.emit('parse-complete') })

        act(() => { result.current.toggleSelected('a') })
        act(() => { result.current.toggleSelected('b') })

        act(() => { result.current.importSelected() })

        expect(mockScanner.ingest).toHaveBeenCalledWith([routeA])
    })

    test('selectAll() / deselectAll() operate on the importable rows currently in displayProps', () => {
        setDisplayProps({
            phase: 'selecting',
            routes: [
                { id: 'a', importable: true },
                { id: 'b', importable: false },
                { id: 'c', importable: true },
            ],
        })
        const { result } = renderHook(() => useImportRoutes())

        act(() => { result.current.selectAll() })

        expect(result.current.isSelected('a')).toBe(true)
        expect(result.current.isSelected('b')).toBe(false)
        expect(result.current.isSelected('c')).toBe(true)

        act(() => { result.current.deselectAll() })
        expect(result.current.isSelected('a')).toBe(false)
    })

    test('importSingle() subscribes to success/error and refreshes displayProps', () => {
        const singleObserver = new FakeObserver()
        mockScanner.importSingle.mockReturnValue(singleObserver)

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.importSingle({ filename: 'route.gpx', ext: 'gpx' }) })

        expect(mockScanner.importSingle).toHaveBeenCalledWith({ filename: 'route.gpx', ext: 'gpx' })

        setDisplayProps({ phase: 'result', routes: [], resultSuccess: { routeName: 'Alpe' } })
        act(() => { singleObserver.emit('success', { title: 'Alpe' }) })

        expect(result.current.displayProps.resultSuccess).toEqual({ routeName: 'Alpe' })
        expect(singleObserver.listenerCount('success')).toBe(0)
    })

    test('importSingle() with the one-element array the "Add a route" picker hands over imports that file on its own', () => {
        const singleObserver = new FakeObserver()
        mockScanner.importSingle.mockReturnValue(singleObserver)
        const file = { type: 'url', name: 'route.gpx', dir: '/tmp', ext: 'gpx' }

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.importSingle([file]) })

        expect(mockScanner.importSingle).toHaveBeenCalledWith(file)
        expect(mockScanner.importFiles).not.toHaveBeenCalled()
    })

    test('importSingle() with several files fans them out through the scanner in one call, reporting as ingest -> complete', () => {
        const filesObserver = new FakeObserver()
        mockScanner.importFiles.mockReturnValue(filesObserver)
        const files = ['a.gpx', 'b.gpx', 'c.gpx'].map(name => ({ type: 'url', name, dir: '/tmp', ext: 'gpx' }))

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.importSingle(files) })

        expect(mockScanner.importFiles).toHaveBeenCalledTimes(1)
        expect(mockScanner.importFiles).toHaveBeenCalledWith(files)
        expect(mockScanner.importSingle).not.toHaveBeenCalled()

        setDisplayProps({ phase: 'ingesting', routes: [], ingestProgress: { current: 2, total: 3, currentName: 'b.gpx' } })
        act(() => { filesObserver.emit('ingest-progress', { current: 2, total: 3, currentName: 'b.gpx' }) })
        expect(result.current.displayProps.ingestProgress).toEqual({ current: 2, total: 3, currentName: 'b.gpx' })

        const completionSummary = { imported: 3, skipped: 0, errors: 0, failedRoutes: [] }
        setDisplayProps({ phase: 'complete', routes: [], completionSummary })
        act(() => { filesObserver.emit('ingest-complete', completionSummary) })
        expect(result.current.displayProps.phase).toBe('complete')
        expect(filesObserver.listenerCount('ingest-complete')).toBe(0)
    })

    test('a file picked on the tile never goes through the drop path - no pinned ActiveImport row', () => {
        mockScanner.importSingle.mockReturnValue(new FakeObserver())
        mockScanner.importFiles.mockReturnValue(new FakeObserver())

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.importSingle([{ name: 'a.gpx', ext: 'gpx' }]) })
        act(() => { result.current.importSingle([{ name: 'a.gpx', ext: 'gpx' }, { name: 'b.gpx', ext: 'gpx' }]) })

        expect(mockRouteList.import).not.toHaveBeenCalled()
    })

    test('importSingle() with nothing picked does nothing', () => {
        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.importSingle([]) })

        expect(mockScanner.importSingle).not.toHaveBeenCalled()
        expect(mockScanner.importFiles).not.toHaveBeenCalled()
    })

    test('cancel() tells the scanner to cancel and refreshes displayProps', () => {
        const scanObserver = new FakeObserver()
        mockScanner.scan.mockReturnValue(scanObserver)

        const { result } = renderHook(() => useImportRoutes())
        act(() => { result.current.scan({ uri: '/videos', displayName: '/videos' }) })

        setDisplayProps({ phase: 'landing', routes: [] })
        act(() => { result.current.cancel() })

        expect(mockScanner.cancel).toHaveBeenCalled()
        expect(result.current.displayProps.phase).toBe('landing')
        expect(scanObserver.listenerCount('scan-progress')).toBe(0)
    })

    test('unmount detaches active observers and resets the scanner', () => {
        const scanObserver = new FakeObserver()
        mockScanner.scan.mockReturnValue(scanObserver)

        const { result, unmount } = renderHook(() => useImportRoutes())
        act(() => { result.current.scan({ uri: '/videos', displayName: '/videos' }) })

        unmount()

        expect(mockScanner.done).toHaveBeenCalled()
        expect(scanObserver.listenerCount('scan-progress')).toBe(0)
    })
})
