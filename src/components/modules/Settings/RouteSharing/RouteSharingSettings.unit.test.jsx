import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { EventEmitter } from 'node:events'

import * as fx from './fixtures.mock'

const mocks = vi.hoisted(() => ({ service: undefined }))

vi.mock('incyclist-services', async (importOriginal) => ({ ...(await importOriginal()), useLocalLink: () => mocks.service }))

import { RouteSharingSettings } from './RouteSharingSettings'
import { FirewallUpdateNotice } from './FirewallUpdateNotice'

const makeService = (props) => {
    const service = new EventEmitter()
    service.props = props
    service.getDisplayProps = vi.fn(() => service.props)
    service.off = service.removeListener.bind(service)
    service.openPairing = vi.fn()
    service.closePairing = vi.fn()
    service.denyPairing = vi.fn()
    service.setEnabled = vi.fn()
    service.setDisplayName = vi.fn().mockResolvedValue({ ok: true, name: 'Office' })
    service.removeClient = vi.fn()
    service.dismissFirewallNotice = vi.fn()
    return service
}

describe('RouteSharingSettings', () => {

    beforeEach(() => { mocks.service = makeService(fx.neverConnected) })

    test('renders nothing if the feature is not available', () => {
        mocks.service = makeService({ ...fx.neverConnected, available: false })
        const { container } = render(<RouteSharingSettings />)
        expect(container.textContent).toBe('')
    })

    test('Connect opens pairing', () => {
        render(<RouteSharingSettings />)
        fireEvent.click(screen.getByText('Connect your phone or tablet'))
        expect(mocks.service.openPairing).toHaveBeenCalledTimes(1)
    })

    test('follows state changes of the service', () => {
        render(<RouteSharingSettings />)
        expect(screen.queryByText('Connected phones and tablets')).toBeNull()

        act(() => {
            mocks.service.props = fx.on
            mocks.service.emit('state-changed', fx.on)
        })

        expect(screen.getByText('Connected phones and tablets')).toBeDefined()
    })

    test('shows the connect window while pairing is open and Done closes pairing', () => {
        render(<RouteSharingSettings />)

        act(() => {
            const updated = { ...fx.on, pairingOpen: true, connectWindow: fx.windowConnected }
            mocks.service.props = updated
            mocks.service.emit('pairing-changed', updated)
        })
        fireEvent.click(screen.getByText('Done'))

        expect(mocks.service.closePairing).toHaveBeenCalledTimes(1)
    })

    test('Deny is forwarded', () => {
        mocks.service = makeService({ ...fx.on, connectWindow: fx.windowCode })
        render(<RouteSharingSettings />)

        fireEvent.click(screen.getByText('Deny'))
        expect(mocks.service.denyPairing).toHaveBeenCalledTimes(1)
    })

    test('the switch calls setEnabled', () => {
        mocks.service = makeService(fx.on)
        render(<RouteSharingSettings />)

        fireEvent.click(screen.getByLabelText('Share routes with my phones and tablets'))
        expect(mocks.service.setEnabled).toHaveBeenCalledWith(false)
    })

    test('Try Again after a failed start switches sharing on again', () => {
        mocks.service = makeService(fx.startError)
        render(<RouteSharingSettings />)

        fireEvent.click(screen.getByText('Try Again'))
        expect(mocks.service.setEnabled).toHaveBeenCalledWith(true)
    })

    test('removing a device needs a confirmation', () => {
        mocks.service = makeService(fx.on)
        render(<RouteSharingSettings />)

        fireEvent.click(screen.getAllByText('Remove')[0])
        expect(mocks.service.removeClient).not.toHaveBeenCalled()

        fireEvent.click(screen.getByText('Remove', { selector: 'button.btn' }))
        expect(mocks.service.removeClient).toHaveBeenCalledWith('a')
    })

    test('cancelling the confirmation keeps the device', () => {
        mocks.service = makeService(fx.on)
        render(<RouteSharingSettings />)

        fireEvent.click(screen.getAllByText('Remove')[0])
        fireEvent.click(screen.getByText('Cancel'))

        expect(mocks.service.removeClient).not.toHaveBeenCalled()
        expect(screen.queryByText('Remove Pixel 8?')).toBeNull()
    })

    test('a rename is saved and noted when devices are connected', async () => {
        mocks.service = makeService(fx.on)
        render(<RouteSharingSettings />)
        const input = screen.getByRole('textbox')

        fireEvent.change(input, { target: { value: 'Office' } })
        fireEvent.blur(input)

        expect(mocks.service.setDisplayName).toHaveBeenCalledWith('Office')
        await waitFor(() => expect(screen.getByText(/show the new name the next time they connect/)).toBeDefined())
    })

    test('closes pairing when the tab goes away while the connect window is open', () => {
        mocks.service = makeService({ ...fx.on, connectWindow: fx.windowWaiting })
        const { unmount } = render(<RouteSharingSettings />)

        unmount()

        expect(mocks.service.closePairing).toHaveBeenCalledTimes(1)
    })
})

describe('FirewallUpdateNotice', () => {
    test('is not shown unless the service asks for it', () => {
        mocks.service = makeService(fx.on)
        const { container } = render(<FirewallUpdateNotice />)
        expect(container.textContent).toBe('')
    })

    test('is shown when requested later and OK dismisses it', () => {
        mocks.service = makeService(fx.on)
        render(<FirewallUpdateNotice />)

        act(() => {
            const updated = { ...fx.on, showUpdateFirewallNotice: true }
            mocks.service.props = updated
            mocks.service.emit('state-changed', updated)
        })
        expect(screen.getByText('Windows may ask about Incyclist')).toBeDefined()
        expect(screen.getByText(/Incyclist was updated/)).toBeDefined()

        fireEvent.click(screen.getByText('OK'))
        expect(mocks.service.dismissFirewallNotice).toHaveBeenCalledTimes(1)
    })
})
