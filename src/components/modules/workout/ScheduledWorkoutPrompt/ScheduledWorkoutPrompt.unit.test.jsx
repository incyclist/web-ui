import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScheduledWorkoutPromptView } from './ScheduledWorkoutPromptView'

describe('ScheduledWorkoutPromptView', () => {

    afterEach(() => { vi.clearAllMocks(); delete window.activeDialog })

    const setup = () => {
        const handlers = { onYes: vi.fn(), onNo: vi.fn(), onCheckWorkouts: vi.fn() }
        render(<ScheduledWorkoutPromptView title='Sweet Spot' {...handlers} />)
        return handlers
    }

    test('shows the title and the three buttons in order', () => {
        setup()
        expect(screen.getByText('Sweet Spot')).toBeTruthy()
        const labels = screen.getAllByRole('button').map(b => b.textContent)
        expect(labels).toEqual(['Yes', 'Check workouts', 'No'])
    })

    test('buttons call their handlers', () => {
        const h = setup()
        fireEvent.click(screen.getByText('No'))
        fireEvent.click(screen.getByText('Check workouts'))
        fireEvent.click(screen.getByText('Yes'))
        expect(h.onNo).toHaveBeenCalledTimes(1)
        expect(h.onCheckWorkouts).toHaveBeenCalledTimes(1)
        expect(h.onYes).toHaveBeenCalledTimes(1)
    })

    test('Yes is focused', () => {
        setup()
        expect(document.activeElement).toBe(screen.getByText('Yes'))
    })

    test('ESC acts as No', () => {
        const h = setup()
        fireEvent.keyUp(window, { keyCode: 27, key: 'Escape' })
        expect(h.onNo).toHaveBeenCalledTimes(1)
        expect(h.onYes).not.toHaveBeenCalled()
    })

    test('clicking outside does not dismiss', () => {
        const h = setup()
        fireEvent.click(document.querySelector('.dialog').parentElement)
        expect(h.onNo).not.toHaveBeenCalled()
    })
})
