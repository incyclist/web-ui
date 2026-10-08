import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { routeList } = vi.hoisted(() => ({ routeList: { requestRouteDetails: vi.fn() } }))
vi.mock('incyclist-services', async importOriginal => ({
    ...await importOriginal(), useRouteList: () => routeList
}))
vi.mock('../../components/molecules/Maps', () => ({
    FreeMap: ({ points }) => <div data-testid='map' data-points={points?.length ?? 0} />
}))
vi.mock('react-world-flags', () => ({ default: () => null }))

import { RouteTileSummary } from '../../components/modules/Search/RouteTileSummary'

const points = [
    { lat: 1, lng: 2, routeDistance: 0, elevation: 10 },
    { lat: 1.1, lng: 2.1, routeDistance: 100, elevation: 12 }
]
const props = { id: 'route-1', title: 'Col de la Madone', visible: true, loaded: true, hasVideo: false }

describe('RouteTileSummary', () => {
    beforeEach(() => vi.clearAllMocks())

    test('prefers a video preview, then falls back to the route map when the image fails', () => {
        render(<RouteTileSummary {...props} hasVideo previewUrl='https://example.com/preview.jpg' shape={points} />)
        const preview = screen.getByRole('img', { name: 'Col de la Madone' })
        expect(preview).toHaveAttribute('src', 'https://example.com/preview.jpg')
        expect(screen.queryByTestId('map')).toBeNull()
        fireEvent.error(preview)
        expect(screen.getByTestId('map')).toHaveAttribute('data-points', '2')
    })

    test('renders a GPX map and elevation profile when shape data is available', () => {
        render(<RouteTileSummary {...props} shape={points} />)
        expect(screen.getByTestId('map')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Elevation profile' })).toBeInTheDocument()
    })

    test('renders a media placeholder when neither preview nor coordinates are available', () => {
        render(<RouteTileSummary {...props} hasVideo />)
        expect(screen.getByText('Video Route')).toBeInTheDocument()
    })

    test('shows only status values provided by the route service', () => {
        render(<RouteTileSummary {...props} isNew isDemo cntActive={5} videoPill='in-icloud'
            totalDistance={{ value: 25.4, unit: 'km' }} totalElevation={{ value: 450, unit: 'm' }} />)
        expect(screen.getByText('New')).toBeInTheDocument()
        expect(screen.getByText('Demo')).toBeInTheDocument()
        expect(screen.getByText('5 live')).toBeInTheDocument()
        expect(screen.getByText('In iCloud')).toBeInTheDocument()
        expect(screen.getByText('25.4 km')).toBeInTheDocument()
        expect(screen.getByText('450 m')).toBeInTheDocument()
        expect(screen.queryByText(/ride[s]?$/)).toBeNull()
    })

    test('opens details and requires confirmation before deleting an eligible route', async () => {
        const onOK = vi.fn(), onDelete = vi.fn()
        const { rerender } = render(<RouteTileSummary {...props} onOK={onOK} onDelete={onDelete} canDelete={false} />)
        expect(screen.queryByRole('button', { name: 'Delete Col de la Madone' })).toBeNull()

        rerender(<RouteTileSummary {...props} onOK={onOK} onDelete={onDelete} canDelete />)
        fireEvent.click(screen.getByRole('button', { name: 'View details for Col de la Madone' }))
        expect(onOK).toHaveBeenCalledOnce()
        fireEvent.click(screen.getByRole('button', { name: 'Delete Col de la Madone' }))
        expect(onDelete).not.toHaveBeenCalled()
        await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true })))
        expect(onDelete).toHaveBeenCalledOnce()
    })

    test('keeps a sized placeholder for an invisible route', () => {
        const { container } = render(<RouteTileSummary {...props} visible={false} width={280} height={520} />)
        expect(screen.getByTestId('card-skeleton')).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle({ width: '280px', height: '520px' })
    })
})
