import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'

const { logEvent } = vi.hoisted(() => ({ logEvent: vi.fn() }))

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { return { logEvent } })
}))
vi.mock('../../../../../utils/electron/integration', () => ({
    hasFeature: vi.fn(() => false),
    api: {},
}))

import { StartRideOverlay, getPhaseHeading, getConvertPercent, getReadyHelperText } from './StartRideOverlay'

const trainer = (o = {}) => ({ udid: 't1', name: 'KICKR CORE', isControl: true, status: 'Started', startState: 'started', ...o })
const hrm = (o = {}) => ({ udid: 'h1', name: 'HRM-Pro', isControl: false, status: 'Started', startState: 'started', ...o })

const rowTexts = () => Array.from(document.querySelectorAll('.startoverlay-details > div')).map(r => r.textContent)

describe('StartRideOverlay', () => {

    afterEach(() => {
        cleanup()
        vi.clearAllMocks()
    })

    describe('renderer', () => {
        test('starting state always uses the phased renderer', () => {
            render(<StartRideOverlay mode='GPX' startPhase='devices' devices={[trainer({ startState: 'starting', status: 'Starting' })]} />)
            expect(screen.getByText('Starting devices ...')).not.toBeNull()
            expect(screen.queryByText('Starting activity ...')).toBeNull()
        })

        test('without startPhase it still renders the phased overlay', () => {
            render(<StartRideOverlay mode='GPX' devices={[trainer({ startState: 'starting', status: 'Starting' })]} />)
            expect(screen.getByText('Starting devices ...')).not.toBeNull()
        })
    })

    describe('error precedence unchanged', () => {
        test('control device failure shows device error screen', () => {
            render(<StartRideOverlay mode='GPX' startPhase='devices' devices={[trainer({ status: 'Error', startState: 'failed' })]} />)
            expect(screen.getByText('Start failed')).not.toBeNull()
            expect(screen.getByText('Retry')).not.toBeNull()
        })

        test('map error shows map error screen', () => {
            render(<StartRideOverlay mode='GPX' startPhase='content' mapStateError='no map' devices={[trainer()]} />)
            expect(screen.getByText('Start failed')).not.toBeNull()
            expect(screen.getByText('no map')).not.toBeNull()
        })

        test('video error shows video error screen', () => {
            render(<StartRideOverlay mode='Video' startPhase='content' videoState='Start:Failed' videoStateError='bad file' devices={[trainer()]} />)
            expect(screen.getByText('bad file')).not.toBeNull()
        })

        test('failed sensor stays on the phased screen (no sensor-error screen)', () => {
            render(<StartRideOverlay mode='GPX' rideState='Error' startPhase='ready' readyToStart={true}
                devices={[trainer(), hrm({ status: 'Error', startState: 'not-connected', canRetry: true, canIgnore: true })]} />)
            expect(screen.getByText('Ready to ride')).not.toBeNull()
            expect(screen.queryByText('Could not start Sensor(s)')).toBeNull()
        })
    })

    describe('rows', () => {
        test('trainer first, content, Optional divider, then sensors', () => {
            render(<StartRideOverlay mode='GPX' startPhase='content'
                devices={[hrm({ startState: 'starting', status: 'Starting' }), trainer()]}
                startContent={{ kind: 'map', label: 'Map', state: 'loading' }} />)

            const rows = rowTexts()
            expect(rows[0]).toContain('KICKR CORE')
            expect(rows[1]).toContain('Map')
            expect(rows[2]).toBe('Optional')
            expect(rows[3]).toContain('HRM-Pro')
        })

        test('no divider without sensors; no content row for workout-only', () => {
            render(<StartRideOverlay mode='Workout' startPhase='devices' devices={[trainer({ startState: 'starting', status: 'Starting' })]} />)
            expect(screen.queryByText('Optional')).toBeNull()
            expect(rowTexts()).toHaveLength(1)
        })

        test('amber Not connected, muted Ignored, green Started', () => {
            render(<StartRideOverlay mode='GPX' startPhase='ready' readyToStart={true}
                devices={[trainer(), hrm({ startState: 'not-connected', status: 'Error' }),
                    hrm({ udid: 'c1', name: 'Cadence', startState: 'ignored' })]} />)
            expect(screen.getByText('▲ Not connected')).not.toBeNull()
            expect(screen.getByText('– Ignored')).not.toBeNull()
            expect(screen.getByText('✓ Started')).not.toBeNull()
        })

        test('slow sensor shows Still starting', () => {
            render(<StartRideOverlay mode='GPX' startPhase='devices'
                devices={[trainer(), hrm({ startState: 'starting', status: 'Starting', slow: true })]} />)
            expect(screen.getByText(/Still starting/)).not.toBeNull()
        })

        test('AVI converting shows Preparing (N%)', () => {
            render(<StartRideOverlay mode='Video' startPhase='content'
                devices={[trainer()]}
                startContent={{ kind: 'video', label: 'Video', state: 'loading', progress: { convertPct: 42 } }} />)
            expect(screen.getByText('Preparing video ...')).not.toBeNull()
            expect(screen.getByText(/Preparing \(42%\)/)).not.toBeNull()
            expect(screen.getByText(/This video has to be prepared/)).not.toBeNull()
        })
    })

    describe('line under the header', () => {
        test('slow wins over AVI line', () => {
            render(<StartRideOverlay mode='Video' startPhase='content' startSlow={true}
                devices={[trainer()]}
                startContent={{ kind: 'video', label: 'Video', state: 'loading', progress: { convertPct: 1 } }} />)
            expect(screen.getByText('This is taking longer than usual.')).not.toBeNull()
            expect(screen.queryByText(/has to be prepared/)).toBeNull()
        })

        test('ready helper names the pending sensor', () => {
            render(<StartRideOverlay mode='GPX' startPhase='ready' readyToStart={true}
                devices={[trainer(), hrm({ startState: 'starting', status: 'Starting' })]}
                startReadyInfo={{ pendingSensors: ['HRM-Pro'], notConnectedSensors: [], viewFallback: false }} />)
            expect(screen.getByText('HRM-Pro is still connecting. You can start without it.')).not.toBeNull()
        })
    })

    describe('row actions', () => {
        test('Retry and Ignore call back with the udid', () => {
            const onRetryDevice = vi.fn()
            const onIgnoreDevice = vi.fn()
            render(<StartRideOverlay mode='GPX' startPhase='ready' readyToStart={true}
                onRetryDevice={onRetryDevice} onIgnoreDevice={onIgnoreDevice}
                devices={[trainer(), hrm({ startState: 'not-connected', status: 'Error', canRetry: true, canIgnore: true })]} />)

            fireEvent.click(screen.getByRole('button', { name: 'Retry HRM-Pro' }))
            fireEvent.click(screen.getByRole('button', { name: 'Ignore HRM-Pro' }))

            expect(onRetryDevice).toHaveBeenCalledWith('h1')
            expect(onIgnoreDevice).toHaveBeenCalledWith('h1')
        })

        test('no actions unless the device allows them', () => {
            render(<StartRideOverlay mode='GPX' startPhase='devices'
                devices={[trainer({ startState: 'starting', status: 'Starting' })]} />)
            expect(screen.queryByRole('button', { name: /Retry|Ignore/ })).toBeNull()
        })
    })

    describe('overlay buttons', () => {
        test('Start is shown when readyToStart and calls onIgnore', () => {
            const onIgnore = vi.fn()
            render(<StartRideOverlay mode='GPX' startPhase='ready' readyToStart={true} onIgnore={onIgnore}
                devices={[trainer(), hrm({ startState: 'starting', status: 'Starting' })]} />)
            fireEvent.click(screen.getByText('Start'))
            expect(onIgnore).toHaveBeenCalled()
        })

        test('no Start button before ready', () => {
            render(<StartRideOverlay mode='GPX' startPhase='devices' readyToStart={false} devices={[trainer({ startState: 'starting', status: 'Starting' })]} />)
            expect(screen.queryByText('Start')).toBeNull()
        })

        test('Street View slow offers Start with Map', () => {
            const onStartWithMap = vi.fn()
            render(<StartRideOverlay mode='GPX' startPhase='content' viewState='slow' onStartWithMap={onStartWithMap}
                devices={[trainer()]} startContent={{ kind: 'streetview', label: 'Street View', state: 'loading' }} />)
            fireEvent.click(screen.getByText('Start with Map'))
            expect(onStartWithMap).toHaveBeenCalled()
        })

        test('Cancel calls onCancel', () => {
            const onCancel = vi.fn()
            render(<StartRideOverlay mode='GPX' startPhase='devices' onCancel={onCancel} devices={[trainer({ startState: 'starting', status: 'Starting' })]} />)
            fireEvent.click(screen.getByText('Cancel'))
            expect(onCancel).toHaveBeenCalled()
        })
    })

    describe('helpers', () => {
        test('getPhaseHeading', () => {
            expect(getPhaseHeading('devices')).toBe('Starting devices ...')
            expect(getPhaseHeading('ready')).toBe('Ready to ride')
            expect(getPhaseHeading('content', { kind: 'map' })).toBe('Loading map ...')
            expect(getPhaseHeading('content', { kind: 'satellite' })).toBe('Loading map ...')
            expect(getPhaseHeading('content', { kind: 'streetview' })).toBe('Preparing Street View ...')
            expect(getPhaseHeading('content', { kind: 'video' })).toBe('Loading video ...')
            expect(getPhaseHeading('content', { kind: 'video', progress: {} })).toBe('Preparing video ...')
        })

        test('getConvertPercent uses the larger of pct and time/200s, capped at 99', () => {
            expect(getConvertPercent({})).toBe(0)
            expect(getConvertPercent({ convertPct: 10, convertSeconds: 100 })).toBe(50)
            expect(getConvertPercent({ convertPct: 100 })).toBe(99)
        })

        test('getReadyHelperText', () => {
            expect(getReadyHelperText({ pendingSensors: [], notConnectedSensors: ['A'], viewFallback: false })).toBe("A isn't connected. You can start without it.")
            expect(getReadyHelperText({ pendingSensors: ['A'], notConnectedSensors: ['B'], viewFallback: false })).toBe("Some sensors aren't connected yet. You can start without them.")
            expect(getReadyHelperText({ pendingSensors: [], notConnectedSensors: [], viewFallback: true })).toBe("Street View isn't available right now. You'll ride with the Map.")
            expect(getReadyHelperText({ pendingSensors: [], notConnectedSensors: [], viewFallback: false })).toBeNull()
        })
    })
})
