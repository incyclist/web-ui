import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { AppsItem } from './AppsItem'

describe('AppsItem', () => {

    test('shows the name and a not-connected status by default', () => {
        render(<AppsItem name='Strava' />)

        expect(screen.getByText('Strava')).toBeDefined()
        expect(screen.getByLabelText('Not connected')).toBeDefined()
    })

    test('shows the connected status', () => {
        render(<AppsItem name='Strava' isConnected={true} />)

        expect(screen.getByLabelText('Connected')).toBeDefined()
    })

    test('renders the children only when expanded', () => {
        const { rerender } = render(<AppsItem name='Strava'><div>settings</div></AppsItem>)
        expect(screen.queryByText('settings')).toBeNull()

        rerender(<AppsItem name='Strava' expanded={true}><div>settings</div></AppsItem>)
        expect(screen.getByText('settings')).toBeDefined()
    })

    test('exposes the expanded state', () => {
        const { rerender } = render(<AppsItem name='Strava' />)
        expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')

        rerender(<AppsItem name='Strava' expanded={true} />)
        expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true')
    })

    test('calls onClick when the header is clicked', () => {
        const onClick = vi.fn()
        render(<AppsItem name='Strava' onClick={onClick} />)

        fireEvent.click(screen.getByRole('button'))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    test.each(['Enter', ' '])('calls onClick on keyboard key "%s"', (key) => {
        const onClick = vi.fn()
        render(<AppsItem name='Strava' onClick={onClick} />)

        fireEvent.keyDown(screen.getByRole('button'), { key })

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('ignores other keys', () => {
        const onClick = vi.fn()
        render(<AppsItem name='Strava' onClick={onClick} />)

        fireEvent.keyDown(screen.getByRole('button'), { key: 'a' })

        expect(onClick).not.toHaveBeenCalled()
    })

    test('does not fail without onClick', () => {
        render(<AppsItem name='Strava' />)

        expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
    })
})
