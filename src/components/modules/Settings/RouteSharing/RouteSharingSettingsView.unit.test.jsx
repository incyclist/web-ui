import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

import { RouteSharingSettingsView } from './RouteSharingSettingsView'
import * as fx from './fixtures.mock'

const makeActions = () => new Proxy({}, {
    get: (target, name) => {
        target[name] ??= vi.fn()
        return target[name]
    }
})

describe('RouteSharingSettingsView', () => {

    describe('never connected (D-1)', () => {
        test('shows the intro, name warning and the connect button, but no switch', () => {
            const actions = makeActions()
            render(<RouteSharingSettingsView {...fx.neverConnected} actions={actions} />)

            expect(screen.getByText(/Ride the video routes on this computer/)).toBeDefined()
            expect(screen.getByText(/Everyone on the same network can see this name/)).toBeDefined()
            expect(screen.queryByText('Share routes with my phones and tablets')).toBeNull()

            fireEvent.click(screen.getByText('Connect your phone or tablet'))
            expect(actions.connect).toHaveBeenCalledTimes(1)
        })

        test('shows the Windows firewall note', () => {
            render(<RouteSharingSettingsView {...fx.neverConnected} actions={makeActions()} />)

            expect(screen.getByText('ⓘ Before you click')).toBeDefined()
            expect(screen.getByText(/Windows Defender Firewall has blocked some features/)).toBeDefined()
        })

        test('shows the macOS firewall note', () => {
            render(<RouteSharingSettingsView {...fx.neverConnected} platform='macos' actions={makeActions()} />)
            expect(screen.getByText(/accept incoming network connections/)).toBeDefined()
        })

        test('shows no firewall note on Linux', () => {
            render(<RouteSharingSettingsView {...fx.neverConnected} platform='linux' actions={makeActions()} />)
            expect(screen.queryByText('ⓘ Before you click')).toBeNull()
        })

        test('shows the name length', () => {
            render(<RouteSharingSettingsView {...fx.neverConnected} actions={makeActions()} />)
            expect(screen.getByText('18/40')).toBeDefined()
        })

        test('clips the name at 40 characters', () => {
            render(<RouteSharingSettingsView {...fx.neverConnected} actions={makeActions()} />)
            const input = screen.getByRole('textbox')

            fireEvent.change(input, { target: { value: 'x'.repeat(55) } })

            expect(input.value).toBe('x'.repeat(40))
            expect(screen.getByText('40/40')).toBeDefined()
        })

        test('reports the new name on blur', () => {
            const actions = makeActions()
            render(<RouteSharingSettingsView {...fx.neverConnected} actions={actions} />)
            const input = screen.getByRole('textbox')

            fireEvent.change(input, { target: { value: 'Office' } })
            fireEvent.blur(input)

            expect(actions.setName).toHaveBeenCalledWith('Office')
        })
    })

    describe('connected (D-2, D-3)', () => {
        test('on: shows the status, the devices and the any-network note', () => {
            render(<RouteSharingSettingsView {...fx.on} actions={makeActions()} />)

            expect(screen.getByText('On • sharing 128 routes')).toBeDefined()
            expect(screen.getByText(/While this is on, Route Sharing runs whenever/)).toBeDefined()
            expect(screen.getByText('Connected phones and tablets')).toBeDefined()
            expect(within(screen.getByTestId('device-a')).getByText(/Active now/)).toBeDefined()
            expect(within(screen.getByTestId('device-b')).getByText(/Last used yesterday/)).toBeDefined()
            expect(screen.getByText('Connect another phone or tablet')).toBeDefined()
            expect(screen.queryByText('Connect your phone or tablet')).toBeNull()
        })

        test('on without routes: states the fact', () => {
            render(<RouteSharingSettingsView {...fx.noRoutes} actions={makeActions()} />)
            expect(screen.getByText(/On • no routes to share yet/)).toBeDefined()
        })

        test('off: shows what the phones will show, and keeps the devices usable', () => {
            const actions = makeActions()
            render(<RouteSharingSettingsView {...fx.off} actions={actions} />)

            expect(screen.getByText(/Off • your phones and tablets show this computer as not reachable/)).toBeDefined()
            expect(screen.queryByText(/While this is on/)).toBeNull()
            fireEvent.click(within(screen.getByTestId('device-a')).getByText('Remove'))
            expect(actions.requestRemove).toHaveBeenCalledWith('a')
        })

        test('the switch reflects the state and reports changes', () => {
            const actions = makeActions()
            const { rerender } = render(<RouteSharingSettingsView {...fx.on} actions={actions} />)
            const sw = screen.getByLabelText('Share routes with my phones and tablets')
            expect(sw.checked).toBe(true)

            fireEvent.click(sw)
            expect(actions.setEnabled).toHaveBeenCalledWith(false)

            rerender(<RouteSharingSettingsView {...fx.off} actions={actions} />)
            expect(screen.getByLabelText('Share routes with my phones and tablets').checked).toBe(false)
        })

        test('Connect another reports connect', () => {
            const actions = makeActions()
            render(<RouteSharingSettingsView {...fx.off} actions={actions} />)

            fireEvent.click(screen.getByText('Connect another phone or tablet'))
            expect(actions.connect).toHaveBeenCalledTimes(1)
        })

        test('shows the rename note only with connected devices', () => {
            const { rerender } = render(<RouteSharingSettingsView {...fx.on} nameChanged actions={makeActions()} />)
            expect(screen.getByText(/show the new name the next time they connect/)).toBeDefined()

            rerender(<RouteSharingSettingsView {...fx.neverConnected} nameChanged actions={makeActions()} />)
            expect(screen.queryByText(/show the new name the next time they connect/)).toBeNull()
        })
    })

    describe('remove', () => {
        test('asks for confirmation, Cancel is the default', () => {
            const actions = makeActions()
            render(<RouteSharingSettingsView {...fx.on} removeTarget={fx.on.devices[0]} actions={actions} />)

            expect(screen.getByText('Remove Pixel 8?')).toBeDefined()
            expect(screen.getByText(/will no longer be able to play routes from this computer/)).toBeDefined()
            expect(screen.queryByText(/This computer stops sharing/)).toBeNull()

            fireEvent.click(screen.getByText('Remove', { selector: 'button.btn' }))
            expect(actions.confirmRemove).toHaveBeenCalledTimes(1)
            fireEvent.click(screen.getByText('Cancel'))
            expect(actions.cancelRemove).toHaveBeenCalledTimes(1)
        })

        test('warns when the last device is removed', () => {
            render(<RouteSharingSettingsView {...fx.oneDevice} removeTarget={fx.oneDevice.devices[0]} actions={makeActions()} />)
            expect(screen.getByText(/This computer stops sharing until you connect a phone or tablet again/)).toBeDefined()
        })
    })

    describe('start failed (D-4)', () => {
        test('shows the error and retries', () => {
            const actions = makeActions()
            render(<RouteSharingSettingsView {...fx.startError} actions={actions} />)

            expect(screen.getByRole('alert').textContent).toMatch(/Route Sharing couldn't start on this computer/)
            expect(screen.getByText('Connected phones and tablets')).toBeDefined()
            fireEvent.click(screen.getByText('Try Again'))
            expect(actions.retry).toHaveBeenCalledTimes(1)
        })
    })

    describe('help', () => {
        test('Windows: starts with the Private network item', () => {
            render(<RouteSharingSettingsView {...fx.neverConnected} actions={makeActions()} />)

            expect(screen.getByText("Phone or tablet can't find this computer?")).toBeDefined()
            const items = screen.getAllByRole('listitem')
            expect(items[0].textContent).toMatch(/Windows must treat this network as Private/)
            expect(screen.getByText(/If you clicked "Cancel" when Windows asked/)).toBeDefined()
        })

        test('macOS and Linux get their firewall hint only', () => {
            const { rerender } = render(<RouteSharingSettingsView {...fx.on} platform='macos' actions={makeActions()} />)
            expect(screen.getByText(/System Settings › Network › Firewall/)).toBeDefined()
            expect(screen.queryByText(/Windows must treat/)).toBeNull()

            rerender(<RouteSharingSettingsView {...fx.on} platform='linux' actions={makeActions()} />)
            expect(screen.getByText(/ufw or firewalld/)).toBeDefined()
        })
    })

    test('renders the connect window when present', () => {
        render(<RouteSharingSettingsView {...fx.neverConnected} connectWindow={fx.windowWaiting} actions={makeActions()} />)
        expect(screen.getByText('Waiting for your phone or tablet…')).toBeDefined()
    })
})
