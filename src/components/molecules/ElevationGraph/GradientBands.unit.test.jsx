import { describe, test, expect } from 'vitest'
import { buildGradientColumns } from './GradientBands'

const ramp = (cnt, step) =>
    Array.from({ length: cnt }, (_, i) => ({ routeDistance: i * 100, elevation: 100 + i * step, slope: step }))

const routeData = (points) => ({ title: 'Test Route', distance: (points.length - 1) * 100, points })

describe('GradientBands - buildGradientColumns', () => {

    test('returns one column per pixel of width', () => {
        const columns = buildGradientColumns(routeData(ramp(60, 1)), 200, 100)
        expect(columns.length).toBeGreaterThan(0)
        expect(columns.length).toBeLessThanOrEqual(201)
    })

    test('colours columns from the slope, via the same colour scale the chart uses', () => {
        const steep = buildGradientColumns(routeData(ramp(20, 15)), 100, 100)
        const flat = buildGradientColumns(routeData(ramp(20, 0.2)), 100, 100)

        expect(steep.every(c => c.color)).toBe(true)
        expect(flat.every(c => c.color)).toBe(true)
        // a steep climb and a near-flat one must not resolve to the same colour zone
        expect(steep[0].color).not.toBe(flat[0].color)
    })

    test('returns nothing for a missing route, no points, or zero width', () => {
        expect(buildGradientColumns(undefined, 200, 100)).toEqual([])
        expect(buildGradientColumns({ points: [] }, 200, 100)).toEqual([])
        expect(buildGradientColumns(routeData(ramp(20, 1)), 0, 100)).toEqual([])
        expect(buildGradientColumns(routeData(ramp(20, 1)), undefined, 100)).toEqual([])
    })

    test('does not throw on malformed input', () => {
        expect(() => buildGradientColumns(null, null, null)).not.toThrow()
    })
})
