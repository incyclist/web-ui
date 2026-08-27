import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { WorkoutSettings } from './WorkoutSettings'

const { mockWorkoutListService, mockRideService, mockUserSettings } = vi.hoisted(() => ({
    mockWorkoutListService: {
        getSelected: vi.fn(() => ({ name: 'Test Workout' })),
        getStartSettings: vi.fn(() => ({ useErgMode: true, ftp: 200 })),
        setStartSettings: vi.fn(),
        unselect: vi.fn(),
        openSettings: vi.fn(() => ({ observer: undefined, workouts: [] })),
        import: vi.fn(),
    },
    mockRideService: {
        stop: vi.fn(),
    },
    mockUserSettings: {
        getValue: vi.fn((key, def) => {
            if (key === 'preferences.workouts.stepChangeAudioSignal') return true
            if (key === 'user') return {}
            return def
        }),
        set: vi.fn(),
    },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useWorkoutList: () => mockWorkoutListService,
        useWorkoutRide: () => mockRideService,
        useUserSettings: () => mockUserSettings,
    }
})

// WorkoutGraph pulls in react-vis/Autosize, which needs real layout that jsdom doesn't
// provide - mocked here per this repo's established pattern (see ActivityDetails.unit.test.jsx).
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        WorkoutGraph: () => <div data-testid="workout-graph" />,
    }
})

describe('WorkoutSettings', () => {

    beforeEach(() => {
        mockUserSettings.getValue.mockClear()
        mockUserSettings.set.mockClear()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('renders the Audio Step-Change Signal checkbox reflecting the current userSettings value (true)', () => {
        mockUserSettings.getValue.mockImplementation((key, def) =>
            key === 'preferences.workouts.stepChangeAudioSignal' ? true : def)

        const { container } = render(<WorkoutSettings />)

        const audioCheckbox = container.querySelector('input[name="step-change-audio-signal"]')
        expect(audioCheckbox).toBeChecked()
    })

    test('renders the Audio Step-Change Signal checkbox unchecked when userSettings has it set to false', () => {
        mockUserSettings.getValue.mockImplementation((key, def) =>
            key === 'preferences.workouts.stepChangeAudioSignal' ? false : def)

        const { container } = render(<WorkoutSettings />)

        const audioCheckbox = container.querySelector('input[name="step-change-audio-signal"]')
        expect(audioCheckbox).not.toBeChecked()
    })

    test('calls userSettings.set with the right key/value when the Audio Step-Change Signal checkbox is toggled', () => {
        mockUserSettings.getValue.mockImplementation((key, def) =>
            key === 'preferences.workouts.stepChangeAudioSignal' ? true : def)

        const { container } = render(<WorkoutSettings />)

        const audioCheckbox = container.querySelector('input[name="step-change-audio-signal"]')
        fireEvent.click(audioCheckbox)

        expect(mockUserSettings.set).toHaveBeenCalledWith('preferences.workouts.stepChangeAudioSignal', false)
    })
})
