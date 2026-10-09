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

// rows are stubbed - this suite covers the table's wiring to the fold window
vi.mock('../RouteItem', () => ({
    RouteItem: ({ id, outsideFold, onClick }) => <div data-testid={`row-${id}`} data-outside={String(outsideFold)} onClick={onClick} />,
}))
vi.mock('../RouteListItem', () => ({
    RouteListItem: ({ id, outsideFold, onClick }) => <div data-testid={`modern-row-${id}`} data-outside={String(outsideFold)} onClick={onClick} />,
}))

import { RoutesTable } from './index'

const routes = Array.from({ length: 30 }, (_, i) => ({ id: `r${i}`, title: `Route ${i}` }))

describe('RoutesTable', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('renders every route, folding in only the ones inside the fold', () => {
        render(<RoutesTable routes={routes} />)

        expect(screen.getAllByTestId(/^row-/)).toHaveLength(30)
        // no layout in jsdom: the geometry is unknown, so nothing is folded in yet
        expect(screen.getByTestId('row-r0').dataset.outside).toBe('true')
    })

    test('restores and stores the scroll position of the list view', () => {
        mockRouteList.getListTop.mockReturnValue(0)
        const { container } = render(<RoutesTable routes={routes} />)

        expect(mockRouteList.getListTop).toHaveBeenCalledWith('list')

        const div = container.querySelector('.routes')
        act(() => {
            div.scrollTop = 42
            div.dispatchEvent(new Event('scroll'))
        })
        expect(mockRouteList.setListTop).toHaveBeenCalledWith('list', 42)
    })

    test('selects a route on click', () => {
        const onSelect = vi.fn()
        render(<RoutesTable routes={routes} onSelect={onSelect} />)

        fireEvent.click(screen.getByTestId('row-r3'))
        expect(onSelect).toHaveBeenCalledWith('r3')
    })

    test('uses the modern row only for the combined route list', () => {
        render(<RoutesTable routes={routes.slice(0, 2)} variant='routeList' />)
        expect(screen.getAllByTestId(/^modern-row-/)).toHaveLength(2)
        expect(screen.queryByTestId('row-r0')).toBeNull()
    })
})
