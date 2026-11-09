import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PairingHelperPanel } from './index'

const reason = (id, label, selected = false) => ({ id, label, selected, onSelect: vi.fn() })

const helper = (overrides = {}) => ({
    phase: 'open',
    title: "Can't find your trainer?",
    subline: "Pick what fits best and we'll show you what to try.",
    reasons: [
        reason('asleep', "It's switched off or asleep"),
        reason('other_app', "It's connected to another app or device"),
        reason('unsure', 'Something else / not sure'),
    ],
    footer: 'Still searching. Your tiles light up as soon as something is found.',
    onOpen: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
})

describe('PairingHelperPanel', () => {

    test('renders nothing while the helper is hidden', () => {
        const { container } = render(<PairingHelperPanel helper={helper({ phase: 'hidden' })} />)

        expect(container.textContent).toBe('')
    })

    test('renders nothing without a helper', () => {
        const { container } = render(<PairingHelperPanel />)

        expect(container.textContent).toBe('')
    })

    test('shows the title, the subline, every answer and the footer line', () => {
        render(<PairingHelperPanel helper={helper()} />)

        expect(screen.getByText("Can't find your trainer?")).toBeTruthy()
        expect(screen.getByText("Pick what fits best and we'll show you what to try.")).toBeTruthy()
        expect(screen.getAllByRole('radio')).toHaveLength(3)
        expect(screen.getByText('Still searching. Your tiles light up as soon as something is found.')).toBeTruthy()
    })

    test('picking an answer calls its own onSelect', () => {
        const h = helper()
        render(<PairingHelperPanel helper={h} />)

        fireEvent.click(screen.getByLabelText("It's connected to another app or device"))

        expect(h.reasons[1].onSelect).toHaveBeenCalledTimes(1)
    })

    test('shows the full tip under the picked answer', () => {
        const reasons = [reason('asleep', "It's switched off or asleep", true), reason('unsure', 'Something else / not sure')]
        render(<PairingHelperPanel helper={helper({ reasons, subline: undefined, tip: { text: 'Pedal a few strokes.', shortText: 'Pedal.' } })} />)

        expect(screen.getByText('Pedal a few strokes.')).toBeTruthy()
        expect(screen.queryByText('Pedal.')).toBeNull()
        expect(screen.getByLabelText("It's switched off or asleep").checked).toBe(true)
    })

    test('shows the action with its note, and clicking it calls the action', () => {
        const onClick = vi.fn()
        const reasons = [reason('no_device', "I don't have a trainer, power meter or speed sensor", true)]
        render(<PairingHelperPanel helper={helper({ reasons, tip: { text: 'Riding needs a device.', shortText: '' }, action: { label: 'Browse routes for now', note: "You'll need one of these devices to start a ride.", onClick } })} />)

        expect(screen.getByText("You'll need one of these devices to start a ride.")).toBeTruthy()
        fireEvent.click(screen.getByText('Browse routes for now'))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('the fallback action is pinned under the answers, with its note above the button, both as given', () => {
        const onClick = vi.fn()
        const reasons = [reason('trainer_unavailable', "My trainer isn't available today", true)]
        render(<PairingHelperPanel helper={helper({ reasons, subline: undefined, tip: { text: 'Ride with your power meter instead.', shortText: '' }, action: { label: 'Ride with power meter only', note: 'No resistance control on this ride.', onClick } })} />)

        const note = screen.getByText('No resistance control on this ride.')
        const button = screen.getByRole('button', { name: 'Ride with power meter only' })
        expect(note.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByRole('radiogroup').contains(button)).toBe(false)

        fireEvent.click(button)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('an action without a note shows just the button', () => {
        const reasons = [reason('trainer_unavailable', "My trainer isn't available today", true)]
        render(<PairingHelperPanel helper={helper({ reasons, tip: { text: 'Tip', shortText: '' }, action: { label: 'Ride with power meter only', onClick: vi.fn() } })} />)

        const button = screen.getByRole('button', { name: 'Ride with power meter only' })
        expect(button.parentElement.previousElementSibling.textContent).toBe('Still searching. Your tiles light up as soon as something is found.')
    })

    test('the close button dismisses the helper', () => {
        const h = helper()
        render(<PairingHelperPanel helper={h} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(h.onDismiss).toHaveBeenCalledTimes(1)
    })

    test('once resolved, it shows only the resolved text', () => {
        const reasons = [reason('asleep', "It's switched off or asleep", true)]
        render(<PairingHelperPanel helper={helper({ phase: 'resolved', resolvedText: 'Found it! Ready to ride.', reasons, action: { label: 'Browse routes for now', onClick: vi.fn() } })} />)

        expect(screen.getByText('Found it! Ready to ride.')).toBeTruthy()
        expect(screen.queryAllByRole('radio')).toHaveLength(0)
        expect(screen.queryByText('Browse routes for now')).toBeNull()
        expect(screen.queryByText('Still searching. Your tiles light up as soon as something is found.')).toBeNull()
    })
})
