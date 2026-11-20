import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { EventEmitter } from 'node:events'

const { mockService } = vi.hoisted(() => ({ mockService: {} }))

vi.mock('incyclist-services', () => ({
    useRouteServersSettingsDisplay: () => mockService,
}))

import { useRouteServersSettings } from './useRouteServersSettings'

describe('useRouteServersSettings', () => {
    let observer

    beforeEach(() => {
        observer = new EventEmitter()
        mockService.open = vi.fn().mockReturnValue(observer)
        mockService.close = vi.fn()
        mockService.showAdd = vi.fn()
        mockService.getDisplayProps = vi.fn().mockReturnValue({ view: 'list' })
    })

    test('opens the dialog with the origin and returns the display props', () => {
        const { result } = renderHook(() => useRouteServersSettings('import'))

        expect(mockService.open).toHaveBeenCalledWith('import')
        expect(result.current.props).toEqual({ view: 'list' })
    })

    test('follows changed events', () => {
        const { result } = renderHook(() => useRouteServersSettings())

        mockService.getDisplayProps.mockReturnValue({ view: 'add' })
        act(() => { observer.emit('changed') })

        expect(result.current.props).toEqual({ view: 'add' })
    })

    test('forwards actions to the service', () => {
        const { result } = renderHook(() => useRouteServersSettings())

        result.current.actions.showAdd()
        expect(mockService.showAdd).toHaveBeenCalledTimes(1)
    })

    test.each(['done', 'back', 'cancel'])('reports the reason %s when the dialog service closes itself', (reason) => {
        const onClosed = vi.fn()
        renderHook(() => useRouteServersSettings('import', onClosed))

        mockService.getDisplayProps.mockReturnValue({ view: 'add' })
        act(() => { observer.emit('changed') })
        act(() => { observer.emit('closed', { reason }) })

        expect(onClosed).toHaveBeenCalledWith(reason, { view: 'add' })
    })

    test('treats a closed event without reason as cancel', () => {
        const onClosed = vi.fn()
        renderHook(() => useRouteServersSettings('import', onClosed))

        act(() => { observer.emit('closed') })

        expect(onClosed).toHaveBeenCalledWith('cancel', { view: 'list' })
    })

    test('forwards cancelAddEmpty to the service', () => {
        mockService.cancelAddEmpty = vi.fn()
        const { result } = renderHook(() => useRouteServersSettings())

        result.current.actions.cancelAddEmpty()
        expect(mockService.cancelAddEmpty).toHaveBeenCalledTimes(1)
    })

    test('closes the dialog on unmount', () => {
        const { unmount } = renderHook(() => useRouteServersSettings())
        unmount()

        expect(mockService.close).toHaveBeenCalledTimes(1)
    })
})
