import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'

const { mockRouteList } = vi.hoisted(() => ({
    mockRouteList: { getListTop: vi.fn(), setListTop: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, useRouteList: () => mockRouteList }
})

// cards are stubbed - this suite covers the grid's wiring to the fold window
vi.mock('../../routeSelection/VideoCard', () => ({
    VideoCard: ({ id, outsideFold, onClick }) => <div data-testid={`card-${id}`} data-outside={String(outsideFold)} onClick={onClick} />,
}))
vi.mock('../../routeSelection/FreeRideCard', () => ({ FreeRideCard: () => null }))
vi.mock('../../routeSelection/UploadCard', () => ({ UploadCard: () => null }))
vi.mock('../../routeSelection/ActiveImportCard', () => ({ ActiveImportCard: () => null }))

import { RoutesGrid } from './index'

const cards = Array.from({ length: 12 }, (_, i) => ({
    id: `c${i}`,
    getCardType: () => 'Route',
    getDisplayProperties: () => ({ title: `Route ${i}` }),
}))

describe('RoutesGrid', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders every card with fold information', () => {
        render(<RoutesGrid cards={cards} />)

        expect(screen.getAllByTestId(/^card-/)).toHaveLength(12)
        expect(screen.getByTestId('card-c0').dataset.outside).toBe('true')
    })

    test('restores and stores the scroll position of the tiles view', () => {
        const { container } = render(<RoutesGrid cards={cards} />)

        expect(mockRouteList.getListTop).toHaveBeenCalledWith('tiles')
        expect(mockRouteList.getListTop).not.toHaveBeenCalledWith('list')

        const div = container.firstChild
        act(() => {
            div.scrollTop = 42
            div.dispatchEvent(new Event('scroll'))
        })
        expect(mockRouteList.setListTop).toHaveBeenCalledWith('tiles', 42)
    })

    test('selects a route on click', () => {
        const onSelect = vi.fn()
        render(<RoutesGrid cards={cards} onSelect={onSelect} />)

        fireEvent.click(screen.getByTestId('card-c5'))
        expect(onSelect).toHaveBeenCalledWith('c5')
    })
})
