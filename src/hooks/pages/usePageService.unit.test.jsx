import { describe, test, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePageService } from './usePageService'

// Same minimal stand-in for incyclist-services' Observer as useImportRoutes.unit.test.jsx.
const { FakeObserver } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
        listenerCount(event) { return (this.listeners[event] ?? []).length }
    }
    return { FakeObserver }
})

describe('usePageService', () => {

    let service, observer, displayProps

    beforeEach(() => {
        observer = new FakeObserver()
        displayProps = { title: 'initial' }
        service = {
            openPage: vi.fn(() => observer),
            closePage: vi.fn(),
            getPageDisplayProperties: vi.fn(() => displayProps),
        }
    })

    test('opens the service on mount with the given args and returns its display props', () => {
        const { result } = renderHook(() => usePageService(service, [true, 'routes']))

        expect(service.openPage).toHaveBeenCalledWith(true, 'routes')
        expect(result.current).toEqual({ title: 'initial' })
    })

    test('re-reads display props on every page-update', () => {
        const { result } = renderHook(() => usePageService(service, []))

        displayProps = { title: 'updated' }
        act(() => { observer.emit('page-update') })

        expect(result.current).toEqual({ title: 'updated' })
    })

    test('opens the service only once, even if it rerenders', () => {
        const { rerender } = renderHook(() => usePageService(service, [true]))
        rerender()
        rerender()

        expect(service.openPage).toHaveBeenCalledTimes(1)
    })

    test('closes the page and detaches the observer on unmount', () => {
        const { unmount } = renderHook(() => usePageService(service, []))
        unmount()

        expect(service.closePage).toHaveBeenCalled()
    })

    test('no service yet: returns undefined and never opens', () => {
        const { result } = renderHook(() => usePageService(undefined, []))

        expect(result.current).toBeUndefined()
        expect(service.openPage).not.toHaveBeenCalled()
    })
})
