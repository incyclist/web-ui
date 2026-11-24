import React from 'react'
import { EventEmitter } from 'events'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act, fireEvent } from '@testing-library/react'

const { hasFeatureMock, logEventMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn(), logEventMock: vi.fn() }))

vi.mock('../../../utils/electron/integration', () => ({ hasFeature: hasFeatureMock }))
vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: class { logEvent(e) { logEventMock(e) } }
}))

import { Video } from './Video'

const createObserver = () => {
    const observer = new EventEmitter()
    observer.stop = vi.fn()
    return observer
}

const notSupported = () => Object.assign(new Error('The element has no supported sources.'), { name: 'NotSupportedError' })
const messages = () => logEventMock.mock.calls.map(c => c[0].message)
const segment = { routeId: 'r1', index: 1, count: 2, hasNext: false }

describe('Video diagnostics', () => {
    let playSpy

    beforeEach(() => {
        hasFeatureMock.mockReturnValue(false) // legacy workaround active: src differs from resolvedSrc
        vi.useFakeTimers({ toFake: ['Date'] })
        playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockRejectedValue(notSupported())
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
        logEventMock.mockClear()
    })

    const tick = async (observer, rate) => {
        await act(async () => { observer.emit('rate-update', rate) })
        await act(async () => { await Promise.resolve() })
    }

    test('element error logs media error details, src and resolvedSrc, segment, and calls onLoadError', () => {
        const onLoadError = vi.fn()
        const { container } = render(<Video src="video:///local/route.mp4" segment={segment} onLoadError={onLoadError} />)
        const video = container.querySelector('video')
        Object.defineProperty(video, 'error', { value: { code: 4, message: 'DEMUXER_ERROR_COULD_NOT_OPEN' } })

        fireEvent.error(video)

        const entry = logEventMock.mock.calls.map(c => c[0]).find(e => e.message === 'video element error')
        expect(entry).toMatchObject({
            code: 4, mediaErrorMessage: 'DEMUXER_ERROR_COULD_NOT_OPEN', phase: 'loading',
            src: 'video:///local/route.mp4', resolvedSrc: 'video:////local/route.mp4',
            routeId: 'r1', segmentIndex: 1, hasNext: false
        })
        expect(entry.src).not.toBe(entry.resolvedSrc)
        expect(onLoadError).toHaveBeenCalledTimes(1)
    })

    test('a failing play() is logged in full once with errorName and resolvedSrc', async () => {
        const observer = createObserver()
        render(<Video src="video:///local/route.mp4" observer={observer} segment={segment} />)

        await tick(observer, 1.5)

        const entries = logEventMock.mock.calls.map(c => c[0])
        expect(entries.find(e => e.fn === 'startPlay')).toMatchObject({
            errorName: 'NotSupportedError', error: 'The element has no supported sources.',
            resolvedSrc: 'video:////local/route.mp4', routeId: 'r1'
        })
        expect(entries.find(e => e.message === 'video source info')).toMatchObject({ extension: 'mp4', mime: 'video/mp4' })
    })

    test('does not retry on every tick: backs off, gives up and reports one error', async () => {
        const observer = createObserver()
        const onLoadError = vi.fn()
        const onPlaybackError = vi.fn()
        render(<Video src="video:///local/route.mp4" observer={observer} onLoadError={onLoadError} onPlaybackError={onPlaybackError} />)

        let rate = 1
        for (let i = 0; i < 30; i++) {
            vi.setSystemTime(Date.now() + 1000)    // one sync tick per second
            await tick(observer, rate += 0.1)
        }

        // 30 ticks but at most 3 attempts (back-off 1s, 2s, then give up)
        expect(playSpy.mock.calls.length).toBeLessThanOrEqual(3)
        expect(playSpy.mock.calls.length).toBeGreaterThanOrEqual(2)
        expect(messages().filter(m => m === 'error')).toHaveLength(1)
        expect(messages()).toContain('giving up playback start')
        expect(onLoadError.mock.calls.length + onPlaybackError.mock.calls.length).toBe(1)
    })

    test('does not report twice when the element already reported the error', async () => {
        const observer = createObserver()
        const onLoadError = vi.fn()
        const { container } = render(<Video src="video:///local/route.mp4" observer={observer} onLoadError={onLoadError} />)
        const video = container.querySelector('video')
        Object.defineProperty(video, 'error', { value: { code: 4, message: 'x' } })
        fireEvent.error(video)

        let rate = 1
        for (let i = 0; i < 10; i++) {
            vi.setSystemTime(Date.now() + 10000)
            await tick(observer, rate += 0.1)
        }
        expect(onLoadError).toHaveBeenCalledTimes(1)
    })

    test('clamps rates below the supported range instead of throwing', async () => {
        playSpy.mockResolvedValue(undefined)
        const observer = createObserver()
        const { container } = render(<Video src="video:///local/route.mp4" observer={observer} />)

        await tick(observer, 0.0569247)

        expect(container.querySelector('video').playbackRate).toBe(0.0625)
        expect(messages()).not.toContain('failed to set rate')
    })

    describe('play() rejection', () => {
        const abortError = () => Object.assign(
            new Error('The play() request was interrupted because the media was removed from the document'), { name: 'AbortError' })

        test('is not logged when it arrives after the component was unmounted', async () => {
            let rejectPlay
            playSpy.mockReturnValue(new Promise((_, rej) => { rejectPlay = rej }))
            const observer = createObserver()
            const onLoadError = vi.fn()
            const onPlaybackError = vi.fn()
            const { unmount } = render(<Video src="video:///local/route.mp4" observer={observer} onLoadError={onLoadError} onPlaybackError={onPlaybackError} />)

            await act(async () => { observer.emit('rate-update', 1.5) })
            unmount()
            await act(async () => { rejectPlay(abortError()) })

            expect(logEventMock.mock.calls.map(c => c[0]).filter(e => e.fn === 'startPlay')).toHaveLength(0)
            expect(onLoadError).not.toHaveBeenCalled()
            expect(onPlaybackError).not.toHaveBeenCalled()
        })

        test('is still logged while the component is mounted', async () => {
            let rejectPlay
            playSpy.mockReturnValue(new Promise((_, rej) => { rejectPlay = rej }))
            const observer = createObserver()
            render(<Video src="video:///local/route.mp4" observer={observer} />)

            await act(async () => { observer.emit('rate-update', 1.5) })
            await act(async () => { rejectPlay(abortError()) })

            expect(logEventMock.mock.calls.map(c => c[0]).filter(e => e.fn === 'startPlay')).toHaveLength(1)
        })
    })

    test('a pause request (rate 0) arriving while play() is pending is applied once play() resolved', async () => {
        let resolvePlay
        playSpy.mockReturnValue(new Promise(res => { resolvePlay = res }))
        const pauseSpy = window.HTMLMediaElement.prototype.pause
        const observer = createObserver()
        render(<Video src="video:///local/route.mp4" observer={observer} />)

        await tick(observer, 1.5)
        await tick(observer, 0)
        pauseSpy.mockClear()
        await act(async () => { resolvePlay() })

        expect(pauseSpy).toHaveBeenCalledTimes(1)
    })
})
