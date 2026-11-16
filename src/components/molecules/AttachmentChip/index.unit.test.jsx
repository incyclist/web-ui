import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { logEvent } = vi.hoisted(() => ({ logEvent: vi.fn() }))

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { return { logEvent } }),
}))

import { AttachmentChip } from './index'

describe('AttachmentChip', () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('shows the label prefix and the name with a title tooltip', () => {
        render(<AttachmentChip label='Route' name='Alpe d Huez' onClear={vi.fn()} />)

        expect(screen.getByText('Route:')).not.toBeNull()
        expect(screen.getByText('Alpe d Huez').getAttribute('title')).toBe('Alpe d Huez')
    })

    test('default id is derived from the label, custom id wins', () => {
        const { container, rerender } = render(<AttachmentChip label='Workout' name='W' />)
        expect(container.querySelector('#attachment-workout')).not.toBeNull()

        rerender(<AttachmentChip label='Workout' name='W' id='my-chip' />)
        expect(container.querySelector('#my-chip')).not.toBeNull()
    })

    test('without onClear no clear button is rendered', () => {
        render(<AttachmentChip label='Route' name='R' />)

        expect(screen.queryByRole('button')).toBeNull()
    })

    test('clear button is a labelled real button; click calls onClear and logs once', () => {
        const onClear = vi.fn()
        render(<AttachmentChip label='Route' name='R1' onClear={onClear} />)

        const button = screen.getByRole('button', { name: 'Clear route' })
        expect(button.tagName).toBe('BUTTON')
        expect(button.tabIndex).not.toBe(-1)

        fireEvent.click(button)

        expect(onClear).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledWith({ message: 'button clicked', button: 'clear route', name: 'R1', eventSource: 'user' })
    })
})
