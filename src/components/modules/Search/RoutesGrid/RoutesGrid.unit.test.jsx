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
    VideoCard: ({ id, outsideFold, onClick, onDelete, onOK }) => (
        <div data-testid={`card-${id}`} data-outside={String(outsideFold)} onClick={onClick}>
            <button data-testid={`delete-${id}`} onClick={onDelete} />
            <button data-testid={`ok-${id}`} onClick={onOK} />
        </div>
    ),
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

    test('the delete button of a tile hands the route id to onDelete, without selecting the route', () => {
        const onDelete = vi.fn()
        const onSelect = vi.fn()
        render(<RoutesGrid cards={cards} onSelect={onSelect} onDelete={onDelete} />)

        fireEvent.click(screen.getByTestId('delete-c5'))

        expect(onDelete).toHaveBeenCalledWith('c5')
        expect(onSelect).not.toHaveBeenCalled()
    })

    test('the OK button of a tile selects the route (opens its details)', () => {
        const onSelect = vi.fn()
        render(<RoutesGrid cards={cards} onSelect={onSelect} />)

        fireEvent.click(screen.getByTestId('ok-c7'))

        expect(onSelect).toHaveBeenCalledWith('c7')
    })
})
