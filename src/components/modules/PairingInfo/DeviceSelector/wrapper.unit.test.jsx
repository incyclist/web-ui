import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { viewProps } = vi.hoisted(() => ({ viewProps: [] }))

// the view is stubbed to capture what the wrapper hands it; the view has its own tests
vi.mock('./component', () => ({
    DeviceSelector: (props) => {
        viewProps.push(props)
        return <div data-testid="device-selector" />
    },
}))

import { Wrapper as DeviceSelector } from './wrapper'

const item = (deviceName, overrides = {}) => ({
    deviceName, value: 0, interface: 'ant', connectState: 'connected', isSelected: false,
    onClick: vi.fn(), onDelete: vi.fn(), ...overrides,
})

const lastView = () => viewProps[viewProps.length - 1]

describe('DeviceSelector wrapper', () => {

    beforeEach(() => {
        viewProps.length = 0
    })

    test('maps the service\'s items to the view\'s rows', () => {
        render(<DeviceSelector capability="control" devices={[item('Tacx Neo 2T'), item('Wahoo KICKR', { connectState: 'connecting' })]} />)

        expect(screen.getByTestId('device-selector')).toBeTruthy()
        expect(lastView().devices).toEqual([
            { udid: 0, name: 'Tacx Neo 2T', value: 0, connectState: 'connected', interface: 'ant' },
            { udid: 1, name: 'Wahoo KICKR', value: 0, connectState: 'connecting', interface: 'ant' },
        ])
    })

    test('a pick calls the item\'s own onClick without any argument, also in the Resistance list', () => {
        const items = [item('Tacx Neo 2T'), item('Wahoo KICKR')]
        render(<DeviceSelector capability="control" devices={items} canSelectAll={true} changeForAll={true} />)

        lastView().onOK(1)

        expect(items[1].onClick).toHaveBeenCalledTimes(1)
        expect(items[1].onClick).toHaveBeenCalledWith()
        expect(items[0].onClick).not.toHaveBeenCalled()
    })

    test('no longer hands the deprecated "for all" props or a handler for them to the view', () => {
        render(<DeviceSelector capability="control" devices={[item('Tacx Neo 2T')]} canSelectAll={true} changeForAll={true} />)

        expect(lastView().canSelectAll).toBeUndefined()
        expect(lastView().changeForAll).toBeUndefined()
        expect(lastView().onAll).toBeUndefined()
    })

    test('a delete calls the item\'s own onDelete', () => {
        const items = [item('Tacx Neo 2T')]
        render(<DeviceSelector capability="control" devices={items} />)

        lastView().onDelete(0)

        expect(items[0].onDelete).toHaveBeenCalledTimes(1)
    })

    test('closing the list calls onClose', () => {
        const onClose = vi.fn()
        render(<DeviceSelector capability="control" devices={[]} onClose={onClose} />)

        lastView().onCancel()

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('hands the second step to the view exactly as given', () => {
        const conflictStep = { id: 'manual-1', rows: [], onChoice: vi.fn(), onDone: vi.fn(), onDismiss: vi.fn() }
        render(<DeviceSelector capability="control" devices={[item('Tacx Neo 2T')]} conflictStep={conflictStep} />)

        expect(lastView().conflictStep).toBe(conflictStep)
    })
})
