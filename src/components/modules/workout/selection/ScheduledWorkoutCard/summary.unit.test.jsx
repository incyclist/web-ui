import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { return { logEvent: vi.fn() } }),
}))
vi.mock('../../../../molecules', async (importOriginal) => ({
    ...(await importOriginal()),
    WorkoutGraph: () => null,
}))

import { ScheduledWorkoutSummary } from './summary'

const base = { visible: true, title: 'Sweet Spot', duration: '60min', date: new Date('2025-09-04'), workout: {} }

describe('ScheduledWorkoutSummary', () => {

    test('always shows OK and never Unselect', () => {
        render(<ScheduledWorkoutSummary {...base} selected />)

        expect(screen.getByRole('button', { name: 'OK' })).not.toBeNull()
        expect(screen.queryByText('Unselect')).toBeNull()
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
})
