import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'

const { service, view } = vi.hoisted(() => ({
    service: {
        getStartPosition: vi.fn(() => ({ lat: 1, lng: 2 })),
        selectStartPosition: vi.fn(() => Promise.resolve({ position: { lat: 1, lng: 2 }, options: [] }))
    },
    view: { props: null }
}))

vi.mock('incyclist-services', () => ({ useFreeRideService: () => service }))
vi.mock('./FreeRideSettingsView', () => ({
    FreeRideSettingsView: (props) => { view.props = props; return <div data-testid='view' /> }
}))

import { FreeRideSettingsDialog } from './FreeRideSettings'

describe('FreeRideSettingsDialog', () => {
    const card = { accept: vi.fn(() => ({ type: 'Free-Ride' })), cancel: vi.fn() }

    beforeEach(() => { vi.clearAllMocks() })

    test('computes the start position once per opening', async () => {
        render(<FreeRideSettingsDialog card={card} onStart={vi.fn()} onCancel={vi.fn()} />)
        await waitFor(() => expect(service.selectStartPosition).toHaveBeenCalledTimes(1))

        // starting must not trigger another calculation: it could finish after the ride has started
        await act(async () => { view.props.onStart({ id: 'x' }) })
        expect(service.selectStartPosition).toHaveBeenCalledTimes(1)
    })

    test('cancelling does not trigger another calculation either', async () => {
        render(<FreeRideSettingsDialog card={card} onStart={vi.fn()} onCancel={vi.fn()} />)
        await waitFor(() => expect(service.selectStartPosition).toHaveBeenCalledTimes(1))

        await act(async () => { view.props.onCancel() })
        expect(service.selectStartPosition).toHaveBeenCalledTimes(1)
    })

    test('a chosen position is passed with its source and the search text is not forwarded', async () => {
        render(<FreeRideSettingsDialog card={card} onStart={vi.fn()} onCancel={vi.fn()} />)
        await waitFor(() => expect(service.selectStartPosition).toHaveBeenCalledTimes(1))

        await act(async () => { view.props.onChange({ lat: 10, lng: 20, address: 'Somewhere 1', query: 'Somewhere' }) })

        expect(service.selectStartPosition).toHaveBeenLastCalledWith({ lat: 10, lng: 20 }, { source: 'search' })
    })
})
