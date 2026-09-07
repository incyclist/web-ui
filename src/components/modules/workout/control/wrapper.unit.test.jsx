import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Minimal stand-in for incyclist-services' Observer (on/off/emit, chainable .on()).
const { FakeObserver, mockRideService, mockWorkoutListService, defaultDashboardProps } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
    }

    const defaultDashboardProps = () => ({ workout: { name: 'Test Workout' }, mode: 'ERG', pinned: false })

    const mockRideService = {
        getObserver: () => mockRideService.__observer,
        getDashboardDisplayProperties: defaultDashboardProps,
        setOverlayPinned: vi.fn(),
        __observer: new FakeObserver(),
    }

    const mockWorkoutListService = {
        unselect: vi.fn(),
    }

    return { FakeObserver, mockRideService, mockWorkoutListService, defaultDashboardProps }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useWorkoutRide: () => mockRideService,
        useWorkoutList: () => mockWorkoutListService,
    }
})

import { WorkoutControl } from './wrapper'

describe('WorkoutControl pin persistence', () => {

    beforeEach(() => {
        mockRideService.getDashboardDisplayProperties = defaultDashboardProps
        // fresh observer per test - avoids listeners from a previous test's unmounted
        // component tree still firing (and calling stale state setters) on emit()
        mockRideService.__observer = new FakeObserver()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderControl = () => render(<WorkoutControl visible={true} />)

    test('renders unpinned when the initial dashboard display properties report it as unpinned', async () => {
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        expect(document.getElementById('pin')).toBeInTheDocument()
        expect(document.getElementById('unpin')).not.toBeInTheDocument()
    })

    test('renders already pinned when the initial dashboard display properties report it as pinned', async () => {
        mockRideService.getDashboardDisplayProperties = () => ({ workout: { name: 'Test Workout' }, mode: 'ERG', pinned: true })
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        expect(document.getElementById('unpin')).toBeInTheDocument()
        expect(document.getElementById('pin')).not.toBeInTheDocument()
    })

    test('only calls the service when the user pins the overlay - no local state is flipped directly', async () => {
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))

        expect(mockRideService.setOverlayPinned).toHaveBeenCalledWith(true)
        // no 'update' event fired yet -> UI must still show the pre-click (unpinned) state
        expect(document.getElementById('pin')).toBeInTheDocument()
    })

    test('reflects the pinned state once the service emits its update event, without a local pinned flag', async () => {
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))
        act(() => {
            mockRideService.__observer.emit('update', { mode: 'ERG', pinned: true })
        })

        expect(document.getElementById('unpin')).toBeInTheDocument()
    })

    test('un-pins only via the service round-trip', async () => {
        mockRideService.getDashboardDisplayProperties = () => ({ workout: { name: 'Test Workout' }, mode: 'ERG', pinned: true })
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        fireEvent.click(document.getElementById('unpin'))
        expect(mockRideService.setOverlayPinned).toHaveBeenCalledWith(false)

        act(() => {
            mockRideService.__observer.emit('update', { mode: 'ERG', pinned: false })
        })

        expect(document.getElementById('pin')).toBeInTheDocument()
    })
})
