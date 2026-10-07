import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'

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

vi.mock('./usePersonalRoutes', () => ({ usePersonalRoutes: () => ({ isFavorite: false, toggleFavorite: vi.fn() }) }))

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
            expect(screen.getByRole('img', { name: 'Elevation profile' })).toBeInTheDocument()
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

import { VideoCard } from './index'

describe('VideoCard - Single-Surface Architecture & Features', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('VideoCard only renders a single component, requesting details once instead of twice', async () => {
        answerWith({ points })

        render(<VideoCard {...baseProps} />)
        await act(async () => { })

        expect(mockRouteList.requestRouteDetails).toHaveBeenCalledTimes(1)
        expect(screen.getByTestId('map')).toBeInTheDocument()
    })

    describe('Media Preview Priority Chain', () => {
        test('Video with previewUrl renders image, not map', () => {
            render(<VideoSummary {...baseProps} hasVideo={true} previewUrl="https://example.com/preview.jpg" shape={points} />)

            const img = screen.getByRole('img', { name: /Col de la Madone/i })
            expect(img).toHaveAttribute('src', 'https://example.com/preview.jpg')
            expect(screen.queryByTestId('map')).toBeNull()
        })

        test('a failed video preview falls back to the GPX map', () => {
            render(<VideoSummary {...baseProps} hasVideo={true} previewUrl="https://example.com/missing.jpg" shape={points} />)

            fireEvent.error(screen.getByRole('img', { name: /Col de la Madone/i }))

            expect(screen.getByTestId('map')).toBeInTheDocument()
        })

        test('Video without previewUrl but with GPX points falls back to Map', () => {
            render(<VideoSummary {...baseProps} hasVideo={true} shape={points} />)

            expect(screen.getByTestId('map')).toBeInTheDocument()
        })

        test('Video without previewUrl and without points renders placeholder', () => {
            render(<VideoSummary {...baseProps} hasVideo={true} loaded={true} />)

            expect(screen.queryByTestId('map')).toBeNull()
            expect(screen.getByText('Video Route')).toBeInTheDocument()
        })

        test('GPX route with points renders Map', () => {
            render(<VideoSummary {...baseProps} hasVideo={false} shape={points} />)

            expect(screen.getByTestId('map')).toBeInTheDocument()
            expect(screen.getByRole('img', { name: 'Elevation profile' })).toBeInTheDocument()
        })
    })

    describe('Card Actions (Open and Delete)', () => {
        test('clicking a VideoCard opens details only once', () => {
            const onOK = vi.fn()
            const { container } = render(<VideoCard {...baseProps} onOK={onOK} />)

            fireEvent.click(container.querySelector('.route-summary'))
            expect(onOK).toHaveBeenCalledTimes(1)
        })

        test('clicking card triggers onOK if provided', async () => {
            const onOK = vi.fn()
            const { container } = render(<VideoSummary {...baseProps} onOK={onOK} />)

            await act(async () => {
                fireEvent.click(container.querySelector('.route-summary'))
            })
            expect(onOK).toHaveBeenCalled()
        })

        test('clicking compact Details button triggers onOK', async () => {
            const onOK = vi.fn()
            render(<VideoSummary {...baseProps} onOK={onOK} />)

            await act(async () => {
                fireEvent.click(screen.getByRole('button', { name: 'View details for Col de la Madone' }))
            })
            expect(onOK).toHaveBeenCalled()
        })

        test('delete is available only for permitted routes and requires confirmation', async () => {
            const onOK = vi.fn()
            const onDelete = vi.fn()
            const { rerender } = render(<VideoSummary {...baseProps} onOK={onOK} onDelete={onDelete} canDelete={false} />)
            expect(screen.queryByRole('button', { name: 'Delete Col de la Madone' })).not.toBeInTheDocument()

            rerender(<VideoSummary {...baseProps} onOK={onOK} onDelete={onDelete} canDelete={true} />)

            fireEvent.click(screen.getByRole('button', { name: 'Options for Col de la Madone' }))
            const deleteBtn = screen.getByRole('button', { name: 'Delete Col de la Madone' })
            await act(async () => {
                fireEvent.click(deleteBtn)
            })
            expect(screen.getByText('Delete this route?')).toBeInTheDocument()
            expect(onDelete).not.toHaveBeenCalled()
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(onDelete).not.toHaveBeenCalled()

            fireEvent.click(screen.getByRole('button', { name: 'Options for Col de la Madone' }))
            fireEvent.click(screen.getByRole('button', { name: 'Delete Col de la Madone' }))
            fireEvent.click(screen.getByRole('button', { name: 'Delete', exact: true }))

            expect(onDelete).toHaveBeenCalledTimes(1)
            expect(onOK).not.toHaveBeenCalled()
        })
    })

    describe('Pills & Telemetry', () => {
        test('renders Demo, New, Active riders and Own rides pills', () => {
            render(
                <VideoSummary
                    {...baseProps}
                    isDemo={true}
                    isNew={true}
                    cntActive={5}
                    cntOwnRides={2}
                    totalDistance={{ value: 25.4, unit: 'km' }}
                    totalElevation={{ value: 450, unit: 'm' }}
                />
            )

            expect(screen.getByText('Demo')).toBeInTheDocument()
            expect(screen.getByText('New')).toBeInTheDocument()
            expect(screen.getByText('5 live')).toBeInTheDocument()
            expect(screen.getByText('2 rides')).toBeInTheDocument()
            expect(screen.getByText('25.4 km')).toBeInTheDocument()
            expect(screen.getByText('450 m')).toBeInTheDocument()
        })
    })
})
