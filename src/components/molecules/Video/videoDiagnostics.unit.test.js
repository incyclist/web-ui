import { describe, test, expect, vi } from 'vitest'
import {
    MIN_PLAYBACK_RATE, clampPlaybackRate, getFileExtension, buildElementErrorLog, buildPlayFailureLog,
    buildSourceInfoLog, createPlayFailureTracker, handlePlayFailure
} from './videoDiagnostics'

const fakeVideo = (props = {}) => ({
    networkState: 3, readyState: 0, currentSrc: 'file:///a/b.mp4',
    canPlayType: vi.fn(() => 'maybe'),
    ...props
})
const segment = { routeId: 'r1', index: 1, count: 3, hasNext: true }

describe('clampPlaybackRate', () => {
    test('raises positive rates below the supported minimum', () => {
        expect(clampPlaybackRate(0.0569247)).toBe(MIN_PLAYBACK_RATE)
        expect(MIN_PLAYBACK_RATE).toBe(0.0625)
    })
    test('keeps supported rates and zero', () => {
        expect(clampPlaybackRate(0.0625)).toBe(0.0625)
        expect(clampPlaybackRate(1.5)).toBe(1.5)
        expect(clampPlaybackRate(0)).toBe(0)
    })
})

describe('getFileExtension', () => {
    test('returns the lower case extension without query or hash', () => {
        expect(getFileExtension('file:///C:%5CUsers%5Cx%5CVideo.MP4?a=b.c#t')).toBe('mp4')
    })
    test('returns undefined for missing extension or non string', () => {
        expect(getFileExtension('file:///a/b')).toBeUndefined()
        expect(getFileExtension({})).toBeUndefined()
        expect(getFileExtension(undefined)).toBeUndefined()
    })
})

describe('buildElementErrorLog', () => {
    test('contains media error details, element state, urls and segment', () => {
        const video = fakeVideo({ error: { code: 4, message: 'DEMUXER_ERROR_COULD_NOT_OPEN' } })
        const res = buildElementErrorLog({ video, phase: 'loading', src: 'video:///a/b.mp4', resolvedSrc: 'video:////a/b.mp4', segment })
        expect(res).toEqual({
            message: 'video element error', code: 4, mediaErrorMessage: 'DEMUXER_ERROR_COULD_NOT_OPEN', phase: 'loading',
            networkState: 3, readyState: 0, currentSrc: 'file:///a/b.mp4',
            src: 'video:///a/b.mp4', resolvedSrc: 'video:////a/b.mp4',
            routeId: 'r1', segmentIndex: 1, segmentCount: 3, hasNext: true
        })
    })
    test('works without a segment and without a media error', () => {
        const res = buildElementErrorLog({ video: fakeVideo(), phase: 'playback', src: 'a', resolvedSrc: 'a' })
        expect(res.code).toBeUndefined()
        expect(res.routeId).toBeUndefined()
    })
})

describe('buildPlayFailureLog', () => {
    test('adds errorName, element state and resolvedSrc to the startPlay log', () => {
        const err = Object.assign(new Error('The element has no supported sources.'), { name: 'NotSupportedError' })
        const res = buildPlayFailureLog({ error: err, video: fakeVideo(), resolvedSrc: 'file:///x.mp4', segment })
        expect(res).toMatchObject({
            message: 'error', fn: 'startPlay', error: 'The element has no supported sources.', errorName: 'NotSupportedError',
            networkState: 3, readyState: 0, currentSrc: 'file:///a/b.mp4', resolvedSrc: 'file:///x.mp4', routeId: 'r1'
        })
    })
})

describe('buildSourceInfoLog', () => {
    test('logs extension and canPlayType of the matching container', () => {
        const video = fakeVideo()
        const res = buildSourceInfoLog({ video, src: 'video:///a/b.mp4', resolvedSrc: 'file:///a/b.mp4', segment })
        expect(video.canPlayType).toHaveBeenCalledWith('video/mp4')
        expect(res).toMatchObject({ message: 'video source info', extension: 'mp4', mime: 'video/mp4', canPlayType: 'maybe', routeId: 'r1' })
    })
    test('reports unknown containers without calling canPlayType', () => {
        const video = fakeVideo()
        const res = buildSourceInfoLog({ video, src: 'a.xyz', resolvedSrc: 'a.xyz' })
        expect(res.extension).toBe('xyz')
        expect(res.mime).toBeUndefined()
        expect(video.canPlayType).not.toHaveBeenCalled()
    })
})

