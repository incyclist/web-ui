import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { WorkoutsScreen } from './screen'

vi.mock('../../components/molecules/MainPage', () => ({ default: ({ children }) => <div>{children}</div> }))
vi.mock('../../components/molecules/NavigationBar', () => ({ NavigationBar: () => null }))
vi.mock('../../hooks/ui/useKey', () => ({ useKey: () => {} }))
vi.mock('../../hooks/ui/useMouseSwipe', () => ({ useMouseSwipe: () => {} }))
vi.mock('../../components/atoms/Carousel', () => ({ Carousel: () => <div data-testid='carousel' /> }))

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
})
