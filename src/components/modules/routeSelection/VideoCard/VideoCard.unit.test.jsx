import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

const { mockRouteList } = vi.hoisted(() => ({
    mockRouteList: { requestRouteDetails: vi.fn() },
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

const points = [{ lat: 1, lng: 2, routeDistance: 0, elevation: 10 }, { lat: 1.1, lng: 2.1, routeDistance: 100, elevation: 12 }]
const baseProps = { id: 'route-1', title: 'Col de la Madone', visible: true, initialized: true, hasVideo: false, loaded: false }

// RouteListService.requestRouteDetails() (bounded, de-duplicated, cancellable) is covered in
// incyclist-services - here it is only the card's use of it that is tested
const answerWith = (details) => {
    mockRouteList.requestRouteDetails.mockImplementation((id, onResult) => {
        Promise.resolve().then(() => onResult(details))
        return vi.fn()
    })
}

describe('VideoCard summary/details - shape store wiring', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('VideoSummary', () => {

        test('a shape in the display props is used without loading details', () => {
            render(<VideoSummary {...baseProps} shape={points} />)

            expect(mockRouteList.requestRouteDetails).not.toHaveBeenCalled()
            expect(screen.getByTestId('map').dataset.points).toBe('2')
            expect(screen.getByTestId('elevation').dataset.points).toBe('2')
        })

        test('no shape falls back to loading details', async () => {
            answerWith({ points })
            render(<VideoSummary {...baseProps} />)

            await act(async () => { })

            expect(mockRouteList.requestRouteDetails).toHaveBeenCalledWith('route-1', expect.any(Function))
            expect(screen.getByTestId('map').dataset.points).toBe('2')
        })
    })

    describe('VideoDetails', () => {

        test('a shape in the display props is used without loading details', () => {
            render(<VideoDetails {...baseProps} shape={points} />)

            expect(mockRouteList.requestRouteDetails).not.toHaveBeenCalled()
            expect(screen.getByTestId('map').dataset.points).toBe('2')
        })

        test('no shape falls back to loading details', async () => {
            answerWith({ points })
            render(<VideoDetails {...baseProps} />)

            await act(async () => { })

            expect(mockRouteList.requestRouteDetails).toHaveBeenCalledWith('route-1', expect.any(Function))
            expect(screen.getByTestId('map').dataset.points).toBe('2')
        })
    })

    describe('Summary and Details mounted concurrently for the same route (Card.jsx renders both)', () => {

        test('both sides request the details of their route and render the result', async () => {
            answerWith({ points })

            render(<>
                <VideoSummary {...baseProps} />
                <VideoDetails {...baseProps} />
            </>)

            // sharing the load is up to the service: both sides ask for the same route id
            expect(mockRouteList.requestRouteDetails).toHaveBeenCalledTimes(2)
            expect(mockRouteList.requestRouteDetails.mock.calls.every(([id]) => id === 'route-1')).toBe(true)

            await act(async () => { })

            const maps = screen.getAllByTestId('map')
            expect(maps).toHaveLength(2)
            maps.forEach(m => expect(m.dataset.points).toBe('2'))
        })

        test('a failed load ends the loading state on both sides', async () => {
            answerWith(undefined)

            render(<>
                <VideoSummary {...baseProps} />
                <VideoDetails {...baseProps} />
            </>)
            await act(async () => { })

            expect(screen.queryByTestId('map')).toBeNull()
        })
    })
})
