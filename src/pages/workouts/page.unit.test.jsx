import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { WorkoutsPage } from './page'

const { service, screenCalls } = vi.hoisted(() => ({
    service: {
        openPage: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
        closePage: vi.fn(),
        getPageDisplayProperties: vi.fn(),
        getScreenProps: vi.fn(() => ({ cardSize: { width: 200, height: 300 } })),
        setScreenProps: vi.fn(),
        onResize: vi.fn(),
        onOpenDetails: vi.fn(),
        onCardOK: vi.fn(),
        onDelete: vi.fn(),
        onRetry: vi.fn(),
        onCarouselInitialized: vi.fn(),
        onCarouselUpdated: vi.fn(),
        onCreateInfoClosed: vi.fn(),
    },
    screenCalls: [],
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, getWorkoutListPageService: () => service }
})

vi.mock('./screen', () => ({
    WorkoutsScreen: (props) => {
        screenCalls.push(props)
        return <span>screen:{props.lists.map(l => l.id).join(',')}{props.loading ? ' loading' : ''}</span>
    },
}))

vi.mock('../../components/modules/workout/selection/WorkoutDetails', () => ({
    WorkoutDetailsDialog: ({ id }) => <div>details:{id}</div>,
}))

vi.mock('../../hooks', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useWindowDimensions: () => ({ width: 1000, height: 800 }) }
})

const props = (over = {}) => ({ loading: false, lists: [{ id: 'myWorkouts', title: 'My Workouts', cards: [] }], detailWorkoutId: null, createInfo: null, ...over })

const renderPage = (state) => render(
    <MemoryRouter initialEntries={[{ pathname: '/workouts', state }]}>
        <WorkoutsPage />
    </MemoryRouter>)

describe('WorkoutsPage', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        screenCalls.length = 0
        service.getPageDisplayProperties.mockReturnValue(props())
    })

    test('opens the page service and renders its lists through the screen', () => {
        renderPage()
        expect(service.openPage).toHaveBeenCalled()
        expect(screen.getByText('screen:myWorkouts')).toBeTruthy()
    })

    test('forwards upcoming and displayType to the screen', () => {
        const upcoming = { id: 'scheduled', title: 'Scheduled Workouts', cards: [] }
        service.getPageDisplayProperties.mockReturnValue(props({ upcoming, displayType: 'list' }))
        renderPage()
        const p = screenCalls.at(-1)
        expect(p.upcoming).toBe(upcoming)
        expect(p.displayType).toBe('list')
    })

    test('defaults upcoming to null and displayType to tiles', () => {
        renderPage()
        const p = screenCalls.at(-1)
        expect(p.upcoming).toBeNull()
        expect(p.displayType).toBe('tiles')
    })

    test('shows the loading state while the service is loading', () => {
        service.getPageDisplayProperties.mockReturnValue(props({ loading: true, lists: [] }))
        renderPage()
        expect(screen.getByText('screen: loading')).toBeTruthy()
    })

    test('closes the page service on unmount', () => {
        const { unmount } = renderPage()
        unmount()
        expect(service.closePage).toHaveBeenCalled()
    })

    test('card actions and carousel callbacks are forwarded by id', () => {
        renderPage()
        const p = screenCalls.at(-1)
        p.onOK('w1', ['f'])
        p.onDelete('w1')
        p.onRetry('imp')
        p.onInitialized('myWorkouts', { item: 1, itemsInSlide: 4 })
        p.onSlideChanged('myWorkouts', { item: 2, itemsInSlide: 4 })
        expect(service.onCardOK).toHaveBeenCalledWith('w1', ['f'])
        expect(service.onDelete).toHaveBeenCalledWith('w1')
        expect(service.onRetry).toHaveBeenCalledWith('imp')
        expect(service.onCarouselInitialized).toHaveBeenCalledWith('myWorkouts', 1, 4)
        expect(service.onCarouselUpdated).toHaveBeenCalledWith('myWorkouts', 2, 4)
    })

    test('renders the details dialog only when detailWorkoutId is set', () => {
        const { unmount } = renderPage()
        expect(screen.queryByText(/details:/)).toBeNull()
        unmount()

        service.getPageDisplayProperties.mockReturnValue(props({ detailWorkoutId: 'w1' }))
        renderPage()
        expect(screen.getByText('details:w1')).toBeTruthy()
    })

    test('opens the details of location.state.autoOpenDetailsId once', () => {
        const { rerender } = renderPage({ autoOpenDetailsId: 'w9' })
        expect(service.onOpenDetails).toHaveBeenCalledTimes(1)
        expect(service.onOpenDetails).toHaveBeenCalledWith('w9')

        rerender(<MemoryRouter initialEntries={[{ pathname: '/workouts', state: { autoOpenDetailsId: 'w9' } }]}><WorkoutsPage /></MemoryRouter>)
        expect(service.onOpenDetails).toHaveBeenCalledTimes(1)
    })

    test('does not open details when there is no autoOpenDetailsId', () => {
        renderPage()
        expect(service.onOpenDetails).not.toHaveBeenCalled()
    })

    test('create-info overlay: OK reports the "do not show again" default', () => {
        service.getPageDisplayProperties.mockReturnValue(props({ createInfo: { markAsSeenDefault: true } }))
        renderPage()
        expect(screen.getByText(/steps to create a workout/)).toBeTruthy()
        fireEvent.click(screen.getByText('OK'))
        expect(service.onCreateInfoClosed).toHaveBeenCalledWith(true)
    })

    test('create-info overlay: unchecking the checkbox reports markAsSeen=false', () => {
        service.getPageDisplayProperties.mockReturnValue(props({ createInfo: { markAsSeenDefault: true } }))
        renderPage()
        fireEvent.click(screen.getByRole('checkbox', { name: 'Do not show again' }))
        fireEvent.click(screen.getByText('OK'))
        expect(service.onCreateInfoClosed).toHaveBeenCalledWith(false)
    })

    test('no overlay without createInfo', () => {
        renderPage()
        expect(screen.queryByText(/steps to create a workout/)).toBeNull()
    })
})
