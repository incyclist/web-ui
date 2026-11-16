import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { EventEmitter } from 'node:events'
import { WorkoutDetailsDialog } from './WorkoutDetailsDialog'

const { mockService, mockUserSettings } = vi.hoisted(() => ({
    mockService: {},
    mockUserSettings: { getValue: vi.fn(), set: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        getWorkoutListPageService: () => mockService,
        // must never be used by the dialog
        useUserSettings: () => mockUserSettings,
        useWorkoutList: () => { throw new Error('domain service must not be used') },
        useRouteList: () => { throw new Error('domain service must not be used') },
    }
})

vi.mock('../../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, WorkoutGraph: () => <div data-testid="workout-graph" /> }
})

const details = (over = {}) => ({
    id: 'w1', title: 'Sweet Spot', workout: { name: 'Sweet Spot', description: 'desc' },
    description: 'desc', duration: '60min', ftp: 200, ftpRequired: true, useErgMode: true,
    stepChangeAudioSignal: true, group: 'My Workouts', groups: ['My Workouts'],
    canDelete: true, canStart: false, canStartWorkoutOnly: true, canAddRoute: true,
    attachedRoute: null, isScheduled: false, ...over,
})

describe('WorkoutDetailsDialog', () => {

    let observer

    beforeEach(() => {
        observer = new EventEmitter()
        Object.assign(mockService, {
            getWorkoutDetailsProps: vi.fn(() => details()),
            getPageObserver: () => observer,
            onStartFromDetails: vi.fn(), onCloseDetails: vi.fn(), onAddRoute: vi.fn(),
            onClearRouteSelection: vi.fn(), onSetFtp: vi.fn(), onSetErgMode: vi.fn(),
            onSetStepChangeAudioSignal: vi.fn(), onChangeGroup: vi.fn(),
            onDelete: vi.fn(async () => true),
        })
    })

    afterEach(() => { vi.clearAllMocks() })

    test('reads details for the id and renders nothing when unknown', () => {
        mockService.getWorkoutDetailsProps.mockReturnValue(null)
        const { container } = render(<WorkoutDetailsDialog id='x' />)
        expect(mockService.getWorkoutDetailsProps).toHaveBeenCalledWith('x')
        expect(container.innerHTML).toBe('')
    })

    test('Start / Cancel / Add Route go to the page service', () => {
        render(<WorkoutDetailsDialog id='w1' />)
        fireEvent.click(screen.getByText('Start'))
        fireEvent.click(screen.getByText('Add Route'))
        fireEvent.click(screen.getByText('Cancel'))
        expect(mockService.onStartFromDetails).toHaveBeenCalledWith('w1')
        expect(mockService.onAddRoute).toHaveBeenCalledWith('w1')
        expect(mockService.onCloseDetails).toHaveBeenCalled()
    })

    test('re-reads the details on page-update', () => {
        render(<WorkoutDetailsDialog id='w1' />)
        expect(screen.queryByText('Alpe')).toBeNull()
        mockService.getWorkoutDetailsProps.mockReturnValue(details({ attachedRoute: { id: 'r', title: 'Alpe' }, canAddRoute: false }))
        act(() => { observer.emit('page-update') })
        expect(screen.getByText('Alpe')).toBeTruthy()
        expect(screen.queryByText('Add Route')).toBeNull()
    })

    test('clearing the route chip calls onClearRouteSelection', () => {
        mockService.getWorkoutDetailsProps.mockReturnValue(details({ attachedRoute: { id: 'r', title: 'Alpe' }, canAddRoute: false }))
        render(<WorkoutDetailsDialog id='w1' />)
        fireEvent.click(screen.getByLabelText('Clear route'))
        expect(mockService.onClearRouteSelection).toHaveBeenCalled()
    })

    test('confirmed delete deletes and closes the dialog', async () => {
        render(<WorkoutDetailsDialog id='w1' />)
        fireEvent.click(screen.getByText('Delete'))
        fireEvent.click(screen.getByText('Yes'))
        await waitFor(() => expect(mockService.onCloseDetails).toHaveBeenCalled())
        expect(mockService.onDelete).toHaveBeenCalledWith('w1')
    })

    test('audio and ERG changes go through the page service, not user settings', () => {
        render(<WorkoutDetailsDialog id='w1' />)
        fireEvent.click(screen.getByRole('checkbox', { name: 'Audio Step-Change Signal' }))
        fireEvent.click(screen.getByRole('checkbox', { name: 'Use ERG Mode' }))
        expect(mockService.onSetStepChangeAudioSignal).toHaveBeenCalledWith(false)
        expect(mockService.onSetErgMode).toHaveBeenCalledWith(false)
        expect(mockUserSettings.set).not.toHaveBeenCalled()
    })
})
