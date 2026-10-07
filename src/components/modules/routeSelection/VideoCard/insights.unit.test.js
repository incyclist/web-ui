import { describe, expect, test } from 'vitest'
import { countryLabel, profilePoints, routeEffort, summarizeHistory, validCoordinates, videoAvailability } from './insights'

const route = { id: 'route-1', routeHash: 'hash-1', distance: 20000 }
const ride = (rideTime, overrides = {}) => ({ summary: {
    routeId: route.id, routeHash: route.routeHash, startPos: 0, distance: 20000,
    realityFactor: 100, rideTime, ...overrides
} })

describe('route card insights', () => {
    test('does not treat null/blank coordinates as zero, and rejects out-of-range values', () => {
        const valid = { lat: 0, lng: 0 }
        expect(validCoordinates([valid, { lat: null, lng: null }, { lat: '', lng: 2 }, { lat: 95, lng: 2 }, { lat: 1, lng: 181 }])).toEqual([valid])
        expect(profilePoints([{ routeDistance: 0, elevation: 0 }, { routeDistance: 1, elevation: null }])).toEqual([{ routeDistance: 0, elevation: 0 }])
    })
    test('normalizes country codes without exposing ISO codes as the country name', () => {
        expect(countryLabel('de')).toEqual({ code: 'DE', name: 'Germany' })
        expect(countryLabel('UK')).toEqual({ code: 'GB', name: 'United Kingdom' })
        expect(countryLabel()).toBeUndefined()
    })
    test('estimates time from the median of comparable full rides, including legacy summaries', () => {
        const result = summarizeHistory([ride(3600), ride(3900), ride(4200), ride(10000)], route)
        expect(result.count).toBe(4)
        expect(result.estimatedMinutes).toBe(68)
        expect(result.sampleCount).toBe(4)
    })
    test('does not mix shortened, smoothed, altered-reality, incomplete or other-route rides into time', () => {
        const activities = [ride(3600), ride(3900), ride(4000, { startPos: 100 }),
            ride(4000, { distance: 10000 }), ride(4000, { endPos: 18000 }),
            ride(4000, { smoothingLevel: 1 }), ride(4000, { realityFactor: 50 }),
            ride(4000, { isCompleted: false }), ride(4000, { segment: 'climb' }),
            ride(4000, { routeHash: 'other' }), ride(4000, { isSaved: false })]
        const result = summarizeHistory(activities, route)
        expect(result.count).toBe(9)
        expect(result.sampleCount).toBe(2)
        expect(result.estimatedMinutes).toBeUndefined()
    })
    test('matches route hashes across imported IDs, falling back to IDs only without a hash', () => {
        expect(summarizeHistory([ride(600, { routeId: 'imported' })], route).count).toBe(1)
        expect(summarizeHistory([ride(600)], { id: 'route-1', distance: 20000 }).count).toBe(1)
        expect(summarizeHistory([ride(600)], {}).count).toBe(0)
    })
    test('requires actual route data for effort and accounts for sustained steep ramps', () => {
        expect(routeEffort(10000, undefined, [])).toBeUndefined()
        expect(routeEffort(10000, 200, [])).toBeUndefined()
        const flat = [{ routeDistance: 0, elevation: 0 }, { routeDistance: 10000, elevation: 0 }]
        const steep = Array.from({ length: 41 }, (_, i) => ({ routeDistance: i * 250, elevation: i * 20 }))
        expect(routeEffort(15000, 800, flat).label).toBe('Easy')
        expect(routeEffort(15000, 800, steep).label).toBe('Moderate')
    })
    test('availability prioritizes missing and in-progress states over downloaded flags', () => {
        expect(videoAvailability({ hasVideo: true, isDownloaded: true, videoMissing: true })).toBe('Video unavailable')
        expect(videoAvailability({ hasVideo: true, isDownloaded: true, videoPill: 'downloading' })).toBe('Downloading…')
        expect(videoAvailability({ hasVideo: true, videoPill: 'in-icloud' })).toBe('In iCloud')
        expect(videoAvailability({ hasVideo: true, requiresDownload: true, isDownloaded: true })).toBe('Downloaded')
        expect(videoAvailability({ hasVideo: true, requiresDownload: true })).toBe('Download required')
        expect(videoAvailability({ hasVideo: false })).toBeUndefined()
    })
})
