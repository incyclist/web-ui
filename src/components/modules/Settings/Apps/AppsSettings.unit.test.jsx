import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { AppsSettingsView } from './AppsSettings'

const apps = [
    { name: 'Strava', key: 'strava', isConnected: true },
    { name: 'Komoot', key: 'komoot', isConnected: false },
    { name: 'Intervals.icu', key: 'intervals', isConnected: false },
]

const renderApp = (app) => <div>settings of {app.key}</div>

describe('AppsSettingsView', () => {

    test('lists all apps with their connection status', () => {
        render(<AppsSettingsView apps={apps} renderApp={renderApp} />)

        expect(screen.getByText('Strava')).toBeDefined()
        expect(screen.getByText('Komoot')).toBeDefined()
        expect(screen.getByText('Intervals.icu')).toBeDefined()
        expect(screen.getAllByLabelText('Connected')).toHaveLength(1)
        expect(screen.getAllByLabelText('Not connected')).toHaveLength(2)
    })

    test('shows the settings of the expanded app only', () => {
        render(<AppsSettingsView apps={apps} expandedKey='komoot' renderApp={renderApp} />)

        expect(screen.getByText('settings of komoot')).toBeDefined()
        expect(screen.queryByText('settings of strava')).toBeNull()
        expect(screen.queryByText('settings of intervals')).toBeNull()
    })

    test('shows no settings if nothing is expanded', () => {
        render(<AppsSettingsView apps={apps} renderApp={renderApp} />)

        expect(screen.queryByText(/settings of/)).toBeNull()
    })

    test('reports the key of the clicked app', () => {
        const onToggle = vi.fn()
        render(<AppsSettingsView apps={apps} onToggle={onToggle} renderApp={renderApp} />)

        fireEvent.click(screen.getByText('Intervals.icu'))

        expect(onToggle).toHaveBeenCalledWith('intervals')
    })

    test('shows a hint if there are no apps', () => {
        render(<AppsSettingsView apps={[]} renderApp={renderApp} />)

        expect(screen.getByText('No Apps available')).toBeDefined()
    })

    test('handles missing apps', () => {
        render(<AppsSettingsView renderApp={renderApp} />)

        expect(screen.getByText('No Apps available')).toBeDefined()
    })
})
