import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'

import { RouteServersSettingsView } from './RouteServersSettings'
import {
    listProps, emptyProps, addWithKnownProps, addWithoutKnownProps, manual, knownStates, removeWithRoutes, removeWithoutRoutes
} from './routeServers.mock'

const makeActions = () => new Proxy({}, {
    get: (target, name) => {
        target[name] ??= vi.fn()
        return target[name]
    }
})

describe('RouteServersSettingsView', () => {

    describe('list', () => {
        test('shows every server with its status text, host and tags', () => {
            render(<RouteServersSettingsView {...listProps} actions={makeActions()} />)

            expect(screen.getByText('Incyclist')).toBeDefined()
            expect(screen.getByText('Built in')).toBeDefined()
            expect(screen.getByText('alpine-videos.example.org')).toBeDefined()
            expect(screen.getByText('24 routes')).toBeDefined()
            expect(screen.getByText('Checking…')).toBeDefined()
            expect(screen.getByText(/Couldn't be reached last time/)).toBeDefined()
            expect(screen.getByText('Local · not encrypted')).toBeDefined()
            expect(screen.getByText('Local')).toBeDefined()
            expect(screen.getByText('Added outside the app')).toBeDefined()
        })

        test('every status dot has a text label', () => {
            render(<RouteServersSettingsView {...listProps} actions={makeActions()} />)

            expect(screen.getAllByRole('img')).toHaveLength(listProps.servers.length)
            expect(screen.getAllByRole('img', { name: '24 routes' })).toHaveLength(1)
        })

        test('the built-in server cannot be removed', () => {
            render(<RouteServersSettingsView {...listProps} actions={makeActions()} />)

            const row = screen.getByTestId('server-Incyclist')
            expect(within(row).queryByText('Remove')).toBeNull()
            expect(within(screen.getByTestId('server-Alpine Videos')).getByText('Remove')).toBeDefined()
        })

        test('requests the removal of the clicked server', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...listProps} actions={actions} />)

            fireEvent.click(within(screen.getByTestId('server-Alpine Videos')).getByText('Remove'))

            expect(actions.requestRemove).toHaveBeenCalledWith('Alpine Videos')
        })

        test('shows a secondary Add button above the list', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...listProps} actions={actions} />)

            fireEvent.click(screen.getByText('Add route server'))
            expect(actions.showAdd).toHaveBeenCalledTimes(1)
        })

        test('shows the explanation and one primary Add button if there are no servers', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...emptyProps} actions={actions} />)

            expect(screen.getByText('Get more routes from other providers')).toBeDefined()
            expect(screen.getAllByText('Add route server')).toHaveLength(1)

            fireEvent.click(screen.getByText('Add route server'))
            expect(actions.showAdd).toHaveBeenCalledTimes(1)
        })
    })

    describe('add view', () => {
        test('shows known servers in their states', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...addWithKnownProps} known={knownStates} actions={actions} />)

            fireEvent.click(within(screen.getByTestId('known-a')).getByText('Add'))
            expect(actions.addKnown).toHaveBeenCalledWith('a')
            expect(within(screen.getByTestId('known-b')).getByText('Checking…')).toBeDefined()
            expect(within(screen.getByTestId('known-c')).getByText('Added ✓ · 12 routes')).toBeDefined()
            expect(within(screen.getByTestId('known-e')).getByText('Added ✓')).toBeDefined()

            expect(within(screen.getByTestId('known-d')).getByText(/couldn't be reached/)).toBeDefined()
            fireEvent.click(within(screen.getByTestId('known-d')).getByText('Try again'))
            expect(actions.retryKnown).toHaveBeenCalledWith('d')
        })

        test('shows the note on known servers and the operator', () => {
            render(<RouteServersSettingsView {...addWithKnownProps} actions={makeActions()} />)

            expect(screen.getByText('Known servers')).toBeDefined()
            expect(screen.getByText('by Alpine Video Club')).toBeDefined()
            expect(screen.getByText(addWithKnownProps.knownNote)).toBeDefined()
        })

        test('hides the known servers if there are none', () => {
            render(<RouteServersSettingsView {...addWithoutKnownProps} actions={makeActions()} />)

            expect(screen.queryByText('Known servers')).toBeNull()
            expect(screen.getByText('Or enter an address')).toBeDefined()
        })

        test('Back is reported', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...addWithKnownProps} actions={actions} />)

            fireEvent.click(screen.getByText('Back'))
            expect(actions.back).toHaveBeenCalledTimes(1)
        })
    })

    describe('manual entry', () => {
        const renderManual = (state, actions = makeActions()) =>
            render(<RouteServersSettingsView {...addWithKnownProps} manual={manual[state]} actions={actions} />)

        test('Check and add is disabled until the dialog service allows it', () => {
            renderManual('typed')
            expect(screen.getByText('Check and add').disabled).toBe(false)
            expect(screen.getByText(addWithKnownProps.trustNote)).toBeDefined()
        })

        test('Check and add is disabled if canSubmit is false', () => {
            render(<RouteServersSettingsView {...addWithKnownProps} actions={makeActions()} />)
            expect(screen.getByText('Check and add').disabled).toBe(true)
        })

        test('Check and add starts the one-step check', () => {
            const actions = makeActions()
            renderManual('typed', actions)

            fireEvent.click(screen.getByText('Check and add'))
            expect(actions.checkAndAdd).toHaveBeenCalledTimes(1)
        })

        test('shows the note for a home-network http address', () => {
            renderManual('localHttp')
            expect(screen.getByText(/Local server — traffic isn't encrypted. Use this only/)).toBeDefined()
        })

        test('checking: button reads Checking… and is disabled, fields are read-only', () => {
            renderManual('checking')

            expect(screen.getByText('Checking…').disabled).toBe(true)
            screen.getAllByRole('textbox').forEach(input => expect(input.disabled).toBe(true))
        })

        test('success: shows the confirmation', () => {
            renderManual('success')
            expect(screen.getByText('✓ Found 24 routes.')).toBeDefined()
        })

        test('checked: shows resolved address and Add', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...addWithoutKnownProps} manual={manual.checked} actions={actions} />)

            expect(screen.getByText('Address: http://nas:8080')).toBeDefined()
            expect(screen.getByText('✓ Found 24 routes.')).toBeDefined()
            fireEvent.click(screen.getByText('Add'))
            expect(actions.add).toHaveBeenCalledTimes(1)
        })

        test('confirm-empty: offers Add anyway and Cancel', () => {
            const actions = makeActions()
            renderManual('confirmEmpty', actions)

            expect(screen.getByText('This server works but has no routes yet. Add it anyway?')).toBeDefined()
            fireEvent.click(screen.getByText('Add anyway'))
            expect(actions.confirmAddEmpty).toHaveBeenCalledTimes(1)

            fireEvent.click(screen.getByText('Cancel'))
            expect(actions.cancelAddEmpty).toHaveBeenCalledTimes(1)
            expect(actions.setManualUrl).not.toHaveBeenCalled()
        })

        test('shows errors below the field that caused them', () => {
            renderManual('urlError')
            expect(screen.getByRole('alert').textContent).toMatch(/Plain http/)
        })

        test('shows a name error', () => {
            renderManual('nameError')
            expect(screen.getByRole('alert').textContent).toMatch(/reserved/)
        })
    })

    describe('remove dialog', () => {
        test('offers to keep or remove the routes, keeping is the default', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...listProps} removeDialog={removeWithRoutes} actions={actions} />)

            expect(screen.getByText('Remove "Alpine Videos"?')).toBeDefined()
            expect(screen.getByText('You have 24 routes from this server in your route list.')).toBeDefined()
            const [keep, remove] = screen.getAllByRole('radio')
            expect(keep.checked).toBe(true)
            expect(remove.checked).toBe(false)
            expect(screen.getByText(/including 3 downloaded videos \(1.2 GB\)/)).toBeDefined()

            fireEvent.click(remove)
            expect(actions.setRemoveRoutes).toHaveBeenCalledWith(true)

            fireEvent.click(screen.getByText('Remove server'))
            expect(actions.confirmRemove).toHaveBeenCalledTimes(1)
        })

        test('is a simple confirmation if the server has no routes', () => {
            const actions = makeActions()
            render(<RouteServersSettingsView {...listProps} removeDialog={removeWithoutRoutes} actions={actions} />)

            expect(screen.queryAllByRole('radio')).toHaveLength(0)
            fireEvent.click(screen.getByText('Cancel'))
            expect(actions.cancelRemove).toHaveBeenCalledTimes(1)
            fireEvent.click(screen.getByText('Remove', { selector: 'button.btn' }))
            expect(actions.confirmRemove).toHaveBeenCalledTimes(1)
        })
    })
})
