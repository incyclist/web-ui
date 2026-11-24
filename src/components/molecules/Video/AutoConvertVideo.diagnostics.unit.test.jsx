import React from 'react'
import { EventEmitter } from 'events'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'

const { logEventMock } = vi.hoisted(() => ({ logEventMock: vi.fn() }))

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: class { logEvent(e) { logEventMock(e) } }
}))

import { AutoConvertVideo } from './AutoConvertVideo'

class FakeMediaSource extends EventEmitter {
    static isTypeSupported = vi.fn(() => true)
    addEventListener(ev, cb) { this.on(ev, cb) }
    addSourceBuffer = vi.fn()
}

describe('AutoConvertVideo diagnostics', () => {
    beforeEach(() => {
        vi.stubGlobal('MediaSource', FakeMediaSource)
        URL.createObjectURL = vi.fn(() => 'blob:test')
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
        logEventMock.mockClear()
    })

    test('element error logs code, message, element state, video url and segment', () => {
        const observer = new EventEmitter()
        const conversion = { getObserver: () => observer, convert: vi.fn(), stop: vi.fn(), getUrl: () => 'file:///a/b.avi' }
        const onLoadError = vi.fn()
        const { container } = render(
            <AutoConvertVideo src={conversion} segment={{ routeId: 'r1', index: 0, count: 1, hasNext: false }} onLoadError={onLoadError} />)
        const video = container.querySelector('video')
        Object.defineProperty(video, 'error', { value: { code: 3, message: 'PIPELINE_ERROR_DECODE' } })

        fireEvent.error(video)

        const entry = logEventMock.mock.calls.map(c => c[0]).find(e => e.message === 'video element error')
        expect(entry).toMatchObject({
            code: 3, mediaErrorMessage: 'PIPELINE_ERROR_DECODE', error: 'PIPELINE_ERROR_DECODE', phase: 'loading',
            video: 'file:///a/b.avi', routeId: 'r1', playback: 'converted'
        })
        expect(onLoadError).toHaveBeenCalledTimes(1)
    })

    test('failed play() logs the error text and url, and is not retried on every tick', async () => {
        const err = Object.assign(new Error('The element has no supported sources.'), { name: 'NotSupportedError' })
        const playSpy = vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockRejectedValue(err)
        vi.useFakeTimers({ toFake: ['Date'] })
        try {
            const observer = new EventEmitter()
            observer.stop = vi.fn()
            const conversion = { getObserver: () => new EventEmitter(), convert: vi.fn(), stop: vi.fn(), getUrl: () => 'file:///a/b.avi' }
            render(<AutoConvertVideo src={conversion} observer={observer} />)

            let rate = 1
            for (let i = 0; i < 20; i++) {
                vi.setSystemTime(Date.now() + 1000)
                await act(async () => { observer.emit('rate-update', rate += 0.1) })
                await act(async () => { await Promise.resolve() })
            }

            expect(playSpy.mock.calls.length).toBeLessThanOrEqual(3)
            const entry = logEventMock.mock.calls.map(c => c[0]).find(e => e.fn === 'startPlay')
            expect(entry).toMatchObject({ error: 'The element has no supported sources.', errorName: 'NotSupportedError', video: 'file:///a/b.avi' })
        }
        finally {
            vi.useRealTimers()
        }
    })

    describe('play() rejection', () => {
        const abortError = () => Object.assign(
            new Error('The play() request was interrupted because the media was removed from the document'), { name: 'AbortError' })
        const createConversion = () => ({ getObserver: () => new EventEmitter(), convert: vi.fn(), stop: vi.fn(), getUrl: () => 'file:///a/b.avi' })

        test('is not logged when it arrives after the component was unmounted', async () => {
            let rejectPlay
            vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockReturnValue(new Promise((_, rej) => { rejectPlay = rej }))
            const observer = new EventEmitter()
            observer.stop = vi.fn()
            const onLoadError = vi.fn()
            const onPlaybackError = vi.fn()
            const { unmount } = render(<AutoConvertVideo src={createConversion()} observer={observer} onLoadError={onLoadError} onPlaybackError={onPlaybackError} />)

            await act(async () => { observer.emit('rate-update', 1.5) })
            unmount()
            await act(async () => { rejectPlay(abortError()) })

            expect(logEventMock.mock.calls.map(c => c[0]).filter(e => e.fn === 'startPlay')).toHaveLength(0)
            expect(onLoadError).not.toHaveBeenCalled()
            expect(onPlaybackError).not.toHaveBeenCalled()
        })

        test('is still logged while the component is mounted', async () => {
            let rejectPlay
            vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockReturnValue(new Promise((_, rej) => { rejectPlay = rej }))
            const observer = new EventEmitter()
            observer.stop = vi.fn()
            render(<AutoConvertVideo src={createConversion()} observer={observer} />)

            await act(async () => { observer.emit('rate-update', 1.5) })
            await act(async () => { rejectPlay(abortError()) })

            expect(logEventMock.mock.calls.map(c => c[0]).filter(e => e.fn === 'startPlay')).toHaveLength(1)
        })
    })
})
