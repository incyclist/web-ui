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
        useAppState: () => ({ hasFeature: () => false }),
        useAppsService: () => ({ getName: (s) => s }),
    }
})

// the heavy row content (Leaflet map, react-vis chart) is stubbed - this suite is about when it is mounted
vi.mock('../../../molecules/Maps', () => ({
    FreeMap: ({ points }) => <div data-testid='map' data-points={points?.length} />,
}))
vi.mock('../../elevation/ElevationPreview', () => ({
    ElevationPreview: ({ points }) => <div data-testid='elevation' data-points={points?.length ?? 0} />,
}))
vi.mock('react-world-flags', () => ({ default: () => null }))

import { RouteItem } from './index'
import { routeDetailsQueue, ROUTE_DETAILS_CONCURRENCY } from '../../../../utils/routeDetailsLoader'

const points = [{ lat: 1, lng: 2, routeDistance: 0, elevation: 10 }, { lat: 1.1, lng: 2.1, routeDistance: 100, elevation: 12 }]
const route = { id: 'route-1', title: 'Col de la Madone', ready: true, hasVideo: false, loaded: false }

const deferred = () => {
    let resolve
    const promise = new Promise(r => { resolve = r })
    return { promise, resolve }
}

describe('RouteItem', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        routeDetailsQueue.reset()
    })

    test('outside the fold it renders a skeleton and loads nothing', () => {
        render(<RouteItem {...route} outsideFold={true} />)

        expect(screen.getByTestId('route-item-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('map')).toBeNull()
        expect(mockRouteList.getRouteDetails).not.toHaveBeenCalled()
    })

    test('inside the fold it loads the details and shows map and elevation', async () => {
        mockRouteList.getRouteDetails.mockResolvedValue({ points })
        render(<RouteItem {...route} outsideFold={false} />)

        await act(async () => { })

        expect(mockRouteList.getRouteDetails).toHaveBeenCalledWith('route-1')
        expect(screen.getByTestId('map').dataset.points).toBe('2')
        expect(screen.getByTestId('elevation').dataset.points).toBe('2')
    })

    test('leaving the fold unmounts the map; re-entering loads and shows it again', async () => {
        mockRouteList.getRouteDetails.mockResolvedValue({ points })
        const { rerender } = render(<RouteItem {...route} outsideFold={false} />)
        await act(async () => { })
        expect(screen.getByTestId('map')).toBeInTheDocument()

        rerender(<RouteItem {...route} outsideFold={true} />)
        expect(screen.queryByTestId('map')).toBeNull()
        expect(screen.getByTestId('route-item-skeleton')).toBeInTheDocument()

        // details are cached by the service by now - resolves immediately
        rerender(<RouteItem {...route} outsideFold={false} />)
        await act(async () => { })

        expect(mockRouteList.getRouteDetails).toHaveBeenCalledTimes(2)
        expect(screen.getByTestId('map').dataset.points).toBe('2')
    })

    test('details arriving after the row has left the fold are dropped', async () => {
        const first = deferred()
        mockRouteList.getRouteDetails.mockReturnValueOnce(first.promise)

        const { rerender } = render(<RouteItem {...route} outsideFold={false} />)
        rerender(<RouteItem {...route} outsideFold={true} />)

        await act(async () => { first.resolve({ points }) })

        // back inside: the late result of the first request must not be used, a new one is made
        const second = deferred()
        mockRouteList.getRouteDetails.mockReturnValueOnce(second.promise)
        rerender(<RouteItem {...route} outsideFold={false} />)
        expect(screen.getByTestId('elevation').dataset.points).toBe('0')

        await act(async () => { second.resolve({ points: [points[0]] }) })
        expect(screen.getByTestId('map').dataset.points).toBe('1')
    })

    test('points already in the display props are used without loading details', () => {
        render(<RouteItem {...route} loaded={true} points={points} outsideFold={false} />)

        expect(mockRouteList.getRouteDetails).not.toHaveBeenCalled()
        expect(screen.getByTestId('map').dataset.points).toBe('2')
    })

    test('a shape in the display props is used without loading details', () => {
        render(<RouteItem {...route} shape={points} outsideFold={false} />)

        expect(mockRouteList.getRouteDetails).not.toHaveBeenCalled()
        expect(screen.getByTestId('map').dataset.points).toBe('2')
        expect(screen.getByTestId('elevation').dataset.points).toBe('2')
    })

    describe('bounding the backfill fetch concurrency', () => {

        const neverResolves = () => new Promise(() => { })

        test('no more than the concurrency cap is in flight at once', () => {
            mockRouteList.getRouteDetails.mockImplementation(neverResolves)

            Array.from({ length: ROUTE_DETAILS_CONCURRENCY + 3 }).forEach((_, i) => {
                render(<RouteItem {...route} id={`route-${i}`} outsideFold={false} />)
            })

            expect(mockRouteList.getRouteDetails).toHaveBeenCalledTimes(ROUTE_DETAILS_CONCURRENCY)
        })

        test('a row leaving the fold before its turn is dequeued outright, not just ignored', async () => {
            const pending = []
            mockRouteList.getRouteDetails.mockImplementation((id) => new Promise((resolve) => { pending.push({ id, resolve }) }))

            // fill every concurrency slot with rows that stay in the fold
            Array.from({ length: ROUTE_DETAILS_CONCURRENCY }).forEach((_, i) => {
                render(<RouteItem {...route} id={`active-${i}`} outsideFold={false} />)
            })

            // one more row, still waiting for a free slot
            const { rerender } = render(<RouteItem {...route} id='queued-route' outsideFold={false} />)

            expect(mockRouteList.getRouteDetails).toHaveBeenCalledTimes(ROUTE_DETAILS_CONCURRENCY)
            expect(mockRouteList.getRouteDetails).not.toHaveBeenCalledWith('queued-route')

            // it leaves the fold before ever being started
            rerender(<RouteItem {...route} id='queued-route' outsideFold={true} />)

            // free up a slot - if 'queued-route' were merely ignored rather than dequeued, this would start it
            await act(async () => { pending[0].resolve({ points }) })

            expect(mockRouteList.getRouteDetails).not.toHaveBeenCalledWith('queued-route')
            expect(mockRouteList.getRouteDetails).toHaveBeenCalledTimes(ROUTE_DETAILS_CONCURRENCY)
        })
    })
})
