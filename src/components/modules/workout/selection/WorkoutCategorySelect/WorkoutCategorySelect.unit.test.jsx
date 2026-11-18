import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkoutCategorySelect } from './WorkoutCategorySelect'

describe('WorkoutCategorySelect', () => {

    test('shows the label and the current value', () => {
        render(<WorkoutCategorySelect value='Intervals' groups={['My Workouts', 'Intervals']} onChange={vi.fn()} />)
        expect(screen.getByText('Category')).toBeTruthy()
        expect(screen.getByText('Intervals')).toBeTruthy()
    })

    test('selecting an existing group calls onChange', () => {
        const onChange = vi.fn()
        render(<WorkoutCategorySelect value='My Workouts' groups={['My Workouts', 'Intervals']} onChange={onChange} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Intervals' } })
        expect(onChange).toHaveBeenCalledWith('Intervals')
    })

    test('a current value missing from groups is offered as an option', () => {
        render(<WorkoutCategorySelect value='Custom' groups={['My Workouts']} onChange={vi.fn()} />)
        expect(screen.getByText('Custom')).toBeTruthy()
        expect(screen.getByText('My Workouts')).toBeTruthy()
        expect(screen.getByText('Add new Category')).toBeTruthy()
    })

    test('Add new Category switches to a text field without calling onChange', () => {
        const onChange = vi.fn()
        render(<WorkoutCategorySelect value='My Workouts' groups={['My Workouts']} onChange={onChange} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Add new Category' } })
        expect(screen.getByRole('textbox')).toBeTruthy()
        expect(onChange).not.toHaveBeenCalled()
    })

    test('committing the new name calls onChange and returns to the select', () => {
        const onChange = vi.fn()
        render(<WorkoutCategorySelect value='My Workouts' groups={['My Workouts']} onChange={onChange} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Add new Category' } })
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'Climbing' } })
        fireEvent.blur(input)
        expect(onChange).toHaveBeenCalledWith('Climbing')
        expect(screen.getByRole('combobox')).toBeTruthy()
    })

    test('committing an empty name does not call onChange', () => {
        const onChange = vi.fn()
        render(<WorkoutCategorySelect value='My Workouts' groups={['My Workouts']} onChange={onChange} />)
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Add new Category' } })
        fireEvent.blur(screen.getByRole('textbox'))
        expect(onChange).not.toHaveBeenCalled()
    })
})
