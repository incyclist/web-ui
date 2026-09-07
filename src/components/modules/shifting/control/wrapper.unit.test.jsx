import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

// Minimal stand-in for incyclist-services' Observer (on/off/emit, chainable .on()).
const { FakeObserver, mockRideService } = vi.hoisted(() => {
    class FakeObserver {
        constructor() { this.listeners = {} }
        on(event, cb) { (this.listeners[event] ??= []).push(cb); return this }
        off(event, cb) { this.listeners[event] = (this.listeners[event] ?? []).filter(l => l !== cb); return this }
        emit(event, ...args) { (this.listeners[event] ?? []).slice().forEach(cb => cb(...args)) }
    }

    const mockRideService = {
        adjustPower: vi.fn(),
        getDisplayProperties: vi.fn(() => ({ shiftingPinned: false })),
        getObserver: () => mockRideService.__observer,
        setOverlayPinned: vi.fn(),
        __observer: new FakeObserver(),
    }

    return { FakeObserver, mockRideService }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useRideDisplay: () => mockRideService,
    }
})

import { ShiftingControl } from './wrapper'

describe('ShiftingControl pin persistence', () => {

    beforeEach(() => {
        mockRideService.getDisplayProperties.mockReturnValue({ shiftingPinned: false })
        // fresh observer per test - avoids listeners from a previous test's unmounted
        // component tree still firing (and calling stale state setters) on emit()
        mockRideService.__observer = new FakeObserver()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderControl = () => render(<ShiftingControl visible={true} justify='center' />)

    test('reads the persisted pinned state for the "shifting" overlay on mount', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        expect(mockRideService.getDisplayProperties).toHaveBeenCalled()
        expect(document.getElementById('pin')).toBeInTheDocument()
    })

    test('renders already pinned when the service reports it as pinned', async () => {
        mockRideService.getDisplayProperties.mockReturnValue({ shiftingPinned: true })
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        expect(document.getElementById('unpin')).toBeInTheDocument()
        expect(document.getElementById('pin')).not.toBeInTheDocument()
    })

    test('only calls the service when the user pins the overlay - no local state is flipped directly', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))

        expect(mockRideService.setOverlayPinned).toHaveBeenCalledWith('shifting', true)
        // no service round-trip yet -> UI must still show the pre-click (unpinned) state
        expect(document.getElementById('pin')).toBeInTheDocument()
    })

    test('reflects the pinned state once the service emits overlay-update, without a local pinned flag', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))
        act(() => {
            mockRideService.__observer.emit('overlay-update', { shiftingPinned: true })
        })

        expect(document.getElementById('unpin')).toBeInTheDocument()
    })

    test('un-pins only via the service round-trip', async () => {
        mockRideService.getDisplayProperties.mockReturnValue({ shiftingPinned: true })
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('unpin'))
        expect(mockRideService.setOverlayPinned).toHaveBeenCalledWith('shifting', false)

        act(() => {
            mockRideService.__observer.emit('overlay-update', { shiftingPinned: false })
        })

        expect(document.getElementById('pin')).toBeInTheDocument()
    })
})
