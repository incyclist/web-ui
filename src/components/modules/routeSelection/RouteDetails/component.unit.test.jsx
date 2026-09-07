import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// FreeMap (leaflet) and ElevationGraph (react-vis/Autosize) both need real layout, which jsdom
// does not provide - stubbed here per this repo's established pattern (see ActivityDetails and
// WorkoutDetails unit tests). The ElevationGraph stub records the props the dialog passes in, so
// the preview wiring can still be asserted.
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        FreeMap: () => <div data-testid="free-map" />,
        VideoProbe: () => <div data-testid="video-probe" />,
        ElevationGraph: (props) => <div data-testid="elevation-graph"
            data-points={props.routeData?.points?.length ?? 0}
            data-comparison={props.comparisonPoints?.length ?? 0}
            data-line={props.line?.color}
            data-version={props.dataVersion} />,
    }
})

vi.mock('../../video', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, VideoPreview: () => <div data-testid="video-preview" /> }
})

import { RouteDetails } from './component'

const buildPoints = (cnt) =>
    Array.from({ length: cnt }, (_, i) => ({ routeDistance: i * 100, elevation: 100 + i, lat: 1 + i / 1000, lng: 2, slope: 1 }))

const routePoints = buildPoints(20)
const smoothedPoints = buildPoints(20)

const baseRoute = {
    description: {
        id: 'route-1',
        title: 'Test Route',
        hasGpx: true,
        hasVideo: false,
        distance: 2000,
        elevation: 1240,
        points: routePoints,
    },
    details: { id: 'route-1', points: routePoints, distance: 2000 },
}

const baseProps = {
    route: baseRoute,
    totalDistance: { value: 2, unit: 'km' },
    totalElevation: { value: 1240, unit: 'm' },
    startPos: { value: 0, unit: 'km' },
    realityFactor: 100,
    smoothingAvailable: true,
    smoothingMaxLevel: 5,
}

const OFF_COPY = 'Softens sharp gradient changes for steadier trainer resistance.'
const ON_COPY = 'Riding a smoothed profile. Your saved route is unchanged.'

const renderDialog = (props = {}) => render(<RouteDetails {...baseProps} {...props} />)

const getChips = () => screen.getByRole('radiogroup', { name: 'Terrain Smoothing' })

// the Text atom puts the label on a <label htmlFor>, but the value lives in a <div id={label}> -
// a div is not labelable, so getByLabelText cannot associate the two
const figure = (label) => document.getElementById(label)

