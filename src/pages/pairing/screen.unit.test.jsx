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

const helper = (overrides = {}) => ({
    phase: 'open',
    title: "Can't find your trainer?",
    reasons: [{ id: 'asleep', label: "It's switched off or asleep", selected: false, onSelect: vi.fn() }],
    footer: 'Still searching. Your tiles light up as soon as something is found.',
    onOpen: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
})

// the tile element: the title's container
const tileOf = (title) => screen.getByText(title).parentElement

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

    test('the status line\'s link opens the helper', () => {
        const onOpen = vi.fn()
        const status = { id: 'S6', dot: 'amber', text: 'Still searching…', link: "Can't find your trainer?" }
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} status={status} helper={helper({ phase: 'hidden', onOpen })} />)

        fireEvent.click(screen.getByRole('button', { name: "Can't find your trainer?" }))

        expect(onOpen).toHaveBeenCalledTimes(1)
    })

    test('shows no helper panel while the helper is hidden', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} helper={helper({ phase: 'hidden' })} />)

        expect(screen.queryByText("Can't find your trainer?")).toBeNull()
    })

    test('shows the helper panel beside the tiles while it is open', () => {
        render(<PairingScreen capabilities={{ top: [tile()], bottom: [] }} helper={helper()} />)

        expect(screen.getByRole('complementary', { name: "Can't find your trainer?" })).toBeTruthy()
        expect(screen.getByText('Resistance')).toBeTruthy()
    })

    test('a tile the page waits for gets the amber outline, others don\'t', () => {
        render(<PairingScreen capabilities={{ top: [tile({ awaited: true }), tile({ title: 'Power', capability: 'power', awaited: false })], bottom: [] }} />)

        expect(tileOf('Resistance').style.outline).toContain('solid')
        expect(tileOf('Power').style.outline).toBe('')
    })

    test('a tile with a device the page waits for gets the amber outline too', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Flux', connectState: 'connecting', awaited: true })], bottom: [] }} />)

        expect(tileOf('Resistance').style.outline).toContain('solid')
    })

    test('the outline follows the awaited prop, not the role', () => {
        render(<PairingScreen capabilities={{ top: [tile({ awaited: false })], bottom: [] }} readyToStart={false} />)

        expect(tileOf('Resistance').style.outline).toBe('')
    })

    test('an empty tile shows the service\'s footer copy instead of its empty footer', () => {
        render(<PairingScreen capabilities={{ top: [tile({ title: 'Power', capability: 'power', emptyFooter: 'Searching...', footerText: { full: 'Optional for now', short: 'Optional for now' } })], bottom: [] }} />)

        expect(screen.getByText('Optional for now')).toBeTruthy()
        expect(screen.queryByText('Searching...')).toBeNull()
    })

    test('the trainer\'s tile shows its role line above the device name and the full footer copy as written', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Flux', connectState: 'failed', trainerRole: 'trainer', roleLabel: 'Your trainer', footerText: { full: 'Not connected · waiting', short: 'Waiting…' }, awaited: true })], bottom: [] }} />)

        const role = screen.getByText('Your trainer')
        const device = screen.getByText('Tacx Flux')
        expect(role.compareDocumentPosition(device) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByText('Not connected · waiting')).toBeTruthy()
        expect(screen.queryByText('Waiting…')).toBeNull()
        expect(screen.queryByText('failed')).toBeNull()
    })

    test('a tile the trainer fills shows its role line below the device name', () => {
        render(<PairingScreen capabilities={{ top: [tile({ title: 'Power', capability: 'power', deviceName: 'Tacx Flux', connectState: 'failed', trainerRole: 'via-trainer', roleLabel: 'via your trainer', footerText: { full: 'Waiting for trainer', short: 'Via trainer' } })], bottom: [] }} />)

        const role = screen.getByText('via your trainer')
        const device = screen.getByText('Tacx Flux')
        expect(device.compareDocumentPosition(role) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByText('Waiting for trainer')).toBeTruthy()
    })

    test('clicking an interface calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} interfaces={[{ name: 'ant', enabled: true, state: 'idle', onClick }]} />)

        fireEvent.click(screen.getByText('Ant+'))

        expect(onClick).toHaveBeenCalled()
    })
})
