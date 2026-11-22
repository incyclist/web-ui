import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { return { logEvent: vi.fn() } }),
}))
vi.mock('../../../../molecules', async (importOriginal) => ({
    ...(await importOriginal()),
    WorkoutGraph: () => <div data-testid='workout-graph' />,
}))

import { ScheduledWorkoutSummary } from './summary'

const base = { visible: true, title: 'Sweet Spot', duration: '60min', date: new Date('2025-09-04'), workout: {} }

describe('ScheduledWorkoutSummary', () => {

    test('always shows OK and never Unselect or Delete', () => {
        render(<ScheduledWorkoutSummary {...base} selected canDelete onDelete={vi.fn()} />)

        expect(screen.getByRole('button', { name: 'OK' })).not.toBeNull()
        expect(screen.queryByText('Unselect')).toBeNull()
        expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull()
    })

    test('not today: shows the date', () => {
        render(<ScheduledWorkoutSummary {...base} isToday={false} />)

        expect(screen.getByText(base.date.toLocaleDateString())).not.toBeNull()
        expect(screen.queryByText('Today')).toBeNull()
    })

    test('today: shows Today instead of the date', () => {
        render(<ScheduledWorkoutSummary {...base} isToday />)

        expect(screen.getByText('Today')).not.toBeNull()
        expect(screen.queryByText(base.date.toLocaleDateString())).toBeNull()
    })

    test('renders in list mode with category and ignores visible=false', () => {
        const onOK = vi.fn()
        render(<ScheduledWorkoutSummary {...base} visible={false} layout='list' category='Scheduled Workouts' isToday onOK={onOK} />)

        expect(screen.getByText('Sweet Spot')).toBeInTheDocument()
        expect(screen.getByText('Scheduled Workouts')).toBeInTheDocument()
        expect(screen.getByText('Today')).toBeInTheDocument()

        const card = screen.getByRole('article', { name: 'Scheduled workout Sweet Spot' })
        fireEvent.keyDown(card, { key: 'Enter' })
        fireEvent.click(card)
        expect(onOK).toHaveBeenCalledTimes(2)
    })
})
