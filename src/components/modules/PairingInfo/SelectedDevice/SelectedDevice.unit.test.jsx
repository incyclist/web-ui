import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, queryByText, fireEvent } from '@testing-library/react'
import { SelectedDevice } from './index'

describe('SelectedDevice dimmed (kept, but not used while the ride falls back to another device)', ()=> {

    const dimmedTile = (overrides={}) => (
        <SelectedDevice title="Resistance" capability="control" deviceName="Tacx Flux" connectState="failed" value={0} unit="W"
            dimmed={true} roleLabel="Your trainer" trainerRole="trainer" footerText="Tap to use again" {...overrides} />
    )

    // the tile element: the title's container
    const tileOf = (getByText) => getByText('Resistance').parentElement

    test('renders no toggle, even when the service still hands over toggle handlers', ()=> {
        const { queryByRole } = render(dimmedTile({ onUnselect: vi.fn(), onUse: vi.fn() }))

        expect(queryByRole('switch')).toBeNull()
    })

    test('shows the device and the service\'s role line and footer copy, but no value', ()=> {
        const { getByText, container } = render(dimmedTile())

        expect(getByText('Tacx Flux')).toBeTruthy()
        expect(getByText('Your trainer')).toBeTruthy()
        expect(getByText('Tap to use again')).toBeTruthy()
        expect(queryByText(container, '0')).toBeNull()
    })

    test('uses the same muted look as a switched-off tile, not the connected one', ()=> {
        const dimmed = render(dimmedTile())
        const dimmedBackground = getComputedStyle(tileOf(dimmed.getByText)).background
        dimmed.unmount()

        const off = render(<SelectedDevice title="Resistance" capability="control" deviceName="Tacx Flux" disabled={true} footer="Not used" />)
        const offBackground = getComputedStyle(tileOf(off.getByText)).background
        off.unmount()

        const connected = render(<SelectedDevice title="Resistance" capability="control" deviceName="Tacx Flux" connectState="connected" />)
        const connectedBackground = getComputedStyle(tileOf(connected.getByText)).background

        expect(dimmedBackground).toBe(offBackground)
        expect(dimmedBackground).not.toBe(connectedBackground)
    })

    test('a click on the tile calls its own onClick, whatever the service bound to it', ()=> {
        const onClick = vi.fn()
        const { getByText } = render(dimmedTile({ onClick }))

        fireEvent.click(tileOf(getByText))

        expect(onClick).toHaveBeenCalledTimes(1)
    })
})

describe('SelectedDevice while the helper is open (compact)', ()=> {

    const icon = (container) => container.querySelector('svg.octicon-check')

    test('a connected tile keeps its connect-state icon while the helper is closed', ()=> {
        const { container } = render(
            <SelectedDevice title="Power" capability="power" deviceName="Tacx Neo" connectState="connected" />
        )

        expect(icon(container)).not.toBeNull()
    })

    test('a compact tile passes compact on to its footer, which then drops the icon', ()=> {
        const { container, getByText } = render(
            <SelectedDevice title="Power" capability="power" deviceName="Tacx Neo" connectState="connected" compact={true} />
        )

        expect(getByText('connected')).toBeTruthy()
        expect(icon(container)).toBeNull()
    })
})

describe('SelectedDevice T16 (switched off, device remembered)', ()=> {

    test('a normal selected device shows its value', ()=> {
        const { getByText } = render(
            <SelectedDevice title="Power" capability="power" deviceName="Tacx Neo" value={212} unit="W" connectState="connected" />
        )

        expect(getByText('212')).toBeTruthy()
        expect(getByText('Tacx Neo')).toBeTruthy()
    })

    test('a switched-off device still shows its name, but no value', ()=> {
        const { getByText, container } = render(
            <SelectedDevice title="Power" capability="power" deviceName="Tacx Neo" value={212} unit="W" disabled={true} footer="Not used" />
        )

        expect(getByText('Tacx Neo')).toBeTruthy()
        expect(queryByText(container, '212')).toBeNull()
    })
})
