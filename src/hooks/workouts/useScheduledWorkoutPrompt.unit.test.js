import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { EventEmitter } from 'node:events'

const navigate = vi.fn()
vi.mock('react-router', () => ({ useNavigate: () => navigate }))

const logEvent = vi.fn()
vi.mock('gd-eventlog', () => ({ EventLogger: class { logEvent(...args) { logEvent(...args) } } }))

let service
vi.mock('incyclist-services', () => ({ getScheduledWorkoutPromptPageService: () => service }))

import { useScheduledWorkoutPrompt } from './useScheduledWorkoutPrompt'

const createService = () => {
    const s = new EventEmitter()
    s.show = vi.fn().mockReturnValue(null)
    s.onYes = vi.fn().mockReturnValue({ page: 'workouts', autoOpenDetailsId: 'w1' })
    s.onNo = vi.fn()
    s.onCheckWorkouts = vi.fn().mockReturnValue({ page: 'workouts' })
    return s
}

const PROPS = { title: 'Sweet Spot', workoutId: 'w1' }

describe('useScheduledWorkoutPrompt', () => {

    beforeEach(() => {
        service = createService()
        delete window.activeDialog
    })
    afterEach(() => { vi.clearAllMocks() })

    test('shows the prompt when the service returns props', () => {
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt())
        expect(result.current.prompt).toEqual({ title: 'Sweet Spot' })
    })

    test('no prompt when the service returns null', () => {
        const { result } = renderHook(() => useScheduledWorkoutPrompt())
        expect(result.current.prompt).toBeNull()
    })

    test('does nothing when disabled', () => {
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt(false))
        expect(service.show).not.toHaveBeenCalled()
        expect(result.current.prompt).toBeNull()
    })

    test('re-checks on scheduled event and unsubscribes on unmount', () => {
        const { result, unmount } = renderHook(() => useScheduledWorkoutPrompt())
        expect(result.current.prompt).toBeNull()

        service.show.mockReturnValue(PROPS)
        act(() => { service.emit('scheduled') })
        expect(result.current.prompt).toEqual({ title: 'Sweet Spot' })

        unmount()
        expect(service.listenerCount('scheduled')).toBe(0)
    })

    test('first show wins: a later null does not remove a shown prompt', () => {
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt())
        service.show.mockReturnValue(null)
        act(() => { service.emit('scheduled') })
        expect(result.current.prompt).toEqual({ title: 'Sweet Spot' })
    })

    test('defers while a dialog is open, without calling show(), and shows after the dialog closed', () => {
        window.activeDialog = 'RouteDetails123'
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt())

        expect(service.show).not.toHaveBeenCalled()
        expect(result.current.prompt).toBeNull()
        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'scheduled workout prompt deferred' }))

        // a late calendar event while still deferred: still no show(), logged once
        act(() => { service.emit('scheduled') })
        expect(service.show).not.toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledTimes(1)

        delete window.activeDialog
        act(() => { window.dispatchEvent(new CustomEvent('incyclist-dialog-closed')) })
        expect(service.show).toHaveBeenCalledTimes(1)
        expect(result.current.prompt).toEqual({ title: 'Sweet Spot' })
    })

    test('stays deferred if another dialog is still open after a close event', () => {
        window.activeDialog = 'A'
        service.show.mockReturnValue(PROPS)
        renderHook(() => useScheduledWorkoutPrompt())

        act(() => { window.dispatchEvent(new CustomEvent('incyclist-dialog-closed')) })
        expect(service.show).not.toHaveBeenCalled()

        delete window.activeDialog
        act(() => { window.dispatchEvent(new CustomEvent('incyclist-dialog-closed')) })
        expect(service.show).toHaveBeenCalledTimes(1)
    })

    test('Yes navigates to /workouts with autoOpenDetailsId and clears the prompt', () => {
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt())
        act(() => { result.current.onYes() })
        expect(service.onYes).toHaveBeenCalledWith(PROPS)
        expect(navigate).toHaveBeenCalledWith('/workouts', { state: { autoOpenDetailsId: 'w1' } })
        expect(result.current.prompt).toBeNull()
    })

    test('Check workouts navigates to /workouts without state', () => {
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt())
        act(() => { result.current.onCheckWorkouts() })
        expect(service.onCheckWorkouts).toHaveBeenCalledWith(PROPS)
        expect(navigate).toHaveBeenCalledWith('/workouts')
        expect(result.current.prompt).toBeNull()
    })

    test('No dismisses without navigating', () => {
        service.show.mockReturnValue(PROPS)
        const { result } = renderHook(() => useScheduledWorkoutPrompt())
        act(() => { result.current.onNo() })
        expect(service.onNo).toHaveBeenCalledWith(PROPS)
        expect(navigate).not.toHaveBeenCalled()
        expect(result.current.prompt).toBeNull()
    })
})