describe('createPlayFailureTracker', () => {
    test('allows attempts initially and backs off exponentially after failures', () => {
        let t = 1000
        const tracker = createPlayFailureTracker({ now: () => t, baseDelayMs: 1000, maxDelayMs: 8000 })
        expect(tracker.canAttempt()).toBe(true)

        tracker.recordFailure('s', 'AbortError')
        expect(tracker.canAttempt()).toBe(false)
        t += 999
        expect(tracker.canAttempt()).toBe(false)
        t += 1
        expect(tracker.canAttempt()).toBe(true)

        tracker.recordFailure('s', 'AbortError')
        t += 1999
        expect(tracker.canAttempt()).toBe(false)
        t += 1
        expect(tracker.canAttempt()).toBe(true)
    })

    test('caps the back-off delay', () => {
        let t = 0
        const tracker = createPlayFailureTracker({ now: () => t, baseDelayMs: 1000, maxDelayMs: 2000, maxSourceFailures: 100 })
        for (let i = 0; i < 6; i++) tracker.recordFailure('s', 'AbortError')
        t += 2000
        expect(tracker.canAttempt()).toBe(true)
    })

    test('gives up after repeated source errors and stops attempts', () => {
        let t = 0
        const tracker = createPlayFailureTracker({ now: () => t, maxSourceFailures: 3 })
        expect(tracker.recordFailure('s', 'NotSupportedError').giveUp).toBe(false)
        expect(tracker.recordFailure('s', 'NotSupportedError').giveUp).toBe(false)
        expect(tracker.recordFailure('s', 'NotSupportedError').giveUp).toBe(true)
        t += 1e9
        expect(tracker.hasGivenUp()).toBe(true)
        expect(tracker.canAttempt()).toBe(false)
    })

    test('never gives up on other errors', () => {
        const tracker = createPlayFailureTracker({ maxSourceFailures: 2 })
        for (let i = 0; i < 10; i++)
            expect(tracker.recordFailure('s', 'NotAllowedError').giveUp).toBe(false)
    })

    test('counts per src and error name; first is flagged, repeats at powers of two', () => {
        const tracker = createPlayFailureTracker({ maxSourceFailures: 100 })
        const flags = []
        for (let i = 0; i < 9; i++) flags.push(tracker.recordFailure('s', 'AbortError'))
        expect(flags.map(f => f.count)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
        expect(flags.filter(f => f.logRepeat).map(f => f.count)).toEqual([2, 4, 8])
        expect(flags[0].first).toBe(true)
        expect(flags[1].first).toBe(false)
        expect(tracker.recordFailure('other', 'AbortError').first).toBe(true)
        expect(tracker.recordFailure('s', 'NotAllowedError').first).toBe(true)
    })

    test('success resets back-off', () => {
        let t = 0
        const tracker = createPlayFailureTracker({ now: () => t })
        tracker.recordFailure('s', 'AbortError')
        tracker.recordSuccess()
        expect(tracker.canAttempt()).toBe(true)
    })

    test('markSourceLogged is true only once per src', () => {
        const tracker = createPlayFailureTracker()
        expect(tracker.markSourceLogged('a')).toBe(true)
        expect(tracker.markSourceLogged('a')).toBe(false)
        expect(tracker.markSourceLogged('b')).toBe(true)
    })
})

describe('handlePlayFailure', () => {
    const notSupported = () => Object.assign(new Error('The element has no supported sources.'), { name: 'NotSupportedError' })

    test('logs the first failure in full plus source info, then only a repeat count, then gives up', () => {
        const log = vi.fn()
        const tracker = createPlayFailureTracker({ maxSourceFailures: 4 })
        const args = () => ({ tracker, error: notSupported(), video: fakeVideo(), src: 'video:///a.mp4', resolvedSrc: 'video:////a.mp4', segment, log })

        expect(handlePlayFailure(args())).toBe(false)
        expect(log.mock.calls.map(c => c[0].message)).toEqual(['error', 'video source info'])
        expect(log.mock.calls[0][0]).toMatchObject({ resolvedSrc: 'video:////a.mp4', errorName: 'NotSupportedError' })

        log.mockClear()
        expect(handlePlayFailure(args())).toBe(false)
        expect(log.mock.calls.map(c => c[0].message)).toEqual(['play failed again'])
        expect(log.mock.calls[0][0]).toMatchObject({ count: 2, errorName: 'NotSupportedError', routeId: 'r1' })

        log.mockClear()
        expect(handlePlayFailure(args())).toBe(false)
        expect(log).not.toHaveBeenCalled()

        expect(handlePlayFailure(args())).toBe(true)
        expect(log.mock.calls.map(c => c[0].message)).toContain('giving up playback start')
    })

    test('src differs from resolvedSrc in the logs when the legacy workaround applied', () => {
        const log = vi.fn()
        handlePlayFailure({ tracker: createPlayFailureTracker(), error: notSupported(), video: fakeVideo(), src: 'file:///a.mp4', resolvedSrc: 'file:////a.mp4', log })
        const info = log.mock.calls.find(c => c[0].message === 'video source info')[0]
        expect(info.src).toBe('file:///a.mp4')
        expect(info.resolvedSrc).toBe('file:////a.mp4')
    })
})
