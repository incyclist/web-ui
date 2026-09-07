import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { mockRideService } = vi.hoisted(() => {
    const mockRideService = {
        adjustPower: vi.fn(),
        isOverlayPinned: vi.fn(() => false),
        setOverlayPinned: vi.fn(),
    }

    return { mockRideService }
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
        mockRideService.isOverlayPinned.mockReturnValue(false)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderControl = () => render(<ShiftingControl visible={true} justify='center' />)

    test('reads the persisted pinned state for the "shifting" overlay on mount', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        expect(mockRideService.isOverlayPinned).toHaveBeenCalledWith('shifting')
    })

    test('renders already pinned when the service reports it as pinned', async () => {
        mockRideService.isOverlayPinned.mockReturnValue(true)
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        expect(document.getElementById('unpin')).toBeInTheDocument()
        expect(document.getElementById('pin')).not.toBeInTheDocument()
    })

    test('persists the pinned state via the service when the user pins the overlay', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))

        expect(mockRideService.setOverlayPinned).toHaveBeenCalledWith('shifting', true)
    })

    test('persists the pinned state via the service when the user unpins the overlay', async () => {
        mockRideService.isOverlayPinned.mockReturnValue(true)
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('unpin'))

        expect(mockRideService.setOverlayPinned).toHaveBeenCalledWith('shifting', false)
    })
})
