import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { EventEmitter } from 'node:events'

const { mockService } = vi.hoisted(() => ({ mockService: {} }))

vi.mock('incyclist-services', () => ({
    getRouteServersSettingsPageService: () => mockService,
}))

import { useRouteServersSettings } from './useRouteServersSettings'

describe('useRouteServersSettings', () => {
    let observer

    beforeEach(() => {
        observer = new EventEmitter()
        mockService.open = vi.fn().mockReturnValue(observer)
        mockService.close = vi.fn()
        mockService.showAdd = vi.fn()
        mockService.getPageDisplayProps = vi.fn().mockReturnValue({ view: 'list' })
    })

    test('opens the page with the origin and returns the display props', () => {
        const { result } = renderHook(() => useRouteServersSettings('import'))

        expect(mockService.open).toHaveBeenCalledWith('import')
        expect(result.current.props).toEqual({ view: 'list' })
    })

    test('follows page updates', () => {
        const { result } = renderHook(() => useRouteServersSettings())

        mockService.getPageDisplayProps.mockReturnValue({ view: 'add' })
        act(() => { observer.emit('page-update') })

        expect(result.current.props).toEqual({ view: 'add' })
    })

    test('forwards actions to the service', () => {
        const { result } = renderHook(() => useRouteServersSettings())

        result.current.actions.showAdd()
        expect(mockService.showAdd).toHaveBeenCalledTimes(1)
    })

    test('reports the last props when the service closes itself', () => {
        const onClosed = vi.fn()
        renderHook(() => useRouteServersSettings('import', onClosed))

        mockService.getPageDisplayProps.mockReturnValue({ view: 'add', manual: { state: 'success' } })
        act(() => { observer.emit('page-update') })
        act(() => { observer.emit('closed') })

        expect(onClosed).toHaveBeenCalledWith({ view: 'add', manual: { state: 'success' } })
    })

    test('closes the page on unmount', () => {
        const { unmount } = renderHook(() => useRouteServersSettings())
        unmount()

        expect(mockService.close).toHaveBeenCalledTimes(1)
    })
})
