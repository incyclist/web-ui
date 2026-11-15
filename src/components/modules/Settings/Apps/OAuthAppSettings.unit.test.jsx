import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { events, authorize, features } = vi.hoisted(() => ({
    events: { handlers: {} },
    authorize: { fn: null },
    features: { oauth: true }
}))

let state
const operations = () => [{ operation: 'ActivityUpload', enabled: true }]

const service = {
    openAppSettings: vi.fn(() => state.settings),
    connect: vi.fn(async (app) => {
        state.settings = { isConnected: true, operations: state.operations }
        service.emit('connected', app, true)
        return true
    }),
    disconnect: vi.fn((app) => {
        state.settings = { isConnected: false, operations: state.operations }
        service.emit('disconnected', app)
    }),
    enableOperation: vi.fn(() => state.operations),
    on: vi.fn((event, handler) => { (events.handlers[event] ??= []).push(handler) }),
    off: vi.fn((event, handler) => { events.handlers[event] = (events.handlers[event] ?? []).filter(h => h !== handler) }),
    emit: (event, ...args) => { [...(events.handlers[event] ?? [])].forEach(h => h(...args)) },
}

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useAppsService: () => service }
})
vi.mock('../../../../utils/electron/integration', () => ({ hasFeature: (feature) => features[feature] }))
vi.mock('../../../../bindings', () => ({
    OAuthBinding: { getInstance: () => ({ authorize: (...args) => authorize.fn(...args) }) }
}))

import { OAuthAppSettings } from './OAuthAppSettings'

const setup = (isConnected, appKey = 'strava', name = 'Strava') => {
    state = { operations: operations(), settings: { isConnected, operations: operations() } }
    return render(<OAuthAppSettings appKey={appKey} name={name} />)
}

/** the state of the service changes without any action in the panel (e.g. a connection that finishes after the row was collapsed) */
const changeInBackground = (event, isConnected, app = 'strava') => {
    state.settings = { isConnected, operations: state.operations }
    act(() => { service.emit(event, app, true) })
}

describe('OAuthAppSettings', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        events.handlers = {}
        features.oauth = true
        authorize.fn = vi.fn()
    })

    describe('follows the state of the service', () => {

        // review comment: reopen the row before OAuth finished -> the dot was green, but the button still said "Connect"
        test('a connection that finishes while the panel is open is shown', () => {
            setup(false)
            expect(screen.getByText('Connect with Strava')).toBeDefined()

            changeInBackground('connected', true)

            expect(screen.queryByText('Connect with Strava')).toBeNull()
            expect(screen.getByText('Disconnect')).toBeDefined()
            expect(screen.getByLabelText('Activity Upload')).toBeDefined()
        })

        test('a disconnect from somewhere else is shown', () => {
            setup(true)
            expect(screen.getByText('Disconnect')).toBeDefined()

            changeInBackground('disconnected', false)

            expect(screen.getByText('Connect with Strava')).toBeDefined()
            expect(screen.queryByText('Disconnect')).toBeNull()
        })

        test('events of other apps are ignored', () => {
            setup(false)

            changeInBackground('connected', true, 'komoot')

            expect(screen.getByText('Connect with Strava')).toBeDefined()
        })

        test('stops following the service when the panel is closed', () => {
            const { unmount } = setup(false)
            expect(events.handlers.connected).toHaveLength(1)
            expect(events.handlers.disconnected).toHaveLength(1)

            unmount()

            expect(events.handlers.connected).toHaveLength(0)
            expect(events.handlers.disconnected).toHaveLength(0)
            service.openAppSettings.mockClear()
            service.emit('connected', 'strava', true)
            expect(service.openAppSettings).not.toHaveBeenCalled()
        })

        test('a panel that is opened again shows the current state', () => {
            const first = setup(false)
            first.unmount()
            state.settings = { isConnected: true, operations: state.operations }

            render(<OAuthAppSettings appKey='strava' name='Strava' />)

            expect(screen.getByText('Disconnect')).toBeDefined()
        })

        test('the title of the app is used for the connect button (app provided by the service)', () => {
            setup(false, 'trainingpeaks', 'TrainingPeaks')

            expect(screen.getByText('Connect with TrainingPeaks')).toBeDefined()
        })
    })

    describe('connect', () => {

        test('connects with the credentials of the auth-server', async () => {
            setup(false)
            const credentials = { id: 1, accesstoken: 'at', refreshtoken: 'rt', expiration: '1' }
            authorize.fn.mockResolvedValue({ success: true, user: { auth: { strava: credentials } } })

            await act(async () => { fireEvent.click(screen.getByText('Connect with Strava')) })

            expect(authorize.fn).toHaveBeenCalledWith('strava')
            expect(service.connect).toHaveBeenCalledWith('strava', credentials)
            expect(screen.getByText('Disconnect')).toBeDefined()
        })

        test('shows the progress while the user authorizes', async () => {
            setup(false)
            let finish
            authorize.fn.mockReturnValue(new Promise(resolve => { finish = resolve }))

            await act(async () => { fireEvent.click(screen.getByText('Connect with Strava')) })
            expect(screen.getByText('Connecting...')).toBeDefined()

            await act(async () => { finish({ success: false, reason: 'cancelled' }) })
            expect(screen.queryByText('Connecting...')).toBeNull()
            expect(screen.getByText('Connect with Strava')).toBeDefined()
        })

        test('authorization failed: not connected', async () => {
            setup(false)
            authorize.fn.mockResolvedValue({ success: false, reason: 'denied' })

            await act(async () => { fireEvent.click(screen.getByText('Connect with Strava')) })

            expect(service.connect).not.toHaveBeenCalled()
            expect(screen.getByText('Connect with Strava')).toBeDefined()
        })

        test('authorization throws: not connected, the panel is usable again', async () => {
            setup(false)
            authorize.fn.mockRejectedValue(new Error('ERROR'))

            await act(async () => { fireEvent.click(screen.getByText('Connect with Strava')) })

            expect(service.connect).not.toHaveBeenCalled()
            expect(screen.getByText('Connect with Strava')).toBeDefined()
        })

        test('not supported by this platform (feature oauth): nothing happens', async () => {
            features.oauth = false
            setup(false)

            await act(async () => { fireEvent.click(screen.getByText('Connect with Strava')) })

            expect(authorize.fn).not.toHaveBeenCalled()
        })
    })

    describe('disconnect and operations', () => {

        test('disconnects and keeps the operations for the next connect', async () => {
            setup(true)

            fireEvent.click(screen.getByText('Disconnect'))

            expect(service.disconnect).toHaveBeenCalledWith('strava')
            expect(screen.getByText('Connect with Strava')).toBeDefined()

            authorize.fn.mockResolvedValue({ success: true, user: { auth: { strava: { accesstoken: 'a' } } } })
            await act(async () => { fireEvent.click(screen.getByText('Connect with Strava')) })
            expect(screen.getByLabelText('Activity Upload')).toBeDefined()
        })

        test('a changed operation is passed on to the service', () => {
            setup(true)

            fireEvent.click(screen.getByLabelText('Activity Upload'))

            expect(service.enableOperation).toHaveBeenCalledWith('strava', 'ActivityUpload', false, true)
        })
    })
})
