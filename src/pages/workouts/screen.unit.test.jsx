import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { WorkoutsScreen } from './screen'

vi.mock('../../components/molecules/MainPage', () => ({ default: ({ children }) => <div>{children}</div> }))
vi.mock('../../components/molecules/NavigationBar', () => ({ NavigationBar: () => null }))
vi.mock('../../hooks/ui/useKey', () => ({ useKey: () => {} }))

// Dropzone relies on native drag/drop internals that jsdom lacks - stubbed so a test can hand over a drop
vi.mock('../../components/molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        WorkoutGraph: () => <div data-testid='workout-graph' />,
        Dropzone: (props) => (
            <div className={props.className}
                onDrop={() => props.onDrop?.([{ type: 'url', url: 'file:///w/a.zwo' }])}>{props.text}</div>
        ),
    }
})

const workoutCard = (id, title, extra = {}) => ({
    id,
    cardType: 'Workout',
    props: { title, duration: '45min', workout: { name: title }, visible: false, canDelete: true, ...extra }
})

const scheduledCard = (id, title, extra = {}) => ({
    id,
    cardType: 'ScheduledWorkout',
    props: { title, duration: '30min', date: new Date(), isToday: true, workout: { name: title }, visible: false, ...extra }
})

const list = (id, title, observer, cards = [workoutCard(`${id}-w1`, `${title} Workout`)]) => ({ id, title, observer, cards })
const renderScreen = (props) => render(<WorkoutsScreen loading={false} {...props} />)

const titles = (container) => [...container.querySelectorAll('[class*="list_"]')].map(e => e.className.split(' ').find(c => c.startsWith('list_')))

