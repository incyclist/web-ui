import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { mockList, mockPageService, mockLogError } = vi.hoisted(() => ({
    mockList: {},
    mockPageService: { getActivityDetailsProps: vi.fn(), onClearWorkoutSelection: vi.fn() },
    mockLogError: vi.fn(),
}))

vi.mock('incyclist-services', async (importOriginal) => ({
    ...(await importOriginal()),
    useActivityList: () => mockList,
    getActivitiesPageService: () => mockPageService,
}))
vi.mock('../../../../bindings/native-ui', () => ({ useAppUI: () => ({}) }))
vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { return { logEvent: mockLogError } }),
}))

// ActivityGraph/ScreenshotPopup pull in charting/map libraries that need real layout/DOM APIs
// jsdom doesn't provide - they are irrelevant to the upload-pill behaviour under test here.
vi.mock('../../../molecules/Activity', async () => {
    const actual = await vi.importActual('../../../molecules/Activity')
    return {
        ...actual,
        ActivityGraph: () => null,
        ScreenshotPopup: () => null,
    }
})

vi.mock('../../../molecules', async () => {
    const actual = await vi.importActual('../../../molecules')
    return {
        ...actual,
        Dialog: ({ children }) => <div>{children}</div>,
        FreeMap: () => null,
    }
})

import { ActivityDetails, ActivityDetailsDialog } from './ActivityDetails'

// Regression coverage for FIXES_BACKLOG item #48 (defense-in-depth, web-ui side):
// while activity.details is still loading, incyclist-services now reports upload status
// 'loading' instead of 'unknown'. The Synchronize pill must treat that as non-actionable,
// so it can't be clicked before the real details (and therefore a real upload status) exist.
describe('ActivityDetails - upload pill loading status (issue #48)', () => {

    const baseProps = {
        title: 'Test Activity',
        activity: {},
        units: {},
        exports: [],
        showMap: false,
        canStart: false,
        canOpen: false,
    }

    test('an upload still loading its details cannot be synchronized', () => {
        const onUpload = vi.fn()
        const uploads = [
            { type: 'komoot', text: 'Komoot', status: 'loading', synchronizing: false },
        ]

        render(<ActivityDetails {...baseProps} uploads={uploads} onUpload={onUpload} />)

        const pillText = screen.getByText('Komoot')
        fireEvent.click(pillText)

        // the pill must not expose a Synchronize action while status is 'loading'
        expect(screen.queryByText('Synchronize')).not.toBeInTheDocument()
        expect(onUpload).not.toHaveBeenCalled()
    })

    test('control case: a not-yet-synced upload (status unknown) can still be synchronized', () => {
        const onUpload = vi.fn()
        const uploads = [
            { type: 'strava', text: 'Strava', status: 'unknown', synchronizing: false },
        ]

        render(<ActivityDetails {...baseProps} uploads={uploads} onUpload={onUpload} />)

        const pillText = screen.getByText('Strava')
        fireEvent.click(pillText)

        const syncItem = screen.getByText('Synchronize')
        fireEvent.click(syncItem)

        expect(onUpload).toHaveBeenCalledWith(uploads[0])
    })
})


