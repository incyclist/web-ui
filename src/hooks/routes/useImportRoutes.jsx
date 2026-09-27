import { useCallback, useRef, useState } from 'react'
import { useRouteLibraryScanner } from 'incyclist-services'
import { useUnmountEffect } from '../flow/useUnmountEffect'

/**
 * Wiring hook for the desktop Import Routes dialog, built directly over
 * `RouteLibraryScannerService` (not a page service - web-ui calls domain services directly).
 *
 * It owns:
 * - the observer subscriptions for the scan / parse / ingest phases and for a single-route
 *   import, refreshing `displayProps` from `getDisplayProps()` on every event
 * - `selectedIds`, local UI state tracking which `RouteDisplayItem.id` the user has checked
 *   in the selection table, plus the toggle functions to change it
 *
 * It owns no business logic beyond bridging the scanner's observer events to React state -
 * every phase transition, validation and error classification happens in the service.
 */
export const useImportRoutes = () => {
    const scanner = useRouteLibraryScanner()

    const [displayProps, setDisplayProps] = useState(() => scanner.getDisplayProps())
    const [selectedIds, setSelectedIds] = useState(() => new Set())

    // Raw parsed routes, accumulated as 'parse-result' events stream in. getDisplayProps()
    // only carries the display-ready RouteDisplayItem rows - ingest() needs the actual
    // parsed Route data, which isn't part of the display props.
    const refParsedRoutes = useRef([])

    const refScanObserver = useRef(null)
    const refParseObserver = useRef(null)
    const refIngestObserver = useRef(null)
    const refSingleObserver = useRef(null)

    const onUpdate = useCallback(() => {
        setDisplayProps(scanner.getDisplayProps())
    }, [scanner])

    const onParseResult = useCallback((parsed) => {
        refParsedRoutes.current = [...refParsedRoutes.current, parsed]
        onUpdate()
    }, [onUpdate])

    const onParseComplete = useCallback(() => {
        const observer = refParseObserver.current
        if (observer) {
            observer.off('parse-progress', onUpdate)
            observer.off('parse-result', onParseResult)
            observer.off('parse-complete', onParseComplete)
            observer.off('error', onUpdate)
            refParseObserver.current = null
        }
        onUpdate()
    }, [onUpdate, onParseResult])

    // Phase 2 - not exposed on its own: the current phase machine has scan flip the display
    // phase to 'parsing' as soon as scanning completes (RouteLibraryScannerService.scan()),
    // so parse() is chained on 'scan-complete' rather than left to a caller-driven step.
    const parse = useCallback((scannedRoutes) => {
        refParsedRoutes.current = []
        const observer = scanner.parse(scannedRoutes)
        refParseObserver.current = observer
        observer.on('parse-progress', onUpdate)
        observer.on('parse-result', onParseResult)
        observer.on('parse-complete', onParseComplete)
        observer.on('error', onUpdate)
        onUpdate()
    }, [scanner, onUpdate, onParseResult, onParseComplete])

    const onScanComplete = useCallback((scannedRoutes) => {
        const observer = refScanObserver.current
        if (observer) {
            observer.off('scan-progress', onUpdate)
            observer.off('scan-complete', onScanComplete)
            observer.off('error', onUpdate)
            refScanObserver.current = null
        }
        parse(scannedRoutes)
    }, [onUpdate, parse])

    const scan = useCallback((folderInfo) => {
        const observer = scanner.scan(folderInfo)
        refScanObserver.current = observer
        observer.on('scan-progress', onUpdate)
        observer.on('scan-complete', onScanComplete)
        observer.on('error', onUpdate)
        onUpdate()
    }, [scanner, onUpdate, onScanComplete])

    const onIngestComplete = useCallback(() => {
        const observer = refIngestObserver.current
        if (observer) {
            observer.off('ingest-progress', onUpdate)
            observer.off('ingest-error', onUpdate)
            observer.off('ingest-complete', onIngestComplete)
            observer.off('error', onUpdate)
            refIngestObserver.current = null
        }
        onUpdate()
    }, [onUpdate])

    const importSelected = useCallback(() => {
        const routes = refParsedRoutes.current.filter(parsed =>
            !parsed.parseError && parsed.route?.description?.id != null && selectedIds.has(parsed.route.description.id)
        )
        const observer = scanner.ingest(routes)
        refIngestObserver.current = observer
        observer.on('ingest-progress', onUpdate)
        observer.on('ingest-error', onUpdate)
        observer.on('ingest-complete', onIngestComplete)
        observer.on('error', onUpdate)
        onUpdate()
    }, [scanner, selectedIds, onUpdate, onIngestComplete])

    const onSingleResult = useCallback(() => {
        const observer = refSingleObserver.current
        if (observer) {
            observer.off('parsing', onUpdate)
            observer.off('success', onSingleResult)
            observer.off('error', onSingleResult)
            refSingleObserver.current = null
        }
        onUpdate()
    }, [onUpdate])

    const importSingle = useCallback((fileInfo) => {
        const observer = scanner.importSingle(fileInfo)
        refSingleObserver.current = observer
        observer.on('parsing', onUpdate)
        observer.on('success', onSingleResult)
        observer.on('error', onSingleResult)
        onUpdate()
    }, [scanner, onUpdate, onSingleResult])

    const cleanUpObservers = useCallback(() => {
        const scanObserver = refScanObserver.current
        if (scanObserver) {
            scanObserver.off('scan-progress', onUpdate)
            scanObserver.off('scan-complete', onScanComplete)
            scanObserver.off('error', onUpdate)
            refScanObserver.current = null
        }
        const parseObserver = refParseObserver.current
        if (parseObserver) {
            parseObserver.off('parse-progress', onUpdate)
            parseObserver.off('parse-result', onParseResult)
            parseObserver.off('parse-complete', onParseComplete)
            parseObserver.off('error', onUpdate)
            refParseObserver.current = null
        }
        const ingestObserver = refIngestObserver.current
        if (ingestObserver) {
            ingestObserver.off('ingest-progress', onUpdate)
            ingestObserver.off('ingest-error', onUpdate)
            ingestObserver.off('ingest-complete', onIngestComplete)
            ingestObserver.off('error', onUpdate)
            refIngestObserver.current = null
        }
        const singleObserver = refSingleObserver.current
        if (singleObserver) {
            singleObserver.off('parsing', onUpdate)
            singleObserver.off('success', onSingleResult)
            singleObserver.off('error', onSingleResult)
            refSingleObserver.current = null
        }
    }, [onUpdate, onScanComplete, onParseResult, onParseComplete, onIngestComplete, onSingleResult])

    const cancel = useCallback(() => {
        cleanUpObservers()
        refParsedRoutes.current = []
        scanner.cancel()
        onUpdate()
    }, [cleanUpObservers, scanner, onUpdate])

    const toggleSelected = useCallback((id) => {
        setSelectedIds(prev => {
            const next = new Set(prev)
            if (next.has(id))
                next.delete(id)
            else
                next.add(id)
            return next
        })
    }, [])

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(displayProps.routes.filter(route => route.importable).map(route => route.id)))
    }, [displayProps.routes])

    const deselectAll = useCallback(() => {
        setSelectedIds(new Set())
    }, [])

    const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds])

    useUnmountEffect(() => {
        cleanUpObservers()
        refParsedRoutes.current = []
        scanner.done()
    })

    return {
        displayProps,
        selectedIds,
        isSelected,
        toggleSelected,
        selectAll,
        deselectAll,
        scan,
        importSingle,
        importSelected,
        cancel,
    }
}
