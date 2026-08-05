import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'

const { logEventMock, hasFeatureMock } = vi.hoisted(() => ({ logEventMock: vi.fn(), hasFeatureMock: vi.fn() }))

vi.mock('gd-eventlog', () => ({
    EventLogger: class {
        logEvent(e) { logEventMock(e) }
    }
}))

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, parseMp4Boxes: vi.fn() }
})

vi.mock('./videoProbeReaders', () => ({
    probeMp4Codec: vi.fn()
}))

vi.mock('../../../utils/electron/integration', () => ({
    hasFeature: hasFeatureMock
}))

import { probeMp4Codec } from './videoProbeReaders'
import { VideoProbe } from './VideoProbe'

describe('VideoProbe', () => {

    beforeEach(() => {
        hasFeatureMock.mockReturnValue(false) // old desktop by default, matches most real installs today
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    test('renders nothing (no visible output) when there is no url', () => {
        const { container } = render(<VideoProbe url={undefined} />)
        expect(container.querySelector('video')).toBeNull()
    })

    test('renders an invisible (opacity:0) video element pointed at the real url', () => {
        probeMp4Codec.mockReturnValue(new Promise(() => {})) // never resolves, keep this test synchronous
        const { container } = render(<VideoProbe url="https://example.com/route.mp4" routeId="r1" />)

        const video = container.querySelector('video')
        expect(video).not.toBeNull()
        expect(video.src).toBe('https://example.com/route.mp4')
        expect(video.style.opacity).toBe('0')
    })

    test('pass/fail element uses the real-playback url (video: -> file:), not the raw stored route url', () => {
        // regression: real-world data showed a local video with a malformed video:////... url
        // played fine in a real ride (which uses file:, tolerant of the extra slash) but failed
        // this probe when it used the raw video: url directly (not tolerant, false decode-error)
        probeMp4Codec.mockReturnValue(new Promise(() => {}))
        const { container } = render(<VideoProbe url="video:////mnt/nas/route.mp4" routeId="r5" />)

        const video = container.querySelector('video')
        expect(video.src).toBe('file:////mnt/nas/route.mp4')
    })

    test('applies the legacy local-url workaround to the resolved playback url on old desktop', () => {
        // file:///local/route.mp4 -> resolvePlaybackUrl swaps to video:///local/route.mp4
        // (desktop, non-avi) -> old desktop's getFileInfo() bug would strip that url's own
        // leading slash, so the workaround inserts a compensating one before it reaches the
        // custom video: protocol handler
        probeMp4Codec.mockReturnValue(new Promise(() => {}))
        const { container } = render(<VideoProbe url="file:///local/route.mp4" routeId="r9" />)

        expect(container.querySelector('video').src).toBe('video:////local/route.mp4')
    })

    test('leaves the resolved playback url unchanged on desktop with the fix', () => {
        hasFeatureMock.mockReturnValue(true)
        probeMp4Codec.mockReturnValue(new Promise(() => {}))
        const { container } = render(<VideoProbe url="file:///local/route.mp4" routeId="r10" />)

        expect(container.querySelector('video').src).toBe('video:///local/route.mp4')
    })

    test('remote urls are unaffected by the playback-url rewrite', () => {
        probeMp4Codec.mockReturnValue(new Promise(() => {}))
        const { container } = render(<VideoProbe url="https://example.com/route.mp4" routeId="r6" />)

        expect(container.querySelector('video').src).toBe('https://example.com/route.mp4')
    })

    test('logs a combined event once both the box-parse and the playback check resolve (success case)', async () => {
        const codecDetails = { profile: 'High', profileId: 100, level: '4.1', chromaFormat: '4:2:0', bitDepthLuma: 8, bitDepthChroma: 8 }
        probeMp4Codec.mockResolvedValue({
            videoCodec: 'avc1', audioCodec: 'mp4a', containerBrand: 'isom', codecDetails,
            width: 1920, height: 1080, moovLocation: 'head', incomplete: false
        })

        const { container } = render(
            <VideoProbe url="https://example.com/route.mp4" routeId="r1" extension="mp4" />
        )

        const video = container.querySelector('video')
        fireEvent.loadedMetadata(video)

        await waitFor(() => expect(logEventMock).toHaveBeenCalledTimes(1))

        expect(logEventMock).toHaveBeenCalledWith(expect.objectContaining({
            message: 'video probe result',
            routeId: 'r1',
            videoUrl: 'https://example.com/route.mp4',
            sourceType: 'remote',
            extension: 'mp4',
            videoCodec: 'avc1',
            audioCodec: 'mp4a',
            codecDetails,
            containerBrand: 'isom',
            width: 1920,
            height: 1080,
            moovLocation: 'head',
            boxParseIncomplete: false,
            result: 'ok'
        }))
    })

    test('logs the playback error code/message when the hidden video fails to decode', async () => {
        probeMp4Codec.mockResolvedValue({ videoCodec: 'hev1', audioCodec: 'mp4a', incomplete: false })

        const { container } = render(<VideoProbe url="file:///local/route.mp4" routeId="r2" />)
        const video = container.querySelector('video')

        Object.defineProperty(video, 'error', {
            value: { code: 3, message: 'DECODE error' },
            configurable: true
        })
        fireEvent.error(video)

        await waitFor(() => expect(logEventMock).toHaveBeenCalledTimes(1))

        expect(logEventMock).toHaveBeenCalledWith(expect.objectContaining({
            sourceType: 'local',
            result: 'decode-error',
            errorCode: 3,
            errorMessage: 'DECODE error'
        }))
    })

    test('still logs (with partial data) when the probe itself throws', async () => {
        probeMp4Codec.mockRejectedValue(new Error('range request failed'))

        const { container } = render(<VideoProbe url="https://example.com/route.mp4" routeId="r3" />)
        const video = container.querySelector('video')
        fireEvent.loadedMetadata(video)

        await waitFor(() => expect(logEventMock).toHaveBeenCalledTimes(1))

        expect(logEventMock).toHaveBeenCalledWith(expect.objectContaining({
            routeId: 'r3',
            result: 'ok',
            boxParseIncomplete: true
        }))
    })

    test('passes through the box-parse timing/tier fields from probeMp4Codec', async () => {
        probeMp4Codec.mockResolvedValue({
            videoCodec: 'hvc1', incomplete: false, attempts: 3, chunkSizeUsed: 16 * 1024 * 1024, durationMs: 842
        })

        const { container } = render(<VideoProbe url="file:///local/route.mp4" routeId="r7" />)
        fireEvent.loadedMetadata(container.querySelector('video'))

        await waitFor(() => expect(logEventMock).toHaveBeenCalledTimes(1))

        expect(logEventMock).toHaveBeenCalledWith(expect.objectContaining({
            boxParseAttempts: 3,
            boxParseChunkSize: 16 * 1024 * 1024,
            boxParseDurationMs: 842
        }))
    })

    test('logs how long the native playback check took to resolve', async () => {
        probeMp4Codec.mockResolvedValue({ videoCodec: 'avc1', incomplete: false })

        const { container } = render(<VideoProbe url="https://example.com/route.mp4" routeId="r8" />)
        fireEvent.loadedMetadata(container.querySelector('video'))

        await waitFor(() => expect(logEventMock).toHaveBeenCalledTimes(1))

        const loggedEvent = logEventMock.mock.calls[0][0]
        expect(loggedEvent.playbackDurationMs).toBeGreaterThanOrEqual(0)
    })

    test('does not log twice if both checks resolve', async () => {
        probeMp4Codec.mockResolvedValue({ videoCodec: 'avc1', incomplete: false })

        const { container } = render(<VideoProbe url="https://example.com/route.mp4" routeId="r4" />)
        const video = container.querySelector('video')

        fireEvent.loadedMetadata(video)
        fireEvent.loadedMetadata(video)

        await waitFor(() => expect(logEventMock).toHaveBeenCalledTimes(1))
    })
})
