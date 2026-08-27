import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { WorkoutSettingsView } from './WorkoutSettingsView'

// WorkoutGraph pulls in react-vis/Autosize, which needs real layout that jsdom doesn't
// provide - mocked here per this repo's established pattern (see ActivityDetails.unit.test.jsx).
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        WorkoutGraph: () => <div data-testid="workout-graph" />,
    }
})

describe('WorkoutSettingsView', () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    const baseProps = {
        workout: { name: 'Test Workout' },
        settings: { useErgMode: true, ftp: 200 },
    }

    // The Audio Step-Change Signal checkbox follows the same raw `<input type="checkbox">`
    // pattern as the existing "Use ERG Mode" one (no id/htmlFor label association), so it's
    // queried by its `name` attribute rather than accessible name/role.
    const getAudioCheckbox = (container) => container.querySelector('input[name="step-change-audio-signal"]')
    const getErgCheckbox = (container) => container.querySelector('input[name="erg-mode"]')

    test('renders the Audio Step-Change Signal checkbox checked, reflecting the current setting value', () => {
        const { container } = render(<WorkoutSettingsView {...baseProps} stepChangeAudioSignal={true} />)

        expect(getAudioCheckbox(container)).toBeChecked()
    })

    test('renders the Audio Step-Change Signal checkbox unchecked when the setting is false', () => {
        const { container } = render(<WorkoutSettingsView {...baseProps} stepChangeAudioSignal={false} />)

        expect(getAudioCheckbox(container)).not.toBeChecked()
    })

    test('defaults the Audio Step-Change Signal checkbox to checked when no value is provided', () => {
        const { container } = render(<WorkoutSettingsView {...baseProps} />)

        expect(getAudioCheckbox(container)).toBeChecked()
    })

    test('calls onChangeStepChangeAudioSignal with the toggled value when the checkbox is clicked', () => {
        const onChangeStepChangeAudioSignal = vi.fn()
        const { container } = render(<WorkoutSettingsView {...baseProps} stepChangeAudioSignal={true}
            onChangeStepChangeAudioSignal={onChangeStepChangeAudioSignal} />)

        fireEvent.click(getAudioCheckbox(container))

        expect(onChangeStepChangeAudioSignal).toHaveBeenCalledWith(false)
    })

    test('does not affect the separate Use ERG Mode checkbox', () => {
        const onChangeErgMode = vi.fn()
        const onChangeStepChangeAudioSignal = vi.fn()
        const { container } = render(<WorkoutSettingsView {...baseProps} stepChangeAudioSignal={true}
            onChangeErgMode={onChangeErgMode}
            onChangeStepChangeAudioSignal={onChangeStepChangeAudioSignal} />)

        expect(getErgCheckbox(container)).toBeChecked()

        fireEvent.click(getErgCheckbox(container))
        expect(onChangeErgMode).toHaveBeenCalledWith(false)
        expect(onChangeStepChangeAudioSignal).not.toHaveBeenCalled()
    })
})
