import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

const { features } = vi.hoisted(() => ({ features: {} }))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useAppState: () => ({ hasFeature: (name) => features[name] ?? false }) }
})

vi.mock('./page', () => ({ RouteListPage: () => <div data-testid='merged-page' /> }))
vi.mock('../routes', () => ({ RoutesPage: () => <div data-testid='carousel-page' /> }))
vi.mock('../search', () => ({ SearchPage: () => <div data-testid='search-page' /> }))

import { RoutesPageEntry, SearchPageEntry } from './switch'

const renderAt = (path) => render(
    <MemoryRouter initialEntries={[path]}>
        <Routes>
            <Route path='/routes' element={<RoutesPageEntry/>} />
            <Route path='/search' element={<SearchPageEntry/>} />
        </Routes>
    </MemoryRouter>
)

describe('route page entries', () => {

    beforeEach(() => {
        delete features.NEW_SEARCH_UI
    })

    describe('NEW_SEARCH_UI enabled', () => {

        beforeEach(() => { features.NEW_SEARCH_UI = true })

        test('/routes renders the merged page', () => {
            renderAt('/routes')
            expect(screen.getByTestId('merged-page')).toBeInTheDocument()
        })

        test('/search renders the merged page as well', () => {
            renderAt('/search')
            expect(screen.getByTestId('merged-page')).toBeInTheDocument()
        })
    })

    describe('NEW_SEARCH_UI disabled', () => {

        test('/routes renders the classic carousel page', () => {
            renderAt('/routes')
            expect(screen.getByTestId('carousel-page')).toBeInTheDocument()
            expect(screen.queryByTestId('merged-page')).toBeNull()
        })

        test('/search renders the classic search page', () => {
            renderAt('/search')
            expect(screen.getByTestId('search-page')).toBeInTheDocument()
            expect(screen.queryByTestId('merged-page')).toBeNull()
        })
    })
})
