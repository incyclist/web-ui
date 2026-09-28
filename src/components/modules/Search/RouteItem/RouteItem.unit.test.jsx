import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'

const { mockRouteList, mockAppState } = vi.hoisted(() => ({
    mockRouteList: { requestRouteDetails: vi.fn() },
    mockAppState: { hasFeature: vi.fn(() => false) },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useRouteList: () => mockRouteList,
        useAppState: () => mockAppState,
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

const points = [{ lat: 1, lng: 2, routeDistance: 0, elevation: 10 }, { lat: 1.1, lng: 2.1, routeDistance: 100, elevation: 12 }]
const route = { id: 'route-1', title: 'Col de la Madone', ready: true, hasVideo: false, loaded: false }

// RouteListService.requestRouteDetails() (bounded, de-duplicated, cancellable) is covered in
// incyclist-services - here it is only the row's use of it that is tested
const requests = []
const answerWith = (details) => {
    mockRouteList.requestRouteDetails.mockImplementation((id, onResult) => {
        const cancel = vi.fn()
        requests.push({ id, onResult, cancel })
        Promise.resolve().then(() => onResult(details))
        return cancel
    })
}
const holdRequests = () => {
    mockRouteList.requestRouteDetails.mockImplementation((id, onResult) => {
        const cancel = vi.fn()
        requests.push({ id, onResult, cancel })
        return cancel
    })
}

describe('RouteItem', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        requests.length = 0
    })

    test('outside the fold it renders a skeleton and loads nothing', () => {
        render(<RouteItem {...route} outsideFold={true} />)

        expect(screen.getByTestId('route-item-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('map')).toBeNull()
        expect(mockRouteList.requestRouteDetails).not.toHaveBeenCalled()
    })

    test('inside the fold it requests the details and shows map and elevation', async () => {
        answerWith({ points })
        render(<RouteItem {...route} outsideFold={false} />)

        await act(async () => { })

        expect(mockRouteList.requestRouteDetails).toHaveBeenCalledWith('route-1', expect.any(Function))
        expect(screen.getByTestId('map').dataset.points).toBe('2')
        expect(screen.getByTestId('elevation').dataset.points).toBe('2')
    })

    test('leaving the fold unmounts the map; re-entering requests and shows it again', async () => {
        answerWith({ points })
        const { rerender } = render(<RouteItem {...route} outsideFold={false} />)
        await act(async () => { })
        expect(screen.getByTestId('map')).toBeInTheDocument()

        rerender(<RouteItem {...route} outsideFold={true} />)
        expect(screen.queryByTestId('map')).toBeNull()
        expect(screen.getByTestId('route-item-skeleton')).toBeInTheDocument()

        rerender(<RouteItem {...route} outsideFold={false} />)
        await act(async () => { })

        expect(mockRouteList.requestRouteDetails).toHaveBeenCalledTimes(2)
        expect(screen.getByTestId('map').dataset.points).toBe('2')
    })

    test('details arriving after the row has left the fold are dropped', async () => {
        holdRequests()

        const { rerender } = render(<RouteItem {...route} outsideFold={false} />)
        rerender(<RouteItem {...route} outsideFold={true} />)

        await act(async () => { requests[0].onResult({ points }) })

        // back inside: the late result of the first request must not be used, a new one is made
        rerender(<RouteItem {...route} outsideFold={false} />)
        expect(requests).toHaveLength(2)
        expect(screen.getByTestId('elevation').dataset.points).toBe('0')

        await act(async () => { requests[1].onResult({ points: [points[0]] }) })
        expect(screen.getByTestId('map').dataset.points).toBe('1')
    })

    test('a row leaving the fold cancels its pending request', () => {
        holdRequests()

        const { rerender } = render(<RouteItem {...route} outsideFold={false} />)
        expect(requests[0].cancel).not.toHaveBeenCalled()

        rerender(<RouteItem {...route} outsideFold={true} />)

        expect(requests[0].cancel).toHaveBeenCalledTimes(1)
    })

    test('unmounting a row cancels its pending request', () => {
        holdRequests()

        const { unmount } = render(<RouteItem {...route} outsideFold={false} />)
        unmount()

        expect(requests[0].cancel).toHaveBeenCalledTimes(1)
    })

    test('points already in the display props are used without requesting details', () => {
        render(<RouteItem {...route} loaded={true} points={points} outsideFold={false} />)

        expect(mockRouteList.requestRouteDetails).not.toHaveBeenCalled()
        expect(screen.getByTestId('map').dataset.points).toBe('2')
    })

    test('a shape in the display props is used without requesting details', () => {
        render(<RouteItem {...route} shape={points} outsideFold={false} />)

        expect(mockRouteList.requestRouteDetails).not.toHaveBeenCalled()
        expect(screen.getByTestId('map').dataset.points).toBe('2')
        expect(screen.getByTestId('elevation').dataset.points).toBe('2')
    })

    describe('hover-delete confirmation', () => {

        // the hover-delete icon only exists on the merged page (behind NEW_SEARCH_UI)
        beforeEach(() => {
            mockAppState.hasFeature.mockImplementation((feature) => feature === 'NEW_SEARCH_UI')
        })

        afterEach(() => {
            mockAppState.hasFeature.mockImplementation(() => false)
        })

        const revealDeleteIcon = (container) => {
            fireEvent.mouseEnter(container.firstChild)
            return container.querySelector('#delete')
        }

        test('the icon is hidden entirely when the card cannot be deleted', () => {
            const { container } = render(<RouteItem {...route} canDelete={false} loaded={true} points={points} outsideFold={false} />)

            fireEvent.mouseEnter(container.firstChild)
            expect(container.querySelector('#delete')).toBeNull()
        })

        test.each([
            ['a local/imported route', false],
            ['a downloaded copy of a catalog route', true],
        ])('%s is deleted immediately, without a confirmation', async (_name, isDownloaded) => {
            const onDelete = vi.fn()
            const { container } = render(
                <RouteItem {...route} canDelete={true} isDownloaded={isDownloaded} loaded={true} points={points} outsideFold={false} onDelete={onDelete} />
            )

            const icon = revealDeleteIcon(container)
            expect(icon).not.toBeNull()

            await act(async () => { fireEvent.click(icon) })

            expect(onDelete).toHaveBeenCalledTimes(1)
            expect(screen.queryByText(/from your library/)).toBeNull()
        })
    })
})
