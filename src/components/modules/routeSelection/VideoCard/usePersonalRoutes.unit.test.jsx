import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    values: [], listeners: new Map(), activities: [],
    isStillLoading: vi.fn(), preload: vi.fn(), getAll: vi.fn(), set: vi.fn()
}))
vi.mock('incyclist-services', () => {
    const settings = {
        getValue: () => mocks.values,
        set: (...args) => mocks.set(...args),
        requestNotifyOnChange: id => ({
            on: (event, listener) => mocks.listeners.set(id, listener),
            off: () => mocks.listeners.delete(id)
        }),
        stopNotifyOnChange: id => mocks.listeners.delete(id)
    }
    const service = { isStillLoading: mocks.isStillLoading, preload: mocks.preload }
    return {
        useUserSettings: () => settings,
        useActivityList: () => service,
        ActivitiesRepository: class { getAll() { return mocks.getAll() } }
    }
})
import { usePersonalRoutes } from './usePersonalRoutes'
const props = { id: 'r1', distance: 20000, visible: true }

beforeEach(() => {
    vi.clearAllMocks()
    mocks.values = []
    mocks.listeners.clear()
    mocks.activities = []
    mocks.getAll.mockImplementation(() => mocks.activities)
    mocks.isStillLoading.mockReturnValue(false)
    mocks.preload.mockReturnValue({ wait: () => Promise.resolve() })
    mocks.set.mockImplementation((key, value) => {
        // The real settings service notifies before writing the new value.
        mocks.listeners.forEach(listener => listener(value))
        mocks.values = value
    })
})

describe('personal route data', () => {
    test('favorites persist on remount and synchronize duplicate cards', async () => {
        const a = renderHook(() => usePersonalRoutes(props))
        const b = renderHook(() => usePersonalRoutes(props))
        await waitFor(() => expect(a.result.current.history?.count).toBe(0))
        act(() => a.result.current.toggleFavorite())
        expect(mocks.set).toHaveBeenCalledWith('routes.favorites', ['r1'])
        expect(b.result.current.isFavorite).toBe(true)
        a.unmount()
        const c = renderHook(() => usePersonalRoutes(props))
        expect(c.result.current.isFavorite).toBe(true)
        await waitFor(() => expect(c.result.current.history?.count).toBe(0))
        act(() => c.result.current.toggleFavorite())
        expect(b.result.current.isFavorite).toBe(false)
        b.unmount(); c.unmount()
        expect(mocks.listeners.size).toBe(0)
    })
    test('shares a pending summary load between visible cards without fetching ride logs', async () => {
        let resolve
        mocks.isStillLoading.mockReturnValue(true)
        mocks.preload.mockReturnValue({ wait: () => new Promise(done => { resolve = done }) })
        const a = renderHook(() => usePersonalRoutes(props))
        const b = renderHook(() => usePersonalRoutes({ ...props, id: 'r2' }))
        expect(mocks.preload).toHaveBeenCalledTimes(1)
        await act(async () => resolve())
        expect(a.result.current.history.count).toBe(0)
        expect(b.result.current.history.count).toBe(0)
    })
    test('does not read history for invisible cards, and does not show zero on failure', async () => {
        const { result, rerender } = renderHook(({ visible }) => usePersonalRoutes({ ...props, visible }), { initialProps: { visible: false } })
        expect(mocks.getAll).not.toHaveBeenCalled()
        mocks.getAll.mockImplementation(() => { throw new Error('Unavailable') })
        await act(async () => rerender({ visible: true }))
        expect(result.current.history).toBeUndefined()
    })
    test('reports a favorite save error without pretending that the star was saved', () => {
        mocks.set.mockImplementation(() => { throw new Error('Not initialized') })
        const { result } = renderHook(() => usePersonalRoutes({ ...props, visible: false }))
        act(() => result.current.toggleFavorite())
        expect(result.current.isFavorite).toBe(false)
        expect(result.current.error).toMatch(/Could not save/)
    })
})
