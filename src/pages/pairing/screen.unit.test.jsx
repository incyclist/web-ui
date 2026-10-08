import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PairingScreen } from './screen'

const tile = (overrides = {}) => ({
    title: 'Resistance',
    capability: 'control',
    role: 'required',
    helpText: { full: 'help', short: 'help' },
    emptyFooter: 'Searching...',
    ...overrides,
})

describe('PairingScreen', () => {

    test('renders a tile with no device as a SearchingDevice, waiting when required and not ready', () => {
        render(<PairingScreen capabilities={{ top: [tile()], bottom: [] }} readyToStart={false} />)

        expect(screen.getByText('Resistance')).toBeTruthy()
        expect(screen.getByText('Searching...')).toBeTruthy()
    })

    test('renders a tile with a device as a SelectedDevice', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Neo', connectState: 'connected' })], bottom: [] }} />)

        expect(screen.getByText('Tacx Neo')).toBeTruthy()
    })

    test('clicking a tile calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [tile({ onClick })], bottom: [] }} />)

        fireEvent.click(screen.getByText('Resistance'))

        expect(onClick).toHaveBeenCalled()
    })

    test('a selected tile\'s onUnselect/onUse come straight from its own props, not from the page', () => {
        const onUnselect = vi.fn()
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Neo', connectState:'connected', onUnselect })], bottom: [] }} />)

        fireEvent.click(screen.getByRole('switch'))

        expect(onUnselect).toHaveBeenCalled()
    })

    test('renders the row labels from capabilities.rowLabels', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [], rowLabels: { top: { text: 'TO RIDE', subtext: 'connect any one' }, bottom: { text: 'OPTIONAL' } } }} />)

        expect(screen.getByText('TO RIDE')).toBeTruthy()
        expect(screen.getByText('connect any one')).toBeTruthy()
        expect(screen.getByText('OPTIONAL')).toBeTruthy()
    })

    test('renders the status line from the status prop, not derived locally', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} status={{ id: 'S3', dot: 'amber', text: 'Connect a trainer' }} />)

        expect(screen.getByText('Connect a trainer')).toBeTruthy()
    })

    test('renders no status line when the service sends none', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} />)

        expect(screen.queryByText('Connect a trainer')).toBeNull()
    })

    test('renders each button from the buttons prop and wires its own onClick', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} buttons={[{ label: 'Simulate', primary: true, onClick }, { label: 'Skip', primary: false, onClick: vi.fn() }]} />)

        fireEvent.click(screen.getByText('Simulate'))

        expect(onClick).toHaveBeenCalled()
        expect(screen.getByText('Skip')).toBeTruthy()
    })

    test('clicking an interface calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} interfaces={[{ name: 'ant', enabled: true, state: 'idle', onClick }]} />)

        fireEvent.click(screen.getByText('Ant+'))

        expect(onClick).toHaveBeenCalled()
    })
})
