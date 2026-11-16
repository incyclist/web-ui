import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutDetailsDialogView } from './WorkoutDetailsDialogView'

// WorkoutGraph pulls in react-vis/Autosize, which needs real layout that jsdom doesn't provide
vi.mock('../../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, WorkoutGraph: () => <div data-testid="workout-graph" /> }
})

describe('WorkoutDetailsDialogView', () => {

    const baseProps = {
        workout: { name: 'Test Workout', description: 'A test workout' },
        duration: '30 min',
        ftp: 200,
        ftpRequired: false,
        useErgMode: true,
        stepChangeAudioSignal: true,
        group: 'My Workouts',
        groups: ['My Workouts'],
        canDelete: true,
        canAddRoute: true,
        attachedRoute: null,
    }

    afterEach(() => { vi.clearAllMocks() })

    const buttons = () => screen.queryAllByRole('button').map(b => b.textContent)

    test('nothing attached: Cancel, Delete, Add Route, Start and no chip', () => {
        render(<WorkoutDetailsDialogView {...baseProps} />)
        expect(screen.getByText('Cancel')).toBeTruthy()
        expect(screen.getByText('Delete')).toBeTruthy()
        expect(screen.getByText('Add Route')).toBeTruthy()
        expect(screen.getByText('Start')).toBeTruthy()
        expect(screen.queryByText(/Route:/)).toBeNull()
        expect(buttons()).not.toContain('Select')
        expect(buttons()).not.toContain('Start without route')
    })

    test('route attached: chip shown, no Add Route; clearing calls onClearRoute', () => {
        const onClearRoute = vi.fn()
        render(<WorkoutDetailsDialogView {...baseProps} canAddRoute={false} attachedRoute={{ id: 'r1', title: 'Alpe' }} onClearRoute={onClearRoute} />)
        expect(screen.getByText('Alpe')).toBeTruthy()
        expect(screen.queryByText('Add Route')).toBeNull()
        fireEvent.click(screen.getByLabelText('Clear route'))
        expect(onClearRoute).toHaveBeenCalled()
    })

    test('no Delete button when canDelete is false', () => {
        render(<WorkoutDetailsDialogView {...baseProps} canDelete={false} />)
        expect(screen.queryByText('Delete')).toBeNull()
    })

    test('Start, Cancel and Add Route call their callbacks', () => {
        const onStart = vi.fn(), onCancel = vi.fn(), onAddRoute = vi.fn()
        render(<WorkoutDetailsDialogView {...baseProps} onStart={onStart} onCancel={onCancel} onAddRoute={onAddRoute} />)
        fireEvent.click(screen.getByText('Start'))
        fireEvent.click(screen.getByText('Cancel'))
        fireEvent.click(screen.getByText('Add Route'))
        expect(onStart).toHaveBeenCalledTimes(1)
        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(onAddRoute).toHaveBeenCalledTimes(1)
    })

    test('Delete asks for confirmation; No keeps the workout, Yes deletes', () => {
        const onDelete = vi.fn()
        render(<WorkoutDetailsDialogView {...baseProps} onDelete={onDelete} />)

        fireEvent.click(screen.getByText('Delete'))
        expect(screen.getByText('This will permanently delete this workout. Are you sure?')).toBeTruthy()
        fireEvent.click(screen.getByText('No'))
        expect(onDelete).not.toHaveBeenCalled()
        expect(screen.queryByText('This will permanently delete this workout. Are you sure?')).toBeNull()

        fireEvent.click(screen.getByText('Delete'))
        fireEvent.click(screen.getByText('Yes'))
        expect(onDelete).toHaveBeenCalledTimes(1)
    })

    test('Stress row only when stress is defined', () => {
        const { rerender } = render(<WorkoutDetailsDialogView {...baseProps} />)
        expect(screen.queryByText('Stress')).toBeNull()
        rerender(<WorkoutDetailsDialogView {...baseProps} stress={78} />)
        expect(screen.getByText('Stress')).toBeTruthy()
    })

    test('audio checkbox reflects the prop and reports changes', () => {
        const onChange = vi.fn()
        render(<WorkoutDetailsDialogView {...baseProps} onStepChangeAudioSignalChange={onChange} />)
        const checkbox = screen.getByRole('checkbox', { name: 'Audio Step-Change Signal' })
        expect(checkbox).toBeChecked()
        fireEvent.click(checkbox)
        expect(onChange).toHaveBeenCalledWith(false)
    })

    test('ERG checkbox reports changes', () => {
        const onChange = vi.fn()
        render(<WorkoutDetailsDialogView {...baseProps} onErgModeChange={onChange} />)
        fireEvent.click(screen.getByRole('checkbox', { name: 'Use ERG Mode' }))
        expect(onChange).toHaveBeenCalledWith(false)
    })

    test('scheduled entry shows the date instead of the category', () => {
        render(<WorkoutDetailsDialogView {...baseProps} isScheduled={true} date={new Date('2025-09-04')} />)
        expect(screen.getByText('Date')).toBeTruthy()
        expect(screen.queryByText('Category')).toBeNull()
    })
})
