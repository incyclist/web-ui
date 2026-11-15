import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { launched } = vi.hoisted(() => ({ launched: { props: null } }))

let state
const operations = () => [{ operation: 'ActivityUpload', enabled: true }, { operation: 'RouteDownload', enabled: false }]

const service = {
    openAppSettings: vi.fn(() => state.settings),
    connect: vi.fn(async () => { state.settings = { isConnected: true, operations: state.operations }; return true }),
    disconnect: vi.fn(() => { state.settings = { isConnected: false, operations: state.operations } }),
    enableOperation: vi.fn((_app, operation, enabled) => {
        state.operations = state.operations.map(op => op.operation === operation ? { ...op, enabled } : op)
        return state.operations
    }),
}

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useAppsService: () => service }
})

vi.mock('../../../../molecules', async () => {
    const React = await import('react')
    return {
        DialogLauncher: React.forwardRef((_props, ref) => {
            React.useImperativeHandle(ref, () => ({
                openDialog: (_Dialog, props) => { launched.props = props },
                closeDialog: () => { launched.props = null }
            }))
            return null
        }),
        KomootLoginDialog: () => null,
    }
})

import { KomootSettings } from './KomootSettings'

const setup = (isConnected) => {
    state = { operations: operations(), settings: undefined }
    state.settings = { isConnected, operations: state.operations }
    service.enableOperation.mockClear()
    return render(<KomootSettings />)
}

const login = async () => {
    fireEvent.click(screen.getByText('Connect with Komoot'))
    await act(async () => { launched.props.onOK({ username: 'user', password: 'pw' }, vi.fn()) })
}

describe('KomootSettings', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        launched.props = null
    })

    describe('closing the panel (reports the changes of the operations)', () => {

        // review comment: connect, disconnect and collapse the row threw "forEach of undefined"
        test('connected and disconnected again within one session: no error, nothing is reported', async () => {
            const { unmount } = setup(false)

            await login()
            expect(screen.getByText('Disconnect')).toBeDefined()
            fireEvent.click(screen.getByText('Disconnect'))

            expect(() => unmount()).not.toThrow()
            expect(service.enableOperation).not.toHaveBeenCalled()
        })

        test('the operations are kept when disconnecting (and shown again after connecting again)', async () => {
            setup(false)

            await login()
            expect(screen.getByLabelText('Activity Upload')).toBeDefined()
            fireEvent.click(screen.getByText('Disconnect'))
            expect(screen.queryByLabelText('Activity Upload')).toBeNull()
            await login()

            expect(screen.getByLabelText('Activity Upload')).toBeDefined()
            expect(screen.getByLabelText('Route Download')).toBeDefined()
        })

        test('disconnected while the panel was open: all operations are reported as disabled', () => {
            const { unmount } = setup(true)

            fireEvent.click(screen.getByText('Disconnect'))
            unmount()

            expect(service.enableOperation).toHaveBeenCalledTimes(2)
            expect(service.enableOperation).toHaveBeenCalledWith('komoot', 'ActivityUpload', false, true)
            expect(service.enableOperation).toHaveBeenCalledWith('komoot', 'RouteDownload', false, true)
        })

        test('connected while the panel was open: the enabled operations are reported', async () => {
            const { unmount } = setup(false)

            await login()
            unmount()

            expect(service.enableOperation).toHaveBeenCalledTimes(1)
            expect(service.enableOperation).toHaveBeenCalledWith('komoot', 'ActivityUpload', true, true)
        })

        test('an operation was changed while connected: only the change is reported', () => {
            const { unmount } = setup(true)

            fireEvent.click(screen.getByLabelText('Route Download'))
            service.enableOperation.mockClear()
            unmount()

            expect(service.enableOperation).toHaveBeenCalledTimes(1)
            expect(service.enableOperation).toHaveBeenCalledWith('komoot', 'RouteDownload', true, true)
        })

        test('nothing was changed: nothing is reported', () => {
            const { unmount } = setup(true)

            unmount()

            expect(service.enableOperation).not.toHaveBeenCalled()
        })

        test('never connected: nothing is reported', () => {
            const { unmount } = setup(false)

            expect(() => unmount()).not.toThrow()
            expect(service.enableOperation).not.toHaveBeenCalled()
        })
    })
})
