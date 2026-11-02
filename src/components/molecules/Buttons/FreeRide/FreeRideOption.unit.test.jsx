import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FreeRideOptionButton } from './FreeRideOption'

const option = (props = {}) => ({
    id: 'a', color: 'red', direction: -90, maneuver: 'left', maneuverText: 'Left', roadLabel: 'Via del Mar',
    selected: false, degraded: false, ...props
})

describe('FreeRideOptionButton', () => {

    test('shows turn word, road label and number key', () => {
        render(<FreeRideOptionButton pathInfo={option()} hotkey='2' count={3} />)

        expect(screen.getByText('Left')).toBeTruthy()
        expect(screen.getByText('Via del Mar')).toBeTruthy()
        expect(screen.getByText('2')).toBeTruthy()
        expect(screen.getByRole('radio').getAttribute('aria-label')).toBe('Road 2 of 3: Left: Via del Mar. Press 2.')
    })

    test('automatic selection is marked AUTO', () => {
        render(<FreeRideOptionButton pathInfo={option({ selected: true, selectedBy: 'auto' })} hotkey='1' />)

        expect(screen.getByText('AUTO')).toBeTruthy()
        expect(screen.getByRole('radio').getAttribute('aria-checked')).toBe('true')
    })

    test('the rider\'s choice is marked NEXT', () => {
        render(<FreeRideOptionButton pathInfo={option({ selected: true, selectedBy: 'user' })} hotkey='1' />)

        expect(screen.getByText('✓ NEXT')).toBeTruthy()
        expect(screen.queryByText('AUTO')).toBeNull()
    })

    test('an option without a valid direction is a labelled placeholder, never an empty arrow', () => {
        const { container } = render(<FreeRideOptionButton pathInfo={option({ direction: undefined, maneuver: 'unknown', maneuverText: 'Road 2', degraded: true })} hotkey='2' />)

        expect(container.querySelector('[data-glyph="degraded"]')).toBeTruthy()
        expect(container.querySelector('[data-glyph="arrow"]')).toBeNull()
        expect(container.querySelector('polyline[points*="NaN"], polygon[transform*="NaN"]')).toBeNull()
        expect(screen.getByText('Road 2')).toBeTruthy()
    })

    test('a non-numeric direction is treated as degraded even if the service did not flag it', () => {
        const { container } = render(<FreeRideOptionButton pathInfo={option({ direction: NaN, maneuver: undefined })} hotkey='1' />)
        expect(container.querySelector('[data-glyph="degraded"]')).toBeTruthy()
    })

    test('roundabout gets its own glyph', () => {
        const { container } = render(<FreeRideOptionButton pathInfo={option({ maneuver: 'roundabout', maneuverText: 'Roundabout' })} hotkey='1' />)
        expect(container.querySelector('[data-glyph="roundabout"]')).toBeTruthy()
    })

    test('clicking selects the option', () => {
        const onClick = vi.fn()
        render(<FreeRideOptionButton pathInfo={option()} hotkey='1' onClick={onClick} />)

        fireEvent.click(screen.getByRole('radio'))
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('a single way on has no key and cannot be selected', () => {
        const onClick = vi.fn()
        render(<FreeRideOptionButton single pathInfo={option({ selected: true, selectedBy: 'auto' })} hotkey='1' onClick={onClick} />)

        expect(screen.queryByText('1')).toBeNull()
        fireEvent.click(screen.getByRole('status'))
        expect(onClick).not.toHaveBeenCalled()
    })
})
