import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

const list = (id, title, observer, cards = []) => ({ id, title, observer, cards })
const renderScreen = (props) => render(<WorkoutsScreen loading={false} {...props} />)

const titles = (container) => [...container.querySelectorAll('[class*="list_"]')].map(e => e.className.split(' ').find(c => c.startsWith('list_')))

const workoutCard = (id, title, extra = {}) => ({
    id,
    cardType: 'Workout',
    props: { title, duration: '45min', workout: { name: title }, visible: false, canDelete: true, ...extra }
})

describe('WorkoutsScreen', () => {

    test('renders upcoming before the regular lists', () => {
        const { container } = renderScreen({ upcoming: list('scheduled', 'Scheduled Workouts'), lists: [list('myWorkouts', 'My Workouts')] })
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
        const { rerender } = renderScreen({ upcoming: list('scheduled', 'S', observer), lists })
        expect(observer.on).toHaveBeenCalledTimes(1)

        rerender(<WorkoutsScreen loading={false} upcoming={null} lists={lists} />)
        expect(observer.off).toHaveBeenCalledTimes(1)
        expect(observer.off.mock.calls[0][1]).toBe(observer.on.mock.calls[0][1])

        rerender(<WorkoutsScreen loading={false} upcoming={list('scheduled', 'S', observer)} lists={lists} />)
        expect(observer.on).toHaveBeenCalledTimes(2)
    })

    test('renders the Import Workout button and reports clicks', () => {
        const onImportWorkout = vi.fn()
        renderScreen({ lists: [], onImportWorkout })
        fireEvent.click(screen.getByText('Import Workout'))
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

    test('no Import card is rendered even if the service passes one', () => {
        const l = { id: 'myWorkouts', title: 'My Workouts', cards: [{ id: 'Import', cardType: 'WorkoutImport', props: { title: 'Import Workout', visible: true } }] }
        const { container } = renderScreen({ lists: [l] })
        expect(container.querySelectorAll('.item').length).toBe(0)
    })

    test('renders cards in a wrapping tile grid by default even when visible is false', () => {
        const { container } = renderScreen({
            lists: [list('myWorkouts', 'My Workouts', null, [
                { id: 'Create', cardType: 'WorkoutCreate', props: { title: 'Create Workout', visible: true } },
                workoutCard('w1', 'Sweet Spot'),
            ])]
        })
        expect(container.querySelector('.workout-tiles')).not.toBeNull()
        expect(container.querySelector('.workout-rows')).toBeNull()
        expect(screen.getByText('Create Workout')).toBeInTheDocument()
        expect(screen.getByText('Sweet Spot')).toBeInTheDocument()
    })

    test('renders list rows when displayType is list and forwards display toggle clicks', () => {
        const onDisplayTypeSelected = vi.fn()
        const { container } = renderScreen({
            displayType: 'list',
            onDisplayTypeSelected,
            upcoming: list('scheduled', 'Scheduled Workouts', null, [
                { id: 's1', cardType: 'ScheduledWorkout', props: { title: 'Today Ride', duration: '30min', date: new Date(), isToday: true, workout: { name: 'Today Ride' }, visible: false } }
            ]),
            lists: [list('myWorkouts', 'My Workouts', null, [workoutCard('w1', 'Sweet Spot')])]
        })
        expect(container.querySelector('.workout-rows')).not.toBeNull()
        expect(container.querySelector('.workout-tiles')).toBeNull()
        expect(screen.getByText('Today')).toBeInTheDocument()
        expect(screen.getByText('Sweet Spot')).toBeInTheDocument()

        fireEvent.click(container.querySelector('#tiles'))
        expect(onDisplayTypeSelected).toHaveBeenCalledWith('tiles')
        fireEvent.click(container.querySelector('#list'))
        expect(onDisplayTypeSelected).toHaveBeenCalledWith('list')
    })

    test('invokes onOK and onDelete independently on workout items', () => {
        const onOK = vi.fn(), onDelete = vi.fn()
        renderScreen({
            lists: [list('myWorkouts', 'My Workouts', null, [workoutCard('w1', 'Sweet Spot')])]
            , onOK, onDelete
        })
        fireEvent.click(screen.getByRole('button', { name: 'OK' }))
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
})
