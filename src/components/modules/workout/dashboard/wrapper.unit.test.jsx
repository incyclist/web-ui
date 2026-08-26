import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

// Minimal stand-in for incyclist-services' Observer (on/off/emit, chainable .on()).
const { FakeObserver, mockRideService, mockUserSettings, playToneMock } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
    }

    const mockRideService = {
        getObserver: () => mockRideService.__observer,
        getDashboardDisplayProperties: () => ({ workout: { name: 'Test Workout' }, current: {} }),
        __observer: new FakeObserver(),
    }

    const mockUserSettings = {
        getValue: vi.fn(() => true),
        set: vi.fn(),
    }

    const playToneMock = vi.fn()

    return { FakeObserver, mockRideService, mockUserSettings, playToneMock }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useWorkoutRide: () => mockRideService,
        useUserSettings: () => mockUserSettings,
    }
})

vi.mock('../../../../utils/stepChangeTone', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        playTone: playToneMock,
    }
})

// Stub the presentational component - we only care about the wrapper's event wiring here.
vi.mock('./component', () => ({
    default: (props) => <div data-testid="dashboard" data-steppulse={JSON.stringify(props.stepPulse ?? null)} />,
}))

import { DynamicWorkoutDashboard } from './wrapper'
import { STEP_COUNTDOWN_TICK_TONE, STEP_CHANGE_TONE } from '../../../../utils/stepChangeTone'

describe('DynamicWorkoutDashboard', () => {

    beforeEach(() => {
        mockUserSettings.getValue.mockReturnValue(true)
        // fresh observer per test - avoids listeners from a previous test's unmounted
        // component tree still firing (and calling stale state setters) on emit()
        mockRideService.__observer = new FakeObserver()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderDashboard = () => render(<DynamicWorkoutDashboard visible={true} />)

    test('plays the countdown tick tone and sets a "tick" stepPulse on step-countdown, when the setting is enabled', async () => {
        renderDashboard()
        expect(await screen.findByTestId('dashboard')).toBeInTheDocument()

        act(() => {
            mockRideService.__observer.emit('step-countdown', { secondsRemaining: 4 })
        })

        expect(playToneMock).toHaveBeenCalledWith(STEP_COUNTDOWN_TICK_TONE)
        const el = screen.getByTestId('dashboard')
        const pulse = JSON.parse(el.dataset.steppulse)
        expect(pulse.type).toBe('tick')
        expect(pulse.ts).toEqual(expect.any(Number))
    })

    test('does not play a tone on step-countdown when the setting is disabled, but still sets the visual pulse', async () => {
        mockUserSettings.getValue.mockReturnValue(false)
        renderDashboard()
        expect(await screen.findByTestId('dashboard')).toBeInTheDocument()

        act(() => {
            mockRideService.__observer.emit('step-countdown', { secondsRemaining: 1 })
        })

        expect(playToneMock).not.toHaveBeenCalled()
        const el = screen.getByTestId('dashboard')
        const pulse = JSON.parse(el.dataset.steppulse)
        expect(pulse.type).toBe('tick')
    })

    test('plays the step-change tone and sets a "flash" stepPulse on step-changed, when stepChangeSignal is true and the setting is enabled', async () => {
        renderDashboard()
        expect(await screen.findByTestId('dashboard')).toBeInTheDocument()

        act(() => {
            mockRideService.__observer.emit('step-changed', { stepChangeSignal: true, title: 'next step' })
        })

        expect(playToneMock).toHaveBeenCalledWith(STEP_CHANGE_TONE)
        const el = screen.getByTestId('dashboard')
        const pulse = JSON.parse(el.dataset.steppulse)
        expect(pulse.type).toBe('flash')
    })

    test('does not play a tone or set a pulse on step-changed when stepChangeSignal is false', async () => {
        renderDashboard()
        expect(await screen.findByTestId('dashboard')).toBeInTheDocument()

        act(() => {
            mockRideService.__observer.emit('step-changed', { stepChangeSignal: false, title: 'next step' })
        })

        expect(playToneMock).not.toHaveBeenCalled()
        const el = screen.getByTestId('dashboard')
        const pulse = JSON.parse(el.dataset.steppulse)
        expect(pulse).toBeNull()
    })

    test('does not play the step-change tone when stepChangeSignal is true but the setting is disabled', async () => {
        mockUserSettings.getValue.mockReturnValue(false)
        renderDashboard()
        expect(await screen.findByTestId('dashboard')).toBeInTheDocument()

        act(() => {
            mockRideService.__observer.emit('step-changed', { stepChangeSignal: true, title: 'next step' })
        })

        expect(playToneMock).not.toHaveBeenCalled()
        const el = screen.getByTestId('dashboard')
        const pulse = JSON.parse(el.dataset.steppulse)
        expect(pulse.type).toBe('flash')
    })

    test('reads the stepChangeAudioSignal setting with a default of true', async () => {
        renderDashboard()
        expect(await screen.findByTestId('dashboard')).toBeInTheDocument()

        act(() => {
            mockRideService.__observer.emit('step-countdown', { secondsRemaining: 2 })
        })

        expect(mockUserSettings.getValue).toHaveBeenCalledWith('preferences.workouts.stepChangeAudioSignal', true)
    })
})
