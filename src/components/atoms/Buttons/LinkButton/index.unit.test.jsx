import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { logEvent, openExternal, hasFeature } = vi.hoisted(() => ({
    logEvent: vi.fn(),
    openExternal: vi.fn(),
    hasFeature: vi.fn(),
}))

vi.mock('gd-eventlog', () => ({ EventLogger: vi.fn(function () { return { logEvent } }) }))
vi.mock('../../../../utils/electron/integration', () => ({
    hasFeature,
    api: { shell: { openExternal } },
}))

import { LinkButton } from './index'

describe('LinkButton', () => {

    beforeEach(() => {
        hasFeature.mockReturnValue(true)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('renders a button with the label', () => {
        render(<LinkButton label='How to get Street View' />)

        expect(screen.getByRole('button', { name: 'How to get Street View' })).not.toBeNull()
    })

    test('logs the standard click event exactly once and calls onClick', () => {
        const onClick = vi.fn()
        render(<LinkButton label='Change this' onClick={onClick} logContext={{ dialog: 'Street View in simulated rides' }} />)

        fireEvent.click(screen.getByRole('button'))

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledWith({
            message: 'button clicked', button: 'Change this', dialog: 'Street View in simulated rides', eventSource: 'user'
        })
    })

    test('does not log or call onClick when disabled', () => {
        const onClick = vi.fn()
        render(<LinkButton label='Change this' disabled onClick={onClick} />)

        fireEvent.click(screen.getByRole('button'))

        expect(onClick).not.toHaveBeenCalled()
        expect(logEvent).not.toHaveBeenCalled()
    })

    test('is a real button of type button that can be reached with the keyboard', () => {
        render(<LinkButton label='Change this' />)

        const button = screen.getByRole('button')
        expect(button.tagName).toBe('BUTTON')
        expect(button.getAttribute('type')).toBe('button')
        expect(button.tabIndex).not.toBe(-1)
    })

    test('external: marks the label and describes that it opens in the browser', () => {
        render(<LinkButton label='How to create a key' external />)

        const button = screen.getByRole('button')
        expect(button.textContent).toContain('↗')
        expect(screen.getByText('Opens in your browser').id).toBe(button.getAttribute('aria-describedby'))
    })

    test('with a url: opens it through the desktop shell and logs only the button click', () => {
        render(<LinkButton label='How to create a key' external url='https://incyclist.com/maps-api-key/' />)

        fireEvent.click(screen.getByRole('button'))

        expect(openExternal).toHaveBeenCalledWith('https://incyclist.com/maps-api-key/')
        expect(logEvent).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'button clicked' }))
    })

    test('with a url in a plain browser: falls back to window.open', () => {
        hasFeature.mockReturnValue(false)
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        render(<LinkButton label='How to create a key' external url='https://incyclist.com/maps-api-key/' />)

        fireEvent.click(screen.getByRole('button'))

        expect(openExternal).not.toHaveBeenCalled()
        expect(open).toHaveBeenCalledWith('https://incyclist.com/maps-api-key/', '_blank', 'noopener,noreferrer')
        open.mockRestore()
    })
})
