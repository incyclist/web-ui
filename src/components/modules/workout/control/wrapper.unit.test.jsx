import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Minimal stand-in for incyclist-services' Observer (on/off/emit, chainable .on()).
const { FakeObserver, mockRideService, mockWorkoutListService, mockUserSettings } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
    }

    const mockRideService = {
        getObserver: () => mockRideService.__observer,
        getDashboardDisplayProperties: () => ({ workout: { name: 'Test Workout' }, mode: 'ERG' }),
        __observer: new FakeObserver(),
    }

    const mockWorkoutListService = {
        unselect: vi.fn(),
    }

    const mockUserSettings = {
        getValue: vi.fn(() => false),
        set: vi.fn(),
    }

    return { FakeObserver, mockRideService, mockWorkoutListService, mockUserSettings }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useWorkoutRide: () => mockRideService,
        useWorkoutList: () => mockWorkoutListService,
        useUserSettings: () => mockUserSettings,
    }
})

import { WorkoutControl } from './wrapper'

describe('WorkoutControl pin persistence', () => {

    beforeEach(() => {
        mockUserSettings.getValue.mockReturnValue(false)
        // fresh observer per test - avoids listeners from a previous test's unmounted
        // component tree still firing (and calling stale state setters) on emit()
        mockRideService.__observer = new FakeObserver()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderControl = () => render(<WorkoutControl visible={true} />)

    test('reads the persisted pinned state on mount', async () => {
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        expect(mockUserSettings.getValue).toHaveBeenCalledWith('preferences.workouts.controlPinned', false)
    })

    test('renders already pinned when the persisted setting is true', async () => {
        mockUserSettings.getValue.mockReturnValue(true)
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        expect(document.getElementById('unpin')).toBeInTheDocument()
        expect(document.getElementById('pin')).not.toBeInTheDocument()
    })

    test('persists the pinned state when the user pins the overlay', async () => {
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))

        expect(mockUserSettings.set).toHaveBeenCalledWith('preferences.workouts.controlPinned', true)
    })

    test('persists the pinned state when the user unpins the overlay', async () => {
        mockUserSettings.getValue.mockReturnValue(true)
        renderControl()
        expect(await screen.findByText('ERG')).toBeInTheDocument()

        fireEvent.click(document.getElementById('unpin'))

        expect(mockUserSettings.set).toHaveBeenCalledWith('preferences.workouts.controlPinned', false)
    })
})
