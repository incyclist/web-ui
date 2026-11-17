import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutsScreen } from './screen'

vi.mock('../../components/molecules/MainPage', () => ({ default: ({ children }) => <div>{children}</div> }))
vi.mock('../../components/molecules/NavigationBar', () => ({ NavigationBar: () => null }))
vi.mock('../../hooks/ui/useKey', () => ({ useKey: () => {} }))
vi.mock('../../hooks/ui/useMouseSwipe', () => ({ useMouseSwipe: () => {} }))
vi.mock('../../components/atoms/Carousel', () => ({ Carousel: () => <div data-testid='carousel' /> }))

// Dropzone relies on native drag/drop internals that jsdom lacks - stubbed so a test can hand over a drop
vi.mock('../../components/molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dropzone: (props) => (
            <div className={props.className}
                onDrop={() => props.onDrop?.([{ type: 'url', url: 'file:///w/a.zwo' }])}>{props.text}</div>
        ),
    }
})

const cardSize = { width: 200, height: 300, padding: 0 }
const list = (id, title, observer) => ({ id, title, observer, cards: [] })
const renderScreen = (props) => render(<WorkoutsScreen loading={false} cardSize={cardSize} {...props} />)

const titles = (container) => [...container.querySelectorAll('[class*="list_"]')].map(e => e.className.split(' ').find(c => c.startsWith('list_')))

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

        rerender(<WorkoutsScreen loading={false} cardSize={cardSize} upcoming={null} lists={lists} />)
        expect(observer.off).toHaveBeenCalledTimes(1)
        expect(observer.off.mock.calls[0][1]).toBe(observer.on.mock.calls[0][1])

        rerender(<WorkoutsScreen loading={false} cardSize={cardSize} upcoming={list('scheduled', 'S', observer)} lists={lists} />)
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
})
