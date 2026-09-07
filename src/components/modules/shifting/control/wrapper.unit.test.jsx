import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { mockRideService, mockUserSettings } = vi.hoisted(() => {
    const mockRideService = {
        adjustPower: vi.fn(),
    }

    const mockUserSettings = {
        getValue: vi.fn(() => false),
        set: vi.fn(),
    }

    return { mockRideService, mockUserSettings }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useRideDisplay: () => mockRideService,
        useUserSettings: () => mockUserSettings,
    }
})

import { ShiftingControl } from './wrapper'

describe('ShiftingControl pin persistence', () => {

    beforeEach(() => {
        mockUserSettings.getValue.mockReturnValue(false)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const renderControl = () => render(<ShiftingControl visible={true} justify='center' />)

    test('reads the persisted pinned state on mount', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        expect(mockUserSettings.getValue).toHaveBeenCalledWith('preferences.shifting.pinned', false)
    })

    test('renders already pinned when the persisted setting is true', async () => {
        mockUserSettings.getValue.mockReturnValue(true)
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        expect(document.getElementById('unpin')).toBeInTheDocument()
        expect(document.getElementById('pin')).not.toBeInTheDocument()
    })

    test('persists the pinned state when the user pins the overlay', async () => {
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('pin'))

        expect(mockUserSettings.set).toHaveBeenCalledWith('preferences.shifting.pinned', true)
    })

    test('persists the pinned state when the user unpins the overlay', async () => {
        mockUserSettings.getValue.mockReturnValue(true)
        renderControl()
        expect(await screen.findByText('+1')).toBeInTheDocument()

        fireEvent.click(document.getElementById('unpin'))

        expect(mockUserSettings.set).toHaveBeenCalledWith('preferences.shifting.pinned', false)
    })
})
