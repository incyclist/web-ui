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

    // keyboard handling (Enter, Space) is provided by the browser for a native button
    test('the header is a native button', () => {
        render(<AppsItem name='Strava' />)

        const header = screen.getByRole('button')
        expect(header.tagName).toBe('BUTTON')
        expect(header.getAttribute('type')).toBe('button')
    })

    test('the expanded settings are a region that is labelled by and controlled from the header', () => {
        render(<AppsItem name='Strava' expanded={true}><div>settings</div></AppsItem>)

        const header = screen.getByRole('button')
        const region = screen.getByRole('region')

        expect(region.getAttribute('id')).toBe(header.getAttribute('aria-controls'))
        expect(region.getAttribute('aria-labelledby')).toBe(header.getAttribute('id'))
        expect(region.textContent).toContain('settings')
    })

    test('collapsed: there is no region and nothing is controlled', () => {
        render(<AppsItem name='Strava' />)

        expect(screen.queryByRole('region')).toBeNull()
        expect(screen.getByRole('button').hasAttribute('aria-controls')).toBe(false)
    })

    test('every entry has its own ids', () => {
        render(<><AppsItem name='A' expanded={true} /><AppsItem name='B' expanded={true} /></>)

        const [a, b] = screen.getAllByRole('button')
        expect(a.getAttribute('id')).not.toBe(b.getAttribute('id'))
        expect(a.getAttribute('aria-controls')).not.toBe(b.getAttribute('aria-controls'))
    })

    test('the name of the button contains the name of the app', () => {
        render(<AppsItem name='Strava' isConnected={true} />)

        expect(screen.getByRole('button', { name: /Strava/ })).toBeDefined()
    })

    test('does not fail without onClick', () => {
        render(<AppsItem name='Strava' />)

        expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
    })
})
