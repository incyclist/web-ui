import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { PairingPage } from './page'

const { tracker, pairing, ride } = vi.hoisted(() => ({
    tracker: { openVisit: vi.fn(), closeVisit: vi.fn() },
    pairing: { start: vi.fn(), stop: vi.fn(), prepareStart: vi.fn(), setReadyToStart: vi.fn() },
    ride: { canEnforceSimulator: vi.fn() },
}))

vi.mock('incyclist-services', () => ({
    getRouteList: () => ({ getSelected: () => undefined, getStartSettings: () => undefined }),
    useAppState: () => ({ setState: vi.fn(), getPersistedState: () => 'routes' }),
    useDeviceAccess: () => ({}),
    useDeviceConfiguration: () => ({ getSimulatorAdapterId: () => 'sim', add: vi.fn() }),
    useDevicePairing: () => pairing,
    useDeviceRide: () => ride,
    usePairingVisitTracker: () => tracker,
    useWorkoutList: () => ({ getSelected: () => undefined }),
}))

vi.mock('../../hooks', () => ({
    usePageLogger: () => [{ logEvent: vi.fn() }, vi.fn()],
    useUnmountEffect: () => {},
}))
vi.mock('../../hooks/ui/useKey', () => ({ useKey: () => [vi.fn(), vi.fn()] }))
vi.mock('../../bindings/native-ui', () => ({ useAppUI: () => ({}) }))
vi.mock('../../components/molecules', () => ({ DialogLauncher: React.forwardRef(() => null) }))
vi.mock('../../components/modules/PairingInfo/InterfaceSettings', () => ({ default: () => null }))
vi.mock('../../components/modules/PairingInfo/DeviceSelector', () => ({ default: () => null }))

vi.mock('./screen', () => ({
    PairingScreen: ({ onSkip, onOK, onSimulate }) => (
        <div>
            <button onClick={onSkip}>skip</button>
            <button onClick={onOK}>ok</button>
            <button onClick={onSimulate}>simulate</button>
        </div>
    ),
}))

const renderPage = async (mode, canStartRide = false) => {
    pairing.start.mockImplementation((onStateChanged) => {
        onStateChanged({ canStartRide })
        return Promise.resolve()
    })
    await act(async () => {
        render(<MemoryRouter><PairingPage mode={mode} /></MemoryRouter>)
    })
}

describe('PairingPage - visit tracking', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        ride.canEnforceSimulator.mockReturnValue(true)
    })

    test('opens one visit on mount, not in ride mode', async () => {
        await renderPage(undefined)
        expect(tracker.openVisit).toHaveBeenCalledTimes(1)
        expect(tracker.openVisit).toHaveBeenCalledWith({ forRide: false })
    })

    test('opens the visit in ride mode when started for a ride', async () => {
        await renderPage('start')
        expect(tracker.openVisit).toHaveBeenCalledWith({ forRide: true })
    })

    test.each([
        ['skip', undefined, 'skip', false],
        ['skip', 'start', 'cancel', false],
        ['ok', undefined, 'ok', true],
        ['simulate', 'start', 'simulate', false],
    ])('%s button (mode %s) closes the visit with via:%s', async (button, mode, via, canStartRide) => {
        await renderPage(mode, canStartRide)
        fireEvent.click(screen.getByText(button))
        expect(tracker.closeVisit).toHaveBeenCalledWith(via, { canStartRide })
    })

    test('a tracker failure does not break the page', async () => {
        tracker.openVisit.mockImplementationOnce(() => { throw new Error('X') })
        await renderPage(undefined)
        expect(screen.getByText('ok')).toBeTruthy()
    })
})
