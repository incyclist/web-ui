import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { logEvent } = vi.hoisted(() => ({ logEvent: vi.fn() }))

vi.mock('gd-eventlog', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, EventLogger: vi.fn(function () { return { logEvent, set: vi.fn() } }) }
})

import { RideViewRestrictionDialogView } from './RideViewRestrictionDialogView'

const title = 'Street View in simulated rides'
const device = { id: 'device', heading: 'Ride with a device', text: 'Connect your smart trainer.' }
const discard = {
    label: 'Discard ride and connect a device',
    confirm: { question: 'Discard this simulated ride?', confirmLabel: 'Discard and connect', cancelLabel: 'Keep riding' },
}
const ownKey = {
    id: 'own-key', heading: 'Or use your own Google Maps API key', text: 'Own key text.',
    addKey: { label: 'Add my key' },
    helpLink: { label: 'How to create a key', url: 'https://incyclist.com/maps-api-key/' },
}

const renderDialog = (props = {}) => {
    const handlers = { onClose: vi.fn(), onDiscard: vi.fn(), onAddKey: vi.fn(), onReminderChanged: vi.fn() }
    render(<RideViewRestrictionDialogView title={title} body='Body text' options={[{ ...device, discard }, ownKey]}
        reminder={{ label: 'Remind me in simulated rides', checked: true }} {...handlers} {...props} />)
    return handlers
}

describe('RideViewRestrictionDialogView', () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('shows body and both options', () => {
        renderDialog()

        expect(screen.queryByText('Body text')).not.toBeNull()
        expect(screen.queryByText('Ride with a device')).not.toBeNull()
        expect(screen.queryByText('Or use your own Google Maps API key')).not.toBeNull()
    })

    test('without an own-key option (mobile-style content) no key content is rendered', () => {
        renderDialog({ options: [{ ...device, heading: undefined, discard }] })

        expect(screen.queryByText(/key/i)).toBeNull()
    })

    test('Close and the reminder checkbox report to the caller', () => {
        const { onClose, onReminderChanged } = renderDialog()

        fireEvent.click(screen.getByLabelText('Remind me in simulated rides'))
        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(onReminderChanged).toHaveBeenCalledWith(false)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('no reminder checkbox outside a restricted ride', () => {
        renderDialog({ reminder: undefined })

        expect(screen.queryByLabelText('Remind me in simulated rides')).toBeNull()
    })

    describe('discard', () => {
        test('always asks for one confirmation before discarding', () => {
            const { onDiscard } = renderDialog()

            fireEvent.click(screen.getByRole('button', { name: 'Discard ride and connect a device' }))

            expect(onDiscard).not.toHaveBeenCalled()
            expect(screen.queryByText('Discard this simulated ride?')).not.toBeNull()
        })

        test('confirming discards', () => {
            const { onDiscard } = renderDialog()

            fireEvent.click(screen.getByRole('button', { name: 'Discard ride and connect a device' }))
            fireEvent.click(screen.getByRole('button', { name: 'Discard and connect' }))

            expect(onDiscard).toHaveBeenCalledTimes(1)
        })

        test('the confirmation replaces the button, there is no separate cancel button', () => {
            renderDialog()

            fireEvent.click(screen.getByRole('button', { name: 'Discard ride and connect a device' }))

            expect(screen.queryByRole('button', { name: 'Discard ride and connect a device' })).toBeNull()
            expect(screen.queryByRole('button', { name: 'Keep riding' })).toBeNull()
        })

        test('Close leaves the ride as it is', () => {
            const { onDiscard, onClose } = renderDialog()

            fireEvent.click(screen.getByRole('button', { name: 'Discard ride and connect a device' }))
            fireEvent.click(screen.getByRole('button', { name: 'Close' }))

            expect(onDiscard).not.toHaveBeenCalled()
            expect(onClose).toHaveBeenCalledTimes(1)
        })

        test('no discard button outside a ride', () => {
            renderDialog({ options: [device, ownKey] })

            expect(screen.queryByRole('button', { name: 'Discard ride and connect a device' })).toBeNull()
        })
    })

    describe('own key', () => {
        test('Add my key reports to the caller', () => {
            const { onAddKey } = renderDialog()

            fireEvent.click(screen.getByRole('button', { name: 'Add my key' }))

            expect(onAddKey).toHaveBeenCalledTimes(1)
        })

        test('after a key was saved this session, the buttons give way to the restart hint', () => {
            renderDialog({ options: [device, { ...ownKey, addKey: undefined, pendingRestart: { text: 'Saved. Restart Incyclist to use it.' } }] })

            expect(screen.queryByText('Saved. Restart Incyclist to use it.')).not.toBeNull()
            expect(screen.queryByRole('button', { name: 'Add my key' })).toBeNull()
        })

        test('the guide link is always offered', () => {
            renderDialog({ options: [device, { ...ownKey, addKey: undefined, pendingRestart: { text: 'x' } }] })

            expect(screen.queryByRole('button', { name: /How to create a key/ })).not.toBeNull()
        })
    })

    test('button clicks are logged with the dialog as context', () => {
        renderDialog()

        fireEvent.click(screen.getByRole('button', { name: 'Add my key' }))

        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'button clicked', button: 'Add my key', dialog: title, eventSource: 'user' }))
    })
})
