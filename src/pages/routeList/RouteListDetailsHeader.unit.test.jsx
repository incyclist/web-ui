import React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../../components/molecules', async importOriginal => ({
    ...await importOriginal(),
    FreeMap: () => <div data-testid='route-map' />,
    ElevationGraph: () => <div data-testid='elevation-profile' />,
    VideoProbe: () => null,
}))

vi.mock('../../components/modules/video', async importOriginal => ({
    ...await importOriginal(),
    VideoPreview: () => <div data-testid='video-preview' />,
}))

import { RouteDetails } from '../../components/modules/routeSelection/RouteDetails/component'
import { RouteListDetailsHeader } from '../../components/molecules/RouteListDetailsHeader'

const points = Array.from({ length: 10 }, (_, index) => ({
    lat: 46 + index / 1000, lng: 11, routeDistance: index * 100, elevation: 500 + index,
}))

const route = {
    description: {
        id: 'route-1', title: 'Passo Pordoi', country: 'IT', hasGpx: true,
        hasVideo: true, previewUrl: '/pordoi.jpg', videoUrl: '/pordoi.mp4', videoFormat: 'mp4',
        distance: 13000, elevation: 772, points,
    },
    details: { points },
}

const props = {
    route, DetailsHeader: RouteListDetailsHeader,
    totalDistance: { value: 13, unit: 'km' },
    totalElevation: { value: 772, unit: 'm' },
    startPos: { value: 0, unit: 'km' },
    isNew: true, cntActive: 12, onCancel: vi.fn(),
}

describe('RouteList details presentation', () => {
    test('shows the new overview and keeps the existing map, elevation and ride controls', () => {
        const { container } = render(<RouteDetails {...props} />)

        expect(screen.getByRole('heading', { name: 'Passo Pordoi' })).toBeInTheDocument()
        expect(screen.getByText('Italy')).toBeInTheDocument()
        expect(screen.getByText('· New')).toBeInTheDocument()
        expect(screen.getByText('· 12 live')).toBeInTheDocument()
        expect(screen.getByLabelText('Route overview')).toHaveTextContent('13 km')
        expect(screen.getByLabelText('Route overview')).toHaveTextContent('772 m')
        expect(container.querySelector('img[src="/pordoi.jpg"]')).toBeInTheDocument()
        expect(screen.getByTestId('route-map')).toBeInTheDocument()
        expect(screen.getByTestId('elevation-profile')).toBeInTheDocument()
        expect(screen.getByLabelText('Elevation profile')).toContainElement(screen.getByTestId('elevation-profile'))
        expect(screen.getByText('Start at')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    test('falls back to the elevation panel when the preview image fails', () => {
        const { container } = render(<RouteDetails {...props} />)
        fireEvent.error(container.querySelector('img[src="/pordoi.jpg"]'))

        expect(container.querySelector('img[src="/pordoi.jpg"]')).not.toBeInTheDocument()
        expect(screen.getByTestId('video-preview')).toBeInTheDocument()
        expect(screen.getByTestId('elevation-profile')).toBeInTheDocument()
    })

    test('does not reserve an empty map panel for a video without GPX', () => {
        const videoOnly = { ...route, description: { ...route.description, hasGpx: false } }
        const { container } = render(<RouteDetails {...props} route={videoOnly} />)
        expect(screen.queryByTestId('route-map')).toBeNull()
        expect(container.querySelector('img[src="/pordoi.jpg"]')).toBeInTheDocument()
        expect(screen.getByLabelText('Elevation profile')).toBeInTheDocument()
    })

    test('leaves the classic dialog unchanged without the NEW_SEARCH_UI header', () => {
        render(<RouteDetails {...props} DetailsHeader={undefined} />)

        expect(screen.queryByRole('heading', { name: 'Passo Pordoi' })).not.toBeInTheDocument()
        expect(screen.getByText('Distance')).toBeInTheDocument()
        expect(screen.queryByLabelText('Route overview')).not.toBeInTheDocument()
    })
})
