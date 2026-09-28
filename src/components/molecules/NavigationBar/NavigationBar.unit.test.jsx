import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

const { features, mockUI } = vi.hoisted(() => ({
    features: {},
    mockUI: { toggleFullscreen: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useAppState: () => ({ hasFeature: (name) => features[name] ?? false, getPersistedState: () => 'routes' }),
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

    beforeEach(() => {
        delete features.NEW_SEARCH_UI
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('shows Search and Routes while NEW_SEARCH_UI is disabled', () => {
        renderBar()
        expect(screen.getByText('Search')).toBeInTheDocument()
        expect(screen.getByText('Routes')).toBeInTheDocument()
    })

    test('shows only Routes while NEW_SEARCH_UI is enabled', () => {
        features.NEW_SEARCH_UI = true
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
