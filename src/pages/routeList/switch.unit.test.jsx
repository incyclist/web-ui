import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'

vi.mock('./page', () => ({ RouteListPage: () => <div data-testid='merged-page' /> }))

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

    test('/routes renders the merged page', () => {
        renderAt('/routes')
        expect(screen.getByTestId('merged-page')).toBeInTheDocument()
    })

    test('/search renders the merged page as well', () => {
        renderAt('/search')
        expect(screen.getByTestId('merged-page')).toBeInTheDocument()
    })
})
