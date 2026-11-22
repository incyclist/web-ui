import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { WorkoutsPage } from './page'

const { service, screenCalls } = vi.hoisted(() => ({
    service: {
        openPage: vi.fn(() => ({ on: vi.fn(), off: vi.fn() })),
        closePage: vi.fn(),
        getPageDisplayProperties: vi.fn(),
        onDisplayTypeSelected: vi.fn(),
        onOpenDetails: vi.fn(),
        onCardOK: vi.fn(),
        onDelete: vi.fn(),
        onImportOpen: vi.fn(),
        onImportFiles: vi.fn(),
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

vi.mock('../../components/modules/workout/WorkoutImport', () => ({
    WorkoutImportDialog: ({ source, onClose }) => <div>import-dialog:{source}<button onClick={onClose}>close-import</button></div>,
}))

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

    test('card actions and display type changes are forwarded to the service', () => {
        renderPage()
        const p = screenCalls.at(-1)
        act(() => { p.onOK('w1') })
        act(() => { p.onDisplayTypeSelected('list') })
        expect(service.onCardOK).toHaveBeenCalledWith('w1')
        expect(service.onDisplayTypeSelected).toHaveBeenCalledWith('list')
        expect(screenCalls.at(-1).onRetry).toBeUndefined()
    })

    test('delete asks for confirmation via MessageBox; No cancels, Yes deletes', () => {
        renderPage()
        expect(screen.queryByText('This will permanently delete this workout. Are you sure?')).toBeNull()

        act(() => { screenCalls.at(-1).onDelete('w1') })
        expect(service.onDelete).not.toHaveBeenCalled()
        expect(screen.getByText('This will permanently delete this workout. Are you sure?')).toBeTruthy()
        expect(screenCalls.at(-1).dropEnabled).toBe(false)

        fireEvent.click(screen.getByText('No'))
        expect(service.onDelete).not.toHaveBeenCalled()
        expect(screen.queryByText('This will permanently delete this workout. Are you sure?')).toBeNull()
        expect(screenCalls.at(-1).dropEnabled).toBe(true)

        act(() => { screenCalls.at(-1).onDelete('w1') })
        fireEvent.click(screen.getByText('Yes'))
        expect(service.onDelete).toHaveBeenCalledTimes(1)
        expect(service.onDelete).toHaveBeenCalledWith('w1')
        expect(screen.queryByText('This will permanently delete this workout. Are you sure?')).toBeNull()
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

    test('import button opens the import flow and mounts the dialog', () => {
        renderPage()
        expect(screen.queryByText(/import-dialog/)).toBeNull()
        act(() => { screenCalls.at(-1).onImportWorkout() })
        expect(service.onImportOpen).toHaveBeenCalledTimes(1)
        expect(screen.getByText('import-dialog:button')).toBeTruthy()
        expect(screenCalls.at(-1).dropEnabled).toBe(false)
    })

    test('a page drop hands the files to the service before the dialog mounts', () => {
        renderPage()
        expect(screenCalls.at(-1).dropEnabled).toBe(true)
        service.onImportFiles.mockImplementation(() => {
            expect(screen.queryByText(/import-dialog/)).toBeNull()
        })
        const files = [{ type: 'url', url: 'file:///a.zwo' }]
        act(() => { screenCalls.at(-1).onDropFiles(files) })
        expect(service.onImportFiles).toHaveBeenCalledWith(files, 'page-drop')
        expect(screen.getByText('import-dialog:page-drop')).toBeTruthy()
    })

    test('closing the dialog unmounts it and re-enables the drop overlay', () => {
        renderPage()
        act(() => { screenCalls.at(-1).onImportWorkout() })
        fireEvent.click(screen.getByText('close-import'))
        expect(screen.queryByText(/import-dialog/)).toBeNull()
        expect(screenCalls.at(-1).dropEnabled).toBe(true)
    })

    test('create-info step 4 points at the Import Workout button', () => {
        service.getPageDisplayProperties.mockReturnValue(props({ createInfo: { markAsSeenDefault: true } }))
        renderPage()
        expect(screen.getByText(/Import Workout button/)).toBeTruthy()
    })
})
