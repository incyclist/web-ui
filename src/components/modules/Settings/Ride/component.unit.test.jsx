import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { settingsMock, rideMock, rideSettingsMock, googleMapsMock } = vi.hoisted(() => ({
    settingsMock: { getValue: vi.fn(), set: vi.fn() },
    rideMock: { getRideType: vi.fn() },
    rideSettingsMock: { getDisplayProps: vi.fn() },
    googleMapsMock: { isPersonalApiKeyPendingRestart: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useUserSettings: () => settingsMock,
        useRideDisplay: () => rideMock,
        useRideSettingsDisplay: () => rideSettingsMock,
        useGoogleMaps: () => googleMapsMock,
        useRouteList: () => ({ getStartSettings: () => ({ realityFactor: 100 }) }),
    }
})

vi.mock('../../Coaches', () => ({ DynamicCoachList: () => null, DynamicCoachEdit: () => null }))

import { RideSettings, RideSettingsView } from './component'

describe('RideSettingsView video sound', () => {

    test('shows the video sound checkbox for video rides', () => {
        render(<RideSettingsView isRide isVideo videoSound={true} onVideoSoundChanged={vi.fn()} />)

        expect(screen.getByLabelText('Play video sound').checked).toBe(true)
    })

    test('hides the video sound checkbox for non-video rides', () => {
        render(<RideSettingsView isRide isVideo={false} />)

        expect(screen.queryByLabelText('Play video sound')).toBeNull()
    })

    test('reports changes of the checkbox', () => {
        const onVideoSoundChanged = vi.fn()
        render(<RideSettingsView isVideo videoSound={false} onVideoSoundChanged={onVideoSoundChanged} />)

        fireEvent.click(screen.getByLabelText('Play video sound'))

        expect(onVideoSoundChanged).toHaveBeenCalledWith(true)
    })
})

const VALID_KEY = 'AIzaSyB' + '0123456789'.repeat(3) + '01'

const options = (restricted) => new Map([
    ['sv', restricted ? { label: 'Street View', disabled: true, message: 'Not available in simulated rides', reason: 'simulation' } : { label: 'Street View' }],
    ['map', { label: 'Map' }],
    ['sat', restricted ? { label: 'Satellite View', disabled: true, message: 'Not available in simulated rides', reason: 'simulation' } : { label: 'Satellite View' }],
])

describe('RideSettingsView view preference', () => {

    test('all views are selectable if nothing is restricted', () => {
        render(<RideSettingsView isRide rideMode='GPX' rideView='sv' rideViewOptions={options(false)} onRideViewSelected={vi.fn()} />)

        expect(screen.getByLabelText('Street View').disabled).toBe(false)
        expect(screen.getByLabelText('Satellite View').disabled).toBe(false)
        expect(screen.getByLabelText('Street View').checked).toBe(true)
        expect(screen.queryByText(/aren't available in simulated rides/)).toBeNull()
    })

    test('in a restricted ride, Street View and Satellite View are disabled, Map is selected and the way out is offered', () => {
        const onRideViewHelp = vi.fn()
        render(<RideSettingsView isRide rideMode='GPX' rideView='map' rideViewOptions={options(true)}
            rideViewHelp={{ label: 'How to get Street View' }} onRideViewHelp={onRideViewHelp} onRideViewSelected={vi.fn()} />)

        expect(screen.getByLabelText('Street View').disabled).toBe(true)
        expect(screen.getByLabelText('Satellite View').disabled).toBe(true)
        expect(screen.getByLabelText('Map').disabled).toBe(false)
        expect(screen.getByLabelText('Map').checked).toBe(true)
        expect(screen.queryByText(/Street View and Satellite View aren't available in simulated rides/)).not.toBeNull()

        fireEvent.click(screen.getByRole('button', { name: 'How to get Street View' }))
        expect(onRideViewHelp).toHaveBeenCalledTimes(1)
    })
})

describe('RideSettingsView Maps API key', () => {

    test('outside a ride: shown with purpose and guide link', () => {
        render(<RideSettingsView />)

        expect(screen.queryByText('Maps API Key')).not.toBeNull()
        expect(screen.queryByText(/Lets you use Street View and Satellite View in simulated rides/)).not.toBeNull()
        expect(screen.queryByRole('button', { name: /How to create a key/ })).not.toBeNull()
    })

    test('in a normal ride: not shown', () => {
        render(<RideSettingsView isRide rideMode='GPX' rideView='sv' rideViewOptions={options(false)} />)

        expect(screen.queryByText('Maps API Key')).toBeNull()
    })

    test('in a restricted ride: shown, so that a key can be added', () => {
        render(<RideSettingsView isRide rideMode='GPX' rideView='map' rideViewOptions={options(true)} rideViewHelp={{ label: 'How to get Street View' }} />)

        expect(screen.queryByText('Maps API Key')).not.toBeNull()
    })

    test('says when the key takes effect once it was saved', () => {
        render(<RideSettingsView mapsApiKey={VALID_KEY} mapsKeyPendingRestart />)

        expect(screen.queryByText('Saved. Restart Incyclist to use it.')).not.toBeNull()
    })

    test('no restart hint if there is nothing pending', () => {
        render(<RideSettingsView mapsApiKey={VALID_KEY} />)

        expect(screen.queryByText('Saved. Restart Incyclist to use it.')).toBeNull()
    })

    test('masks a saved key while the field is not being edited, and shows it for editing', () => {
        const key = VALID_KEY
        render(<RideSettingsView mapsApiKey={key} />)
        const input = screen.getByRole('textbox')

        expect(input.value).not.toBe(key)
        expect(input.value.startsWith('AIzaSyB')).toBe(true)
        expect(input.value.endsWith('01')).toBe(true)

        fireEvent.focus(input)
        expect(input.value).toBe(key)

        fireEvent.blur(input)
        expect(input.value).not.toBe(key)
    })

    test('the field takes the focus if asked to', () => {
        render(<RideSettingsView focusMapsKey />)

        expect(document.activeElement).toBe(screen.getByRole('textbox'))
    })
})

describe('RideSettings view preference from services', () => {

    beforeEach(() => {
        rideMock.getRideType.mockReturnValue('GPX')
        settingsMock.getValue.mockImplementation((key, defValue) => defValue)
        googleMapsMock.isPersonalApiKeyPendingRestart.mockReturnValue(false)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('takes the selected view, the disabled options and the help from the display props', () => {
        rideSettingsMock.getDisplayProps.mockReturnValue({
            rideView: 'map', rideViewOptions: options(true), rideViewHelp: { label: 'How to get Street View' }
        })

        render(<RideSettings isRide />)

        expect(screen.getByLabelText('Map').checked).toBe(true)
        expect(screen.getByLabelText('Street View').disabled).toBe(true)
        expect(screen.queryByRole('button', { name: 'How to get Street View' })).not.toBeNull()
    })

    test('reports the restart hint of the services', () => {
        rideSettingsMock.getDisplayProps.mockReturnValue({ rideView: 'sv', rideViewOptions: options(false) })
        googleMapsMock.isPersonalApiKeyPendingRestart.mockReturnValue(true)

        render(<RideSettings />)

        expect(screen.queryByText('Saved. Restart Incyclist to use it.')).not.toBeNull()
    })

    test('stores the chosen view', () => {
        rideSettingsMock.getDisplayProps.mockReturnValue({ rideView: 'sv', rideViewOptions: options(false) })
        render(<RideSettings isRide />)

        fireEvent.click(screen.getByLabelText('Map'))

        expect(settingsMock.set).toHaveBeenCalledWith('preferences.rideView', 'map')
    })
})

describe('RideSettings video sound', () => {

    beforeEach(() => {
        rideSettingsMock.getDisplayProps.mockReturnValue({ rideView: 'sv', rideViewOptions: options(false) })
        googleMapsMock.isPersonalApiKeyPendingRestart.mockReturnValue(false)
        rideMock.getRideType.mockReturnValue('Video')
        settingsMock.getValue.mockImplementation((key, defValue) => defValue)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('sound is off by default', () => {
        render(<RideSettings />)

        expect(screen.getByLabelText('Play video sound').checked).toBe(false)
        expect(settingsMock.getValue).toHaveBeenCalledWith('preferences.video.sound', false)
    })

    test('shows the stored setting', () => {
        settingsMock.getValue.mockImplementation((key, defValue) => key === 'preferences.video.sound' ? true : defValue)

        render(<RideSettings />)

        expect(screen.getByLabelText('Play video sound').checked).toBe(true)
    })

    test('stores the setting and notifies the parent when toggled', () => {
        const onSettingsChanged = vi.fn()
        render(<RideSettings onSettingsChanged={onSettingsChanged} />)

        fireEvent.click(screen.getByLabelText('Play video sound'))

        expect(settingsMock.set).toHaveBeenCalledWith('preferences.video.sound', true)
        expect(onSettingsChanged).toHaveBeenCalledWith('route', expect.objectContaining({ videoSound: true }))
        expect(screen.getByLabelText('Play video sound').checked).toBe(true)
    })

    test('does not show the checkbox for non-video rides', () => {
        rideMock.getRideType.mockReturnValue('GPX')

        render(<RideSettings isRide/>)

        expect(screen.queryByLabelText('Play video sound')).toBeNull()
    })
    test('shows the checkbox in App settings Ride section', () => {
        rideMock.getRideType.mockReturnValue(undefined)

        render(<RideSettings />)
        expect(screen.queryByLabelText('Play video sound')).not.toBeNull()

        
    })

})