describe('ActivityDetails - workout attachment', () => {
    const base = { title: 'Ride', activity: {}, units: {}, exports: [], showMap: false, canOpen: true }
    const attachedWorkout = { id: 'w1', title: 'Sweet Spot 3x12' }

    test('canStart without a workout shows Add Workout directly after Ride Again', () => {
        render(<ActivityDetails {...base} canStart />)
        const names = screen.getAllByRole('button').map(b => b.textContent)
        expect(names.indexOf('Add Workout')).toBe(names.indexOf('Ride Again') + 1)
        expect(screen.queryByText('Sweet Spot 3x12')).not.toBeInTheDocument()
    })

    test('canStart with a workout shows the chip and hides Add Workout', () => {
        render(<ActivityDetails {...base} canStart attachedWorkout={attachedWorkout} />)
        expect(screen.getByText('Sweet Spot 3x12')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Add Workout' })).not.toBeInTheDocument()
    })

    test('without a route (!canStart) there is neither chip nor Add Workout', () => {
        render(<ActivityDetails {...base} canStart={false} attachedWorkout={attachedWorkout} />)
        expect(screen.queryByText('Sweet Spot 3x12')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Add Workout' })).not.toBeInTheDocument()
    })

    test('the loading variant has no workout controls', () => {
        render(<ActivityDetails {...base} loading canStart attachedWorkout={attachedWorkout} />)
        expect(screen.queryByText('Sweet Spot 3x12')).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Add Workout' })).not.toBeInTheDocument()
    })

    test('Add Workout and the chip clear button call their handlers', async () => {
        const onAddWorkout = vi.fn()
        const onClearWorkout = vi.fn()
        const { rerender } = render(<ActivityDetails {...base} canStart onAddWorkout={onAddWorkout} />)
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Add Workout' })) })
        expect(onAddWorkout).toHaveBeenCalledTimes(1)

        rerender(<ActivityDetails {...base} canStart attachedWorkout={attachedWorkout} onClearWorkout={onClearWorkout} />)
        fireEvent.click(screen.getByRole('button', { name: 'Clear workout' }))
        expect(onClearWorkout).toHaveBeenCalledTimes(1)
    })
})

describe('ActivityDetailsDialog - workout attachment', () => {
    const detailsState = { title: 'Ride', activity: {}, units: {}, exports: [], showMap: false, canStart: true, canOpen: true }

    beforeEach(() => {
        vi.clearAllMocks()
        mockList.getSelected = vi.fn(() => ({ id: 'a1', isComplete: () => true }))
        mockList.openSelected = vi.fn(() => detailsState)
        mockList.getObserver = vi.fn(() => ({ on: vi.fn() }))
        mockList.closeSelected = vi.fn()
        mockPageService.getActivityDetailsProps.mockReturnValue({ activityId: 'a1', attachedWorkout: null })
    })

    const renderDialog = async (props = {}) => {
        await act(async () => { render(<ActivityDetailsDialog {...props} />) })
    }

    test('Add Workout opens the route card, attaches, closes and navigates', async () => {
        const card = { addWorkout: vi.fn() }
        mockList.openRoute = vi.fn(() => card)
        const onAddWorkout = vi.fn()
        await renderDialog({ onAddWorkout })

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Add Workout' })) })

        expect(card.addWorkout).toHaveBeenCalledTimes(1)
        expect(mockList.closeSelected).toHaveBeenCalledTimes(1)
        expect(onAddWorkout).toHaveBeenCalledTimes(1)
    })

    test('a missing route card logs an error and does not navigate', async () => {
        mockList.openRoute = vi.fn(() => null)
        const onAddWorkout = vi.fn()
        await renderDialog({ onAddWorkout })

        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Add Workout' })) })

        expect(onAddWorkout).not.toHaveBeenCalled()
        expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({ message: 'error', fn: 'onAddWorkout' }))
    })

    test('clearing calls the page service, re-reads and swaps the chip for Add Workout', async () => {
        mockPageService.getActivityDetailsProps.mockReturnValue({ activityId: 'a1', attachedWorkout: { id: 'w1', title: 'Sweet Spot 3x12' } })
        await renderDialog()
        expect(screen.getByText('Sweet Spot 3x12')).toBeInTheDocument()

        mockPageService.getActivityDetailsProps.mockReturnValue({ activityId: 'a1', attachedWorkout: null })
        await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Clear workout' })) })

        expect(mockPageService.onClearWorkoutSelection).toHaveBeenCalledTimes(1)
        expect(mockPageService.getActivityDetailsProps).toHaveBeenCalledWith('a1')
        expect(screen.queryByText('Sweet Spot 3x12')).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Add Workout' })).toBeInTheDocument()
        expect(mockLogError).toHaveBeenCalledWith(expect.objectContaining({ message: 'attachment changed', surface: 'activity-details', action: 'clear' }))
    })
})