describe('WorkoutsScreen', () => {
    afterEach(() => {
        vi.unstubAllGlobals()
    })

    test('renders upcoming before the regular lists', () => {
        const { container } = renderScreen({
            upcoming: list('scheduled', 'Scheduled Workouts', null, [scheduledCard('s1', 'Today Ride')]),
            lists: [list('myWorkouts', 'My Workouts')]
        })
        expect(titles(container)).toEqual(['list_scheduled', 'list_myWorkouts'])
        expect(container.textContent).toContain('Scheduled Workouts')
    })

    test('renders no upcoming section when null', () => {
        const { container } = renderScreen({ upcoming: null, lists: [list('myWorkouts', 'My Workouts')] })
        expect(titles(container)).toEqual(['list_myWorkouts'])
    })

    test('unsubscribes the upcoming observer when it goes away', () => {
        const observer = { on: vi.fn(), off: vi.fn() }
        const lists = [list('myWorkouts', 'My Workouts')]
        const { rerender } = renderScreen({ upcoming: list('scheduled', 'S', observer, [scheduledCard('s1', 'Today')]), lists })
        expect(observer.on).toHaveBeenCalledTimes(1)

        rerender(<WorkoutsScreen loading={false} upcoming={null} lists={lists} />)
        expect(observer.off).toHaveBeenCalledTimes(1)
        expect(observer.off.mock.calls[0][1]).toBe(observer.on.mock.calls[0][1])

        rerender(<WorkoutsScreen loading={false} upcoming={list('scheduled', 'S', observer, [scheduledCard('s1', 'Today')])} lists={lists} />)
        expect(observer.on).toHaveBeenCalledTimes(2)
    })

    test('renders the Create Workout and Import Workout header buttons and reports clicks', () => {
        const onCreateWorkout = vi.fn(), onImportWorkout = vi.fn()
        renderScreen({ lists: [], onCreateWorkout, onImportWorkout })
        fireEvent.click(screen.getByText('Create Workout'))
        fireEvent.click(screen.getByText('Import Workout'))
        expect(onCreateWorkout).toHaveBeenCalledTimes(1)
        expect(onImportWorkout).toHaveBeenCalledTimes(1)
    })

    test('dragging a file over the page shows the drop overlay', () => {
        const { container } = renderScreen({ lists: [], dropEnabled: true })
        expect(screen.queryByText('Drop a workout file (ZWO or JSON)')).toBeNull()
        fireEvent.dragEnter(container.querySelector('.workouts-page'))
        expect(screen.getByText('Drop a workout file (ZWO or JSON)')).toBeTruthy()
    })

    test('the overlay is not shown when drops are disabled', () => {
        const { container } = renderScreen({ lists: [], dropEnabled: false })
        fireEvent.dragEnter(container.querySelector('.workouts-page'))
        expect(screen.queryByText('Drop a workout file (ZWO or JSON)')).toBeNull()
    })

    test('dropping on the overlay reports the files', () => {
        const onDropFiles = vi.fn()
        const { container } = renderScreen({ lists: [], dropEnabled: true, onDropFiles })
        fireEvent.dragEnter(container.querySelector('.workouts-page'))
        fireEvent.drop(container.querySelector('.workout-drop-overlay'))
        expect(onDropFiles).toHaveBeenCalledWith([{ type: 'url', url: 'file:///w/a.zwo' }])
    })

    test('no Import or Create card is rendered in the grid and empty state is shown if no workouts exist', () => {
        const l = {
            id: 'myWorkouts',
            title: 'My Workouts',
            cards: [
                { id: 'Import', cardType: 'WorkoutImport', props: { title: 'Import Workout', visible: true } },
                { id: 'Create', cardType: 'WorkoutCreate', props: { title: 'Create Workout', visible: true } },
            ]
        }
        const { container } = renderScreen({ lists: [l] })
        expect(container.querySelectorAll('.item').length).toBe(0)
        expect(container.querySelector('.list_myWorkouts')).toBeNull()
        expect(screen.getByText('No workouts yet')).toBeInTheDocument()
    })

    test('renders cards in a wrapping tile grid by default even when visible is false', () => {
        const { container } = renderScreen({
            lists: [list('myWorkouts', 'My Workouts', null, [
                workoutCard('w1', 'Sweet Spot'),
            ])]
        })
        expect(container.querySelector('.workout-tiles')).not.toBeNull()
        expect(container.querySelector('.workout-rows')).toBeNull()
        expect(screen.getByText('Sweet Spot')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'View details for Sweet Spot' })).toHaveTextContent('View details')
    })

    test('renders list rows when displayType is list and forwards display toggle clicks', () => {
        const onDisplayTypeSelected = vi.fn()
        const { container } = renderScreen({
            displayType: 'list',
            onDisplayTypeSelected,
            upcoming: list('scheduled', 'Scheduled Workouts', null, [scheduledCard('s1', 'Today Ride')]),
            lists: [list('myWorkouts', 'My Workouts', null, [workoutCard('w1', 'Sweet Spot')])]
        })
        expect(container.querySelector('.workout-rows')).not.toBeNull()
        expect(container.querySelector('.workout-tiles')).toBeNull()
        expect(screen.getByText('Today')).toBeInTheDocument()
        expect(screen.getByText('Sweet Spot')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'View details for Sweet Spot' })).toHaveTextContent('Details')

        fireEvent.click(container.querySelector('#tiles'))
        expect(onDisplayTypeSelected).toHaveBeenCalledWith('tiles')
        fireEvent.click(container.querySelector('#list'))
        expect(onDisplayTypeSelected).toHaveBeenCalledWith('list')
    })

    test('invokes onOK and onDelete independently on workout items', () => {
        const onOK = vi.fn(), onDelete = vi.fn()
        renderScreen({
            lists: [list('myWorkouts', 'My Workouts', null, [workoutCard('w1', 'Sweet Spot')])],
            onOK,
            onDelete
        })
        fireEvent.click(screen.getByRole('button', { name: 'View details for Sweet Spot' }))
        expect(onOK).toHaveBeenCalledWith('w1')
        fireEvent.click(screen.getByRole('button', { name: 'Delete Sweet Spot' }))
        expect(onDelete).toHaveBeenCalledWith('w1')
        expect(onOK).toHaveBeenCalledTimes(1)
    })

    test('renders loading and empty states appropriately', () => {
        const { container, rerender } = renderScreen({ loading: true, lists: [] })
        expect(container.querySelector('.empty-workouts')).toBeNull()

        rerender(<WorkoutsScreen loading={false} lists={[]} upcoming={null} />)
        expect(screen.getByText('No workouts yet')).toBeInTheDocument()
    })

    test('windows large lists via IntersectionObserver so only in-fold cards mount WorkoutGraph', () => {
        let callback
        const observed = new Set()
        class MockIntersectionObserver {
            constructor(cb) { callback = cb }
            observe(el) { observed.add(el) }
            unobserve(el) { observed.delete(el) }
            disconnect() { observed.clear() }
        }
        vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

        const manyCards = Array.from({ length: 200 }, (_, i) => workoutCard(`w${i}`, `Workout ${i}`))
        renderScreen({ lists: [list('large', 'Large Library', null, manyCards)] })

        // Before intersection fires, all 200 items stay as cheap skeletons (0 graphs mounted)
        expect(screen.getAllByTestId('workout-card-skeleton')).toHaveLength(200)
        expect(screen.queryAllByTestId('workout-graph')).toHaveLength(0)

        const targets = [...observed]
        expect(targets).toHaveLength(200)

        // First 6 cards enter the fold
        act(() => {
            callback(targets.slice(0, 6).map(target => ({ target, isIntersecting: true })))
        })
        expect(screen.getAllByTestId('workout-graph')).toHaveLength(6)
        expect(screen.getAllByTestId('workout-card-skeleton')).toHaveLength(194)

        // First 3 cards scroll out of the fold -> revert to skeletons
        act(() => {
            callback(targets.slice(0, 3).map(target => ({ target, isIntersecting: false })))
        })
        expect(screen.getAllByTestId('workout-graph')).toHaveLength(3)
        expect(screen.getAllByTestId('workout-card-skeleton')).toHaveLength(197)
    })
})
