import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { EditNumber } from './index'

describe('EditNumber whitespace input', () => {

    test('blurring with whitespace-only content does not fire onValueChange(undefined)', () => {
        const onValueChange = vi.fn()
        render(<EditNumber label='Start at' min={0} max={100} value={10} onValueChange={onValueChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: ' ' } })
        fireEvent.blur(input)

        expect(onValueChange).not.toHaveBeenCalled()
        expect(screen.getByText(/Value must be between 0 and 100/)).toBeDefined()
    })

    test('blurring with a valid number still fires onValueChange', () => {
        const onValueChange = vi.fn()
        render(<EditNumber label='Start at' min={0} max={100} value={10} onValueChange={onValueChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: '42' } })
        fireEvent.blur(input)

        expect(onValueChange).toHaveBeenCalledWith(42)
    })

    test('blurring with an empty string still surfaces the required-value error (pre-existing behavior)', () => {
        const onValueChange = vi.fn()
        render(<EditNumber label='Start at' min={0} max={100} value={10} onValueChange={onValueChange} />)

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: '' } })
        fireEvent.blur(input)

        expect(onValueChange).not.toHaveBeenCalled()
        expect(screen.getByText(/Value must be between 0 and 100/)).toBeDefined()
    })
})
