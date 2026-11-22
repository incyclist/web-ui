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

import { WorkoutSummary } from './summary'

const base = { visible: true, title: 'Threshold Builder', duration: '50min', workout: { name: 'Threshold Builder' } }

describe('WorkoutSummary', () => {

    test('renders tile view with title, duration, graph, OK and delete even when visible is false', () => {
        const onOK = vi.fn(), onDelete = vi.fn()
        render(<WorkoutSummary {...base} visible={false} canDelete onOK={onOK} onDelete={onDelete} />)

        expect(screen.getByRole('heading', { name: 'Threshold Builder' })).toBeInTheDocument()
        expect(screen.getByText('50min')).toBeInTheDocument()
        expect(screen.getByTestId('workout-graph')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'OK' }))
        expect(onOK).toHaveBeenCalledOnce()

        fireEvent.click(screen.getByRole('button', { name: 'Delete Threshold Builder' }))
        expect(onDelete).toHaveBeenCalledOnce()
        expect(onOK).toHaveBeenCalledOnce()
    })

    test('renders list view with category and handles keyboard activation', () => {
        const onOK = vi.fn()
        render(<WorkoutSummary {...base} layout='list' category='My Workouts' canDelete={false} onOK={onOK} />)

        expect(screen.getByText('My Workouts')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull()

        const card = screen.getByRole('article', { name: 'Workout Threshold Builder' })
        fireEvent.keyDown(card, { key: ' ' })
        expect(onOK).toHaveBeenCalledOnce()
    })

    test('disables OK when workout data is not yet loaded', () => {
        const onOK = vi.fn()
        render(<WorkoutSummary title='Loading Workout' workout={undefined} onOK={onOK} />)

        const okBtn = screen.getByRole('button', { name: 'OK' })
        expect(okBtn).toBeDisabled()
        fireEvent.click(screen.getByRole('article', { name: 'Workout Loading Workout' }))
        expect(onOK).not.toHaveBeenCalled()
    })
})
