import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { AppSettingsView } from './AppSettingsView'

const operations = [
    { operation: 'ActivityUpload', enabled: true },
    { operation: 'RouteDownload', enabled: false },
]

describe('AppSettingsView', () => {

    describe('not connected', () => {
        test('offers a text connect button and no operations', () => {
            render(<AppSettingsView name='Komoot' isConnected={false} operations={operations} />)

            expect(screen.getByText('Connect with Komoot')).toBeDefined()
            expect(screen.queryByText('Disconnect')).toBeNull()
            expect(screen.queryByText('Activity Upload')).toBeNull()
        })

        test('calls onConnect', () => {
            const onConnect = vi.fn()
            render(<AppSettingsView name='Komoot' onConnect={onConnect} />)

            fireEvent.click(screen.getByText('Connect with Komoot'))

            expect(onConnect).toHaveBeenCalledTimes(1)
        })

        test('uses the brand image as connect button if provided', () => {
            const onConnect = vi.fn()
            render(<AppSettingsView name='Strava' connectImage='images/strava.svg' onConnect={onConnect} />)

            const img = screen.getByAltText('Connect With Strava')
            expect(img.getAttribute('src')).toBe('images/strava.svg')
            expect(screen.queryByText('Connect with Strava')).toBeNull()

            fireEvent.click(img)
            expect(onConnect).toHaveBeenCalledTimes(1)
        })
    })

    describe('connecting', () => {
        test('replaces the connect button by a progress text', () => {
            render(<AppSettingsView name='Komoot' isConnecting={true} />)

            expect(screen.getByText('Connecting...')).toBeDefined()
            expect(screen.queryByText('Connect with Komoot')).toBeNull()
        })
    })

    describe('connected', () => {
        test('offers disconnect and the operations, using the same wording as mobile', () => {
            render(<AppSettingsView name='Komoot' isConnected={true} operations={operations} />)

            expect(screen.getByText('Disconnect')).toBeDefined()
            expect(screen.queryByText('Connect with Komoot')).toBeNull()
            expect(screen.getByText('Activity Upload')).toBeDefined()
            expect(screen.getByText('Route Download')).toBeDefined()
        })

        test('calls onDisconnect', () => {
            const onDisconnect = vi.fn()
            render(<AppSettingsView name='Komoot' isConnected={true} onDisconnect={onDisconnect} />)

            fireEvent.click(screen.getByText('Disconnect'))

            expect(onDisconnect).toHaveBeenCalledTimes(1)
        })

        test('reports changed operations', () => {
            const onOperationsChanged = vi.fn()
            render(<AppSettingsView name='Komoot' isConnected={true} operations={operations} onOperationsChanged={onOperationsChanged} />)

            fireEvent.click(screen.getByLabelText('Route Download'))

            expect(onOperationsChanged).toHaveBeenCalledWith('RouteDownload', true)
        })

        test('shows no operations section if there are none', () => {
            render(<AppSettingsView name='Komoot' isConnected={true} operations={[]} />)

            expect(screen.getByText('Disconnect')).toBeDefined()
            expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
        })
    })
})
