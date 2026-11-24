import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Observer } from 'incyclist-services'
import { Card } from './Card'

const DummySummary = ({ title, duration, isToday }) => (
    <div>
        <span data-testid='title'>{title}</span>
        <span data-testid='duration'>{duration}</span>
        <span data-testid='today'>{isToday ? 'yes' : 'no'}</span>
    </div>
)

describe('Workout selection base Card', () => {

    test('preserves observer updates across parent re-renders with unchanged props', () => {
        const observer = new Observer()
        const initialProps = { title: 'Sweet Spot', duration: '30min', isToday: false, observer, Summary: DummySummary }

        const { rerender } = render(<Card {...initialProps} />)
        expect(screen.getByTestId('duration')).toHaveTextContent('30min')

        act(() => {
            observer.emit('update', { duration: '45min' })
        })
        expect(screen.getByTestId('duration')).toHaveTextContent('45min')

        // Parent re-renders with a fresh props object containing the same older values
        rerender(<Card {...{ ...initialProps }} />)
        expect(screen.getByTestId('duration')).toHaveTextContent('45min')
    })

    test('applies genuinely changed incoming props while keeping untouched observer updates', () => {
        const observer = new Observer()
        const { rerender } = render(
            <Card title='Sweet Spot' duration='30min' isToday={false} observer={observer} Summary={DummySummary} />
        )

        act(() => {
            observer.emit('update', { duration: '50min' })
        })
        expect(screen.getByTestId('duration')).toHaveTextContent('50min')

        rerender(
            <Card title='Sweet Spot' duration='30min' isToday={true} observer={observer} Summary={DummySummary} />
        )
        expect(screen.getByTestId('today')).toHaveTextContent('yes')
        expect(screen.getByTestId('duration')).toHaveTextContent('50min')
    })

    test('unsubscribes from observer on unmount', () => {
        const observer = { on: vi.fn(), off: vi.fn() }
        const { unmount } = render(<Card title='Sweet Spot' observer={observer} Summary={DummySummary} />)
        expect(observer.on).toHaveBeenCalledWith('update', expect.any(Function))

        unmount()
        expect(observer.off).toHaveBeenCalledWith('update', observer.on.mock.calls[0][1])
    })
})
