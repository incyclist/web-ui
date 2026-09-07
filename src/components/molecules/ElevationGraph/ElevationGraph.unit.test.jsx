import { describe, test, expect } from 'vitest'

// Graph is exercised as a plain class rather than rendered: it sizes itself from the DOM
// (parentElement.clientHeight), and jsdom reports 0 for that, so a rendered chart never draws
// anything to assert on. The comparison series lives entirely in these methods.
import { Graph } from './ElevationGraph'
import { ElevationGraphData } from './data'

const SIZE = { width: 401, height: 200 }

const ramp = (cnt, step) =>
    Array.from({ length: cnt }, (_, i) => ({ routeDistance: i * 100, elevation: 100 + i * step, slope: step }))

// the route climbs twice as fast as the smoothed profile, so the two series have different extents
const routePoints = ramp(60, 4)
const smoothedPoints = ramp(60, 2)

const routeData = (points) => ({ title: 'Test Route', distance: 5900, points })

const buildProps = (points, comparisonPoints, dataVersion) => ({
    routeData: routeData(points),
    comparisonPoints,
    dataVersion,
    xScale: { value: 1 / 1000, unit: 'km' },
    yScale: { value: 1, unit: 'm' },
    pctReality: 100,
})

const FULL_UPDATE = { hasSizeChanged: true, hasRouteChanged: true, requiresDataUpdate: true }
const NO_CHANGE = { hasSizeChanged: false, hasRouteChanged: false, requiresDataUpdate: false }

// brings a Graph up to the state it is in once it has been measured and has drawn once
const buildGraph = (props) => {
    const graph = new Graph(props)
    graph.data.processChanges(FULL_UPDATE, props, SIZE)
    graph.updateComparison(FULL_UPDATE, props, SIZE)
    return graph
}

describe('ElevationGraph - comparison series', () => {

    test('has no comparison series when no comparison points are given', () => {
        const graph = buildGraph(buildProps(routePoints))

        expect(graph.comparison).toBeNull()
        expect(graph.getComparisonData()).toEqual([])
    })

    test('builds the comparison series from the comparison points, not from the main ones', () => {
        const props = buildProps(smoothedPoints, routePoints, 'smoothed-3')
        const graph = buildGraph(props)

        const main = graph.getData()
        const comparison = graph.getComparisonData()

        expect(comparison.length).toBeGreaterThan(0)
        // same x extent, different elevations - the two curves are drawn over each other
        expect(comparison.at(-1).x).toBeCloseTo(main.at(-1).x, 5)
        expect(comparison.at(-1).y).toBeGreaterThan(main.at(-1).y)
    })

    test('draws the comparison at full resolution even when only the level changed', () => {
        // the transition from Off to a level creates the comparison series without any size change,
        // which is where it would otherwise fall back to the 10-point default and draw a coarse line
        const props = buildProps(smoothedPoints, routePoints, 'smoothed-3')
        const graph = new Graph(buildProps(smoothedPoints, undefined, 'route'))
        graph.data.processChanges(FULL_UPDATE, props, SIZE)

        graph.updateComparison(NO_CHANGE, props, SIZE)

        expect(graph.getComparisonData().length).toBeGreaterThan(50)
        expect(graph.getComparisonData().length).toEqual(graph.getData().length)
    })

    test('drops the comparison series again when the comparison points are removed', () => {
        const graph = buildGraph(buildProps(smoothedPoints, routePoints, 'smoothed-3'))
        expect(graph.getComparisonData().length).toBeGreaterThan(0)

        const off = buildProps(routePoints, undefined, 'route')
        graph.updateComparison(FULL_UPDATE, off, SIZE)

        expect(graph.comparison).toBeNull()
        expect(graph.getComparisonData()).toEqual([])
    })

    test('scales the plot to hold both series, so the route line is not clipped', () => {
        const props = buildProps(smoothedPoints, routePoints, 'smoothed-3')
        const graph = buildGraph(props)

        const smoothedOnly = new ElevationGraphData(props)
        smoothedOnly.processChanges(FULL_UPDATE, props, SIZE)

        const [mergedX, mergedY] = graph.getDisplayMaxValues(true)
        const [, smoothedY] = smoothedOnly.getDisplayMaxValues(true)

        expect(mergedY[1]).toBeGreaterThan(smoothedY[1])
        expect(mergedY[1]).toBeGreaterThanOrEqual(Math.max(...routePoints.map(p => p.elevation)))
        expect(mergedX.every(Number.isFinite)).toBe(true)
    })

    test('keeps the plot on the main series alone when the comparison has no usable domain', () => {
        const props = buildProps(smoothedPoints, routePoints, 'smoothed-3')
        const graph = buildGraph(props)
        const expected = graph.data.getDisplayMaxValues(true)

        graph.comparison.getDisplayMaxValues = () => [[NaN, NaN], [NaN, NaN]]

        expect(graph.getDisplayMaxValues(true)).toEqual(expected)
    })
})

describe('ElevationGraphData - dataVersion', () => {

    const props = (dataVersion, points) => buildProps(points, undefined, dataVersion)

    test('triggers a data update when the points change but distance and title do not', () => {
        const prev = props('route', routePoints)
        const data = new ElevationGraphData(prev)
        data.processChanges(FULL_UPDATE, prev, SIZE)

        const res = data.checkForDataUpdate(props('smoothed-3', smoothedPoints), SIZE, prev)

        expect(res.hasRouteChanged).toBe(true)
        expect(res.requiresDataUpdate).toBe(true)
    })

    test('leaves callers that do not pass a dataVersion unaffected', () => {
        const prev = props(undefined, routePoints)
        const data = new ElevationGraphData(prev)
        data.processChanges(FULL_UPDATE, prev, SIZE)

        const res = data.checkForDataUpdate(props(undefined, routePoints), SIZE, prev)

        expect(res.hasRouteChanged).toBe(false)
        expect(res.requiresDataUpdate).toBeFalsy()
    })
})
