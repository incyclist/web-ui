import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { settingsMock, rideMock } = vi.hoisted(() => ({
    settingsMock: { getValue: vi.fn(), set: vi.fn() },
    rideMock: { getRideType: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useUserSettings: () => settingsMock,
        useRideDisplay: () => rideMock,
        useRouteList: () => ({ getStartSettings: () => ({ realityFactor: 100 }) }),
    }
})

vi.mock('../../Coaches', () => ({ DynamicCoachList: () => null, DynamicCoachEdit: () => null }))

import { RideSettings, RideSettingsView } from './component'

describe('RideSettingsView video sound', () => {

    test('shows the video sound checkbox for video rides', () => {
        render(<RideSettingsView isVideo videoSound={true} onVideoSoundChanged={vi.fn()} />)

        expect(screen.getByLabelText('Play video sound').checked).toBe(true)
    })

    test('hides the video sound checkbox for non-video rides', () => {
        render(<RideSettingsView isVideo={false} />)

        expect(screen.queryByLabelText('Play video sound')).toBeNull()
    })

    test('reports changes of the checkbox', () => {
        const onVideoSoundChanged = vi.fn()
        render(<RideSettingsView isVideo videoSound={false} onVideoSoundChanged={onVideoSoundChanged} />)

        fireEvent.click(screen.getByLabelText('Play video sound'))

        expect(onVideoSoundChanged).toHaveBeenCalledWith(true)
    })
})

describe('RideSettings video sound', () => {

    beforeEach(() => {
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

        render(<RideSettings />)

        expect(screen.queryByLabelText('Play video sound')).toBeNull()
    })
})
