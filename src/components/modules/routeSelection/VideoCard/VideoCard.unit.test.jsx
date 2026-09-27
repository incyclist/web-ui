import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

const { mockRouteList } = vi.hoisted(() => ({
    mockRouteList: { getRouteDetails: vi.fn() },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useRouteList: () => mockRouteList,
    }
})

// the heavy row content (Leaflet map, react-vis chart) is stubbed - these suites are about when it is
// mounted and where its points come from, not about rendering a real map/chart
vi.mock('../../../molecules/Maps', () => ({
    FreeMap: ({ points }) => <div data-testid='map' data-points={points?.length ?? 0} />,
}))
vi.mock('../../elevation/ElevationPreview', () => ({
    ElevationPreview: ({ points }) => <div data-testid='elevation' data-points={points?.length ?? 0} />,
}))
vi.mock('react-world-flags', () => ({ default: () => null }))

import { VideoSummary } from './summary'
import { VideoDetails } from './details'
import { routeDetailsQueue } from '../../../../utils/routeDetailsLoader'

const points = [{ lat: 1, lng: 2, routeDistance: 0, elevation: 10 }, { lat: 1.1, lng: 2.1, routeDistance: 100, elevation: 12 }]
const baseProps = { id: 'route-1', title: 'Col de la Madone', visible: true, initialized: true, hasVideo: false, loaded: false }

describe('VideoCard summary/details - shape store wiring', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        routeDetailsQueue.reset()
    })

    describe('VideoSummary', () => {

        test('a shape in the display props is used without loading details', () => {
            render(<VideoSummary {...baseProps} shape={points} />)

            expect(mockRouteList.getRouteDetails).not.toHaveBeenCalled()
            expect(screen.getByTestId('map').dataset.points).toBe('2')
            expect(screen.getByTestId('elevation').dataset.points).toBe('2')
        })

        test('no shape falls back to loading details', async () => {
            mockRouteList.getRouteDetails.mockResolvedValue({ points })
            render(<VideoSummary {...baseProps} />)

            await act(async () => { })

            expect(mockRouteList.getRouteDetails).toHaveBeenCalledWith('route-1')
            expect(screen.getByTestId('map').dataset.points).toBe('2')
        })
    })

    describe('VideoDetails', () => {

        test('a shape in the display props is used without loading details', () => {
            render(<VideoDetails {...baseProps} shape={points} />)

            expect(mockRouteList.getRouteDetails).not.toHaveBeenCalled()
            expect(screen.getByTestId('map').dataset.points).toBe('2')
        })

        test('no shape falls back to loading details', async () => {
            mockRouteList.getRouteDetails.mockResolvedValue({ points })
            render(<VideoDetails {...baseProps} />)

            await act(async () => { })

            expect(mockRouteList.getRouteDetails).toHaveBeenCalledWith('route-1')
            expect(screen.getByTestId('map').dataset.points).toBe('2')
        })
    })

    describe('Summary and Details mounted concurrently for the same route (Card.jsx renders both)', () => {

        test('one details request is shared - both sides render the result', async () => {
            mockRouteList.getRouteDetails.mockResolvedValue({ points })

            render(<>
                <VideoSummary {...baseProps} />
                <VideoDetails {...baseProps} />
            </>)

            expect(mockRouteList.getRouteDetails).toHaveBeenCalledTimes(1)

            await act(async () => { })

            const maps = screen.getAllByTestId('map')
            expect(maps).toHaveLength(2)
            maps.forEach(m => expect(m.dataset.points).toBe('2'))
        })
    })
})