describe('RouteDetails - Terrain Smoothing', () => {

    let onSmoothingPreview

    beforeEach(() => {
        onSmoothingPreview = vi.fn(() => ({
            smoothedPoints,
            smoothedElevation: { value: 1180, unit: 'm' },
        }))
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('availability', () => {

        test('does not render the row at all when smoothingAvailable is false', () => {
            renderDialog({ smoothingAvailable: false, smoothingMaxLevel: 5 })

            expect(screen.queryByRole('radiogroup', { name: 'Terrain Smoothing' })).toBeNull()
            expect(screen.queryByText('Terrain Smoothing')).toBeNull()
            expect(screen.queryByText(OFF_COPY)).toBeNull()
            expect(screen.queryByRole('radio', { name: 'Off' })).toBeNull()
        })

        test('renders the row with Off selected, and the Off copy, when smoothing is available', () => {
            renderDialog({ onSmoothingPreview })

            expect(getChips()).toBeInTheDocument()
            expect(screen.getByRole('radio', { name: 'Off' })).toBeChecked()
            expect(screen.getByText(OFF_COPY)).toBeInTheDocument()
            expect(screen.queryByText(ON_COPY)).toBeNull()
        })

        test('derives the number of level options from smoothingMaxLevel', () => {
            const { unmount } = renderDialog({ smoothingMaxLevel: 5 })
            expect(screen.getAllByRole('radio').map(o => o.textContent)).toEqual(['Off', '1', '2', '3', '4', '5'])
            unmount()

            renderDialog({ smoothingMaxLevel: 3 })
            expect(screen.getAllByRole('radio').map(o => o.textContent)).toEqual(['Off', '1', '2', '3'])
        })
    })

    describe('selecting a level', () => {

        test('queries the preview for the selected level and does not start or persist anything', () => {
            const onStart = vi.fn()
            renderDialog({ onSmoothingPreview, onStart })

            fireEvent.click(screen.getByRole('radio', { name: '3' }))

            expect(onSmoothingPreview).toHaveBeenCalledTimes(1)
            expect(onSmoothingPreview).toHaveBeenCalledWith(3)
            expect(onStart).not.toHaveBeenCalled()
        })

        test('switches the copy and shows the real numbers below the chips', () => {
            renderDialog({ onSmoothingPreview })

            fireEvent.click(screen.getByRole('radio', { name: '3' }))

            expect(screen.getByRole('radio', { name: '3' })).toBeChecked()
            expect(screen.getByText(ON_COPY)).toBeInTheDocument()
            expect(screen.getByText('This ride records 1180 m elevation gain instead of 1240 m.')).toBeInTheDocument()
            expect(screen.queryByText(OFF_COPY)).toBeNull()
        })

        test('does not query the preview again when the already selected level is tapped', () => {
            renderDialog({ onSmoothingPreview })

            fireEvent.click(screen.getByRole('radio', { name: '2' }))
            fireEvent.click(screen.getByRole('radio', { name: '2' }))

            expect(onSmoothingPreview).toHaveBeenCalledTimes(1)
        })

        test('returning to Off restores the Off copy and drops the smoothed figure', () => {
            renderDialog({ onSmoothingPreview })

            fireEvent.click(screen.getByRole('radio', { name: '4' }))
            expect(screen.getByText(ON_COPY)).toBeInTheDocument()

            fireEvent.click(screen.getByRole('radio', { name: 'Off' }))

            expect(screen.getByRole('radio', { name: 'Off' })).toBeChecked()
            expect(screen.getByText(OFF_COPY)).toBeInTheDocument()
            expect(figure('Smoothed')).toBeNull()
        })
    })

    describe('the elevation figures', () => {

        test('shows only the route figure while smoothing is off', () => {
            renderDialog({ onSmoothingPreview })

            expect(figure('Elevation')).toHaveTextContent('1240')
            expect(figure('Smoothed')).toBeNull()
        })

        test('adds a subordinate smoothed row with the delta once a level is active, leaving the route figure in place', () => {
            renderDialog({ onSmoothingPreview })

            fireEvent.click(screen.getByRole('radio', { name: '3' }))

            const routeFigure = figure('Elevation')
            expect(routeFigure).toHaveTextContent('1240')
            // the route's own figure must never be struck through
            expect(routeFigure).not.toHaveStyle({ textDecoration: 'line-through' })

            expect(figure('Smoothed')).toHaveTextContent('1180 m (−60 m)')
        })
    })

    describe('the preview profile', () => {

        test('draws the route line only while smoothing is off', () => {
            renderDialog({ onSmoothingPreview })

            const graph = screen.getByTestId('elevation-graph')
            expect(graph).toHaveAttribute('data-comparison', '0')
            expect(graph).toHaveAttribute('data-line', 'white')
        })

        test('draws the smoothed points with the route points as a second series once a level is active', () => {
            renderDialog({ onSmoothingPreview })

            fireEvent.click(screen.getByRole('radio', { name: '3' }))

            const graph = screen.getByTestId('elevation-graph')
            expect(graph).toHaveAttribute('data-points', String(smoothedPoints.length))
            expect(graph).toHaveAttribute('data-comparison', String(routePoints.length))
            expect(graph).toHaveAttribute('data-line', '#EEEEEE')
            expect(graph).toHaveAttribute('data-version', 'smoothed-3')
        })

        test('gives the video still way to the expanded profile while a level is active', () => {
            const withVideo = {
                ...baseRoute,
                description: { ...baseRoute.description, hasVideo: true, previewUrl: 'http://example.com/p.png' },
            }

            renderDialog({ route: withVideo, onSmoothingPreview })
            expect(screen.getByRole('img')).toBeInTheDocument()

            fireEvent.click(screen.getByRole('radio', { name: '3' }))
            expect(screen.queryByRole('img')).toBeNull()

            fireEvent.click(screen.getByRole('radio', { name: 'Off' }))
            expect(screen.getByRole('img')).toBeInTheDocument()
        })
    })

    describe('a route that was left with a level selected', () => {

        test('renders the smoothed profile, figure and copy immediately, without querying the preview', () => {
            renderDialog({
                onSmoothingPreview,
                smoothingLevel: 2,
                smoothedPoints,
                smoothedElevation: { value: 1180, unit: 'm' },
            })

            expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
            expect(screen.getByText(ON_COPY)).toBeInTheDocument()
            expect(figure('Smoothed')).toHaveTextContent('1180 m (−60 m)')
            expect(screen.getByTestId('elevation-graph')).toHaveAttribute('data-comparison', String(routePoints.length))
            expect(onSmoothingPreview).not.toHaveBeenCalled()
        })

        test('keeps the row hidden when the route is no longer eligible, even with a stored level', () => {
            renderDialog({ smoothingAvailable: false, smoothingLevel: 2, smoothedPoints })

            expect(screen.queryByRole('radiogroup', { name: 'Terrain Smoothing' })).toBeNull()
            expect(figure('Smoothed')).toBeNull()
            expect(screen.getByTestId('elevation-graph')).toHaveAttribute('data-comparison', '0')
        })
    })

    describe('starting the ride', () => {

        test('hands the selected level to onStart so the wrapper can persist it', () => {
            const onStart = vi.fn()
            renderDialog({ onSmoothingPreview, onStart })

            fireEvent.click(screen.getByRole('radio', { name: '4' }))
            fireEvent.click(screen.getByRole('button', { name: 'Start' }))

            expect(onStart).toHaveBeenCalledTimes(1)
            expect(onStart.mock.calls[0][0]).toMatchObject({ smoothingLevel: 4 })
        })

        test('hands the selected level to onAddWorkout as well', () => {
            const onAddWorkout = vi.fn()
            renderDialog({ onSmoothingPreview, onAddWorkout, showWorkout: true })

            fireEvent.click(screen.getByRole('radio', { name: '1' }))
            fireEvent.click(screen.getByRole('button', { name: 'Start With Workout' }))

            expect(onAddWorkout).toHaveBeenCalledTimes(1)
            expect(onAddWorkout.mock.calls[0][0]).toMatchObject({ smoothingLevel: 1 })
        })

        test('carries a stored level through untouched when the user does not change it', () => {
            const onStart = vi.fn()
            renderDialog({ onSmoothingPreview, onStart, smoothingLevel: 5, smoothedPoints, smoothedElevation: { value: 1000, unit: 'm' } })

            fireEvent.click(screen.getByRole('button', { name: 'Start' }))

            expect(onStart.mock.calls[0][0]).toMatchObject({ smoothingLevel: 5 })
            expect(onSmoothingPreview).not.toHaveBeenCalled()
        })
    })

    describe('the copy', () => {

        const FORBIDDEN = ['fix', 'correct', 'clean up', 'repair', 'improve', 'accurate', 'realistic', 'error', 'noise', 'bumps', 'raw']

        test('uses none of the words this feature must avoid', () => {
            const { container, unmount } = renderDialog({ onSmoothingPreview })
            const offText = container.textContent.toLowerCase()
            unmount()

            const second = renderDialog({
                onSmoothingPreview, smoothingLevel: 3, smoothedPoints, smoothedElevation: { value: 1180, unit: 'm' },
            })
            const onText = second.container.textContent.toLowerCase()

            // only the strings this feature introduces - the rest of the dialog is out of scope
            const introduced = [OFF_COPY, ON_COPY, 'Terrain Smoothing', 'Smoothed', 'Route',
                'This ride records 1180 m elevation gain instead of 1240 m.'].join(' ').toLowerCase()

            FORBIDDEN.forEach(word => {
                expect(introduced).not.toContain(word)
            })

            // sanity: the copy the feature owns is actually on screen in both states
            expect(offText).toContain(OFF_COPY.toLowerCase())
            expect(onText).toContain(ON_COPY.toLowerCase())
        })
    })
})
