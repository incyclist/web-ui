import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { service } = vi.hoisted(() => ({ service: { requestRouteDetails: vi.fn() } }))
vi.mock('incyclist-services', async importOriginal => ({
    ...await importOriginal(), useRouteList: () => service, useAppsService: () => ({ getName: key => `Source ${key}` }),
}))
vi.mock('../../../molecules/Maps', () => ({
    FreeMap: ({ points }) => <div data-testid='map' data-points={points?.length ?? 0} />,
}))
vi.mock('react-world-flags', () => ({ default: () => null }))

import { RouteListItem } from './index'

const points = [
    { lat: 46, lng: 11, routeDistance: 0, elevation: 1500 },
    { lat: 46.1, lng: 11.1, routeDistance: 13000, elevation: 2272 },
]
const route = {
    id: 'pordoi', title: 'Passo Pordoi', country: 'IT', ready: true, visible: false,
    totalDistance: { value: 13, unit: 'km' }, totalElevation: { value: 772, unit: 'm' },
}

describe('RouteListItem', () => {
    beforeEach(() => vi.clearAllMocks())

    test('keeps a sized placeholder outside the fold without loading details', () => {
        render(<RouteListItem {...route} outsideFold />)
        expect(screen.getByTestId('route-list-item-skeleton')).toBeInTheDocument()
        expect(service.requestRouteDetails).not.toHaveBeenCalled()
    })

    test('shows the card data in a compact list row and opens details', () => {
        const onClick = vi.fn()
        render(<RouteListItem {...route} shape={points} hasVideo isNew isLoop={false} cntActive={12}
            previewUrl='/pordoi.jpg' onClick={onClick} outsideFold={false} />)
        expect(screen.getByRole('article', { name: 'Route Passo Pordoi' })).toBeInTheDocument()
        expect(screen.getByText('13 km')).toBeInTheDocument()
        expect(screen.getByText('772 m')).toBeInTheDocument()
        expect(screen.getByText('12 live')).toBeInTheDocument()
        expect(screen.getByText('Point to point')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Elevation profile' })).toBeInTheDocument()
        fireEvent.error(screen.getByRole('img', { name: 'Passo Pordoi' }))
        expect(screen.getByTestId('map')).toHaveAttribute('data-points', '2')
        fireEvent.click(screen.getByRole('button', { name: 'View details for Passo Pordoi' }))
        expect(onClick).toHaveBeenCalledWith('pordoi')
    })

    test('uses the services label for a route source', () => {
        render(<RouteListItem {...route} shape={points} source='catalog' outsideFold={false} />)
        expect(screen.getByText('Source catalog')).toBeInTheDocument()
    })

    test('requires confirmation before deleting and allows cancellation', () => {
        const onDelete = vi.fn(), onClick = vi.fn()
        render(<RouteListItem {...route} shape={points} canDelete onDelete={onDelete} onClick={onClick} outsideFold={false} />)
        fireEvent.click(screen.getByRole('button', { name: 'Delete Passo Pordoi' }))
        expect(screen.getByRole('alertdialog', { name: 'Delete Passo Pordoi?' })).toBeInTheDocument()
        expect(onDelete).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        expect(screen.queryByRole('alertdialog')).toBeNull()
        fireEvent.click(screen.getByRole('button', { name: 'Delete Passo Pordoi' }))
        fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))
        expect(onDelete).toHaveBeenCalledOnce()
        expect(onClick).not.toHaveBeenCalled()
    })

    test('cancels the details request when the row leaves the fold', async () => {
        const cancel = vi.fn()
        let deliver
        service.requestRouteDetails.mockImplementation((_id, callback) => { deliver = callback; return cancel })
        const { rerender } = render(<RouteListItem {...route} hasVideo={false} outsideFold={false} />)
        expect(service.requestRouteDetails).toHaveBeenCalledWith('pordoi', expect.any(Function))
        rerender(<RouteListItem {...route} hasVideo={false} outsideFold />)
        expect(cancel).toHaveBeenCalledOnce()
        await act(async () => deliver({ points }))
        expect(screen.queryByTestId('map')).toBeNull()
    })
})
