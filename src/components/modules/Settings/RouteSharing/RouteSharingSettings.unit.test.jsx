import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { EventEmitter } from 'node:events'
import { EventLogger } from 'gd-eventlog'

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
        fireEvent.click(screen.getByText('Change'))
        const input = screen.getByRole('textbox')

        fireEvent.change(input, { target: { value: 'Office' } })
        fireEvent.blur(input)

        expect(mocks.service.setDisplayName).toHaveBeenCalledWith('Office')
        await waitFor(() => expect(screen.getByText(/show the new name the next time they connect/)).toBeDefined())
    })

    test('closes pairing when the panel goes away while the connect window is open', () => {
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

describe('never throws when the link service throws', () => {
    let logSpy
    beforeEach(() => {
        logSpy = vi.spyOn(EventLogger.prototype, 'logEvent').mockImplementation(() => {})
        mocks.service = makeService(fx.neverConnected)
    })
    afterEach(() => { logSpy.mockRestore() })

    const boom = () => { throw new Error('boom') }

    test('Connect: openPairing throws', () => {
        mocks.service.openPairing = vi.fn(boom)
        render(<RouteSharingSettings />)
        expect(() => fireEvent.click(screen.getByText('Connect your phone or tablet'))).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'connect', error: 'boom' }))
    })

    test('subscription: getDisplayProps throwing in an update is logged', () => {
        render(<RouteSharingSettings />)
        mocks.service.getDisplayProps = vi.fn(boom)
        expect(() => act(() => { mocks.service.emit('state-changed') })).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'onUpdate' }))
    })

    test('subscription: service.on throwing is logged', () => {
        mocks.service.on = vi.fn(boom)
        expect(() => render(<RouteSharingSettings />)).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'subscribe' }))
    })

    test('setDisplayName rejecting is logged and does not reject', async () => {
        mocks.service = makeService(fx.on)
        mocks.service.setDisplayName = vi.fn().mockRejectedValue(new Error('boom'))
        render(<RouteSharingSettings />)
        fireEvent.click(screen.getByText('Change'))
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'Office' } })
        fireEvent.blur(input)
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'setName', error: 'boom' })))
    })

    test('unmount while pairing open: closePairing throwing is logged', () => {
        mocks.service = makeService({ ...fx.neverConnected, connectWindow: { phase: 'starting' } })
        mocks.service.closePairing = vi.fn(boom)
        const { unmount } = render(<RouteSharingSettings />)
        expect(() => unmount()).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'closePairingOnUnmount' }))
    })

    test('FirewallUpdateNotice: getDisplayProps throws', () => {
        mocks.service.getDisplayProps = vi.fn(boom)
        let res
        expect(() => { res = render(<FirewallUpdateNotice />) }).not.toThrow()
        expect(res.container.textContent).toBe('')
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'initialState' }))
    })

    test('FirewallUpdateNotice: OK with dismiss throwing is logged', () => {
        mocks.service.getDisplayProps = vi.fn(() => ({ showUpdateFirewallNotice: true }))
        mocks.service.dismissFirewallNotice = vi.fn(boom)
        render(<FirewallUpdateNotice />)
        expect(() => fireEvent.click(screen.getByText('OK'))).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'onOK' }))
    })
})
