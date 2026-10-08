import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

const { mockUI } = vi.hoisted(() => ({
    mockUI: { toggleFullscreen: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useAppState: () => ({ hasFeature: () => false, getPersistedState: () => 'routes' }),
    }
})

vi.mock('../../../bindings/native-ui', () => ({ useAppUI: () => mockUI }))
vi.mock('../../modules/Settings', () => ({ UserSettingsDialog: () => null, SettingsDialog: () => null }))

import { NavigationBarComponent } from './index'

const renderBar = (props={}) => render(
    <MemoryRouter>
        <NavigationBarComponent height={800} width='120px' selected='routes' {...props} />
    </MemoryRouter>
)

describe('NavigationBar', () => {

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('shows only Routes, no separate Search icon', () => {
        renderBar()
        expect(screen.queryByText('Search')).toBeNull()
        expect(screen.getByText('Routes')).toBeInTheDocument()
    })

    test('f toggles fullscreen, Ctrl+F does not', () => {
        renderBar()

        act(() => { window.dispatchEvent(new KeyboardEvent('keyup', {key:'f', ctrlKey:true})) })
        expect(mockUI.toggleFullscreen).not.toHaveBeenCalled()

        act(() => { window.dispatchEvent(new KeyboardEvent('keyup', {key:'f'})) })
        expect(mockUI.toggleFullscreen).toHaveBeenCalledTimes(1)
    })
})
