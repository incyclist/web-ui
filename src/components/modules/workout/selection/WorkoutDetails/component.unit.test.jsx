import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutDetails } from './component'

const { mockUserSettings } = vi.hoisted(() => ({
    mockUserSettings: {
        getValue: vi.fn((key, def) => def),
        set: vi.fn(),
    },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useUserSettings: () => mockUserSettings,
    }
})

// WorkoutGraph pulls in react-vis/Autosize, which needs real layout that jsdom doesn't
// provide - mocked here per this repo's established pattern (see ActivityDetails.unit.test.jsx).
vi.mock('../../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        WorkoutGraph: () => <div data-testid="workout-graph" />,
    }
})

describe('WorkoutDetails (pre-ride dialog)', () => {

    const baseProps = {
        workout: { name: 'Test Workout', description: 'A test workout' },
        ftp: 200,
        ftpRequired: false,
        useErgMode: true,
        duration: '30 min',
        canStart: true,
        categories: [],
    }

    beforeEach(() => {
        mockUserSettings.getValue.mockImplementation((key, def) => def)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('renders the Audio Step-Change Signal checkbox checked when userSettings has it enabled (or unset, default true)', () => {
        render(<WorkoutDetails {...baseProps} />)

        const checkbox = screen.getByRole('checkbox', { name: 'Audio Step-Change Signal' })
        expect(checkbox).toBeChecked()
    })

    test('renders the Audio Step-Change Signal checkbox unchecked when userSettings has it disabled', () => {
        mockUserSettings.getValue.mockImplementation((key, def) =>
            key === 'preferences.workouts.stepChangeAudioSignal' ? false : def)

        render(<WorkoutDetails {...baseProps} />)

        const checkbox = screen.getByRole('checkbox', { name: 'Audio Step-Change Signal' })
        expect(checkbox).not.toBeChecked()
    })

    test('reads the setting with key preferences.workouts.stepChangeAudioSignal and default true', () => {
        render(<WorkoutDetails {...baseProps} />)

        expect(mockUserSettings.getValue).toHaveBeenCalledWith('preferences.workouts.stepChangeAudioSignal', true)
    })

    test('calls userSettings.set with the right key/value when the checkbox is toggled, and updates local state', () => {
        render(<WorkoutDetails {...baseProps} />)

        const checkbox = screen.getByRole('checkbox', { name: 'Audio Step-Change Signal' })
        expect(checkbox).toBeChecked()

        fireEvent.click(checkbox)

        expect(mockUserSettings.set).toHaveBeenCalledWith('preferences.workouts.stepChangeAudioSignal', false)
        expect(checkbox).not.toBeChecked()
    })

    test('does not thread the audio setting through onStart (bypasses startSettings entirely)', () => {
        const onStart = vi.fn()
        render(<WorkoutDetails {...baseProps} onStart={onStart} />)

        fireEvent.click(screen.getByRole('checkbox', { name: 'Audio Step-Change Signal' }))
        fireEvent.click(screen.getByText('Start'))

        expect(onStart).toHaveBeenCalledWith({ ftp: 200, useErgMode: true })
    })
})
