import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

const { mockUserSettings, mockActivities, mockRouteList, mockOnlineStatus, mockAppUI } = vi.hoisted(() => ({
    mockUserSettings: { get: vi.fn((key, def) => def), set: vi.fn() },
    mockActivities: { getPastActivitiesWithDetails: vi.fn(async () => []) },
    mockRouteList: { getRouteDetails: vi.fn(async () => ({})) },
    mockOnlineStatus: { onlineStatus: true, start: vi.fn(), stop: vi.fn() },
    mockAppUI: { selectDirectory: vi.fn(async () => ({})) },
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useUserSettings: () => mockUserSettings,
        useActivityList: () => mockActivities,
        useRouteList: () => mockRouteList,
        useOnlineStatusMonitoring: () => mockOnlineStatus,
    }
})

vi.mock('../../../../bindings/native-ui', () => ({ useAppUI: () => mockAppUI }))
vi.mock('../../../../bindings/video', () => ({
    VideoProcessing: class { isConvertSuported() { return false } },
}))

// The presentational component is stubbed - this suite is about the wrapper's plumbing between the
// RouteCard and the dialog: which props go down, and what is written on Start.
const rendered = { props: null }
vi.mock('./component', () => ({
    RouteDetails: (props) => { rendered.props = props; return <div data-testid="route-details" /> },
}))

import { RouteDetailsDialog } from './wrapper'

const points = Array.from({ length: 10 }, (_, i) => ({ routeDistance: i * 100, elevation: 100 + i }))
const smoothedPoints = Array.from({ length: 10 }, (_, i) => ({ routeDistance: i * 100, elevation: 100 + i / 2 }))

const buildCard = (overrides = {}) => {
    const settings = {
        startPos: { value: 0, unit: 'km' }, realityFactor: 100, smoothingLevel: 0,
        ...(overrides.settings ?? {}),
    }

    return {
        getData: () => ({ description: { id: 'route-1', title: 'Test Route', points }, details: { points } }),
        getCurrentDownload: () => null,
        getCurrentConversion: () => null,
        getRouteDescription: () => ({ id: 'route-1' }),
        getMarkers: () => [],
        getVideoDir: () => '/videos',
        canStart: () => true,
        openSettings: vi.fn(() => ({
            settings,
            showLoopOverwrite: false, showNextOverwrite: false, hasWorkout: false, canStart: true,
            totalDistance: { value: 2, unit: 'km' }, totalElevation: { value: 1240, unit: 'm' },
            smoothingAvailable: true, smoothingMaxLevel: 5,
            ...(overrides.props ?? {}),
        })),
        getSmoothingPreview: vi.fn(() => ({ smoothedPoints, smoothedElevation: { value: 1180, unit: 'm' } })),
        // real behaviour mocked here, not re-tested: `services` covers the actual prediction rule
        // for this. This suite only needs to verify the wrapper calls it and passes the result
        // through unchanged.
        getPrevRidesFilter: vi.fn((data) => ({
            routeId: 'route-1',
            startPos: data?.startPos,
            endPos: data?.endPos,
            realityFactor: data?.realityFactor,
            smoothingLevel: overrides.props?.smoothingAvailable === false ? 0 : (data?.smoothingLevel ?? 0),
        })),
        changeSettings: vi.fn(),
        start: vi.fn(),
        addWorkout: vi.fn(),
        cancel: vi.fn(),
    }
}

const renderWrapper = async (card) => {
    let result
    await act(async () => { result = render(<RouteDetailsDialog card={card} />) })
    return result
}

describe('RouteDetailsDialog - Terrain Smoothing plumbing', () => {

    beforeEach(() => { rendered.props = null })
    afterEach(() => { vi.clearAllMocks() })

    test('passes the smoothing card props and the stored level down to the dialog', async () => {
        const gradient = { routeSteepest: 20.4, smoothedSteepest: 8.5, hasVisibleEffect: true }
        const card = buildCard({
            settings: { smoothingLevel: 3 },
            props: { smoothedPoints, smoothedElevation: { value: 1180, unit: 'm' }, smoothedGradient: gradient },
        })
        await renderWrapper(card)

        expect(rendered.props.smoothingAvailable).toBe(true)
        expect(rendered.props.smoothingMaxLevel).toBe(5)
        expect(rendered.props.smoothingLevel).toBe(3)
        expect(rendered.props.smoothedPoints).toBe(smoothedPoints)
        expect(rendered.props.smoothedElevation).toEqual({ value: 1180, unit: 'm' })
        expect(rendered.props.smoothedGradient).toEqual(gradient)
    })

    // the criteria (including the smoothing-level prediction) are built by the card, not
    // re-derived here - the wrapper's only job is to call it and pass the result through.
    test('onRefresh asks the card for the criteria and passes them through unchanged', async () => {
        const card = buildCard({ props: { smoothingAvailable: true } })
        await renderWrapper(card)

        const settings = { startPos: 0, endPos: undefined, realityFactor: 100, smoothingLevel: 3 }
        await act(async () => {
            await rendered.props.onRefresh(settings)
        })

        expect(card.getPrevRidesFilter).toHaveBeenCalledWith(settings)
        expect(mockActivities.getPastActivitiesWithDetails).toHaveBeenCalledWith(
            card.getPrevRidesFilter.mock.results[0].value
        )
    })

    test('onSmoothingPreview queries the card and writes nothing to the settings', async () => {
        const card = buildCard()
        await renderWrapper(card)

        const preview = rendered.props.onSmoothingPreview(3)

        expect(card.getSmoothingPreview).toHaveBeenCalledWith(3)
        expect(preview.smoothedPoints).toBe(smoothedPoints)
        expect(card.changeSettings).not.toHaveBeenCalled()
        expect(card.start).not.toHaveBeenCalled()
    })

    test('onSmoothingPreview survives the card throwing, without persisting anything', async () => {
        const card = buildCard()
        card.getSmoothingPreview.mockImplementation(() => { throw new Error('boom') })
        await renderWrapper(card)

        expect(rendered.props.onSmoothingPreview(2)).toEqual({})
        expect(card.changeSettings).not.toHaveBeenCalled()
    })

    test('includes smoothingLevel in the settings written on Start', async () => {
        const card = buildCard()
        await renderWrapper(card)

        await act(async () => {
            rendered.props.onStart({ startPos: { value: 0, unit: 'km' }, realityFactor: 100, smoothingLevel: 4, markers: [], prevRides: [] })
        })

        expect(card.changeSettings).toHaveBeenCalledTimes(1)
        expect(card.changeSettings.mock.calls[0][0]).toMatchObject({ smoothingLevel: 4 })
        expect(card.start).toHaveBeenCalledTimes(1)
    })

    test('includes smoothingLevel in the settings written on Start With Workout', async () => {
        const card = buildCard()
        await renderWrapper(card)

        await act(async () => {
            rendered.props.onAddWorkout({ startPos: { value: 0, unit: 'km' }, realityFactor: 100, smoothingLevel: 2, markers: [] })
        })

        expect(card.changeSettings.mock.calls[0][0]).toMatchObject({ smoothingLevel: 2 })
        expect(card.addWorkout).toHaveBeenCalledTimes(1)
    })
})
