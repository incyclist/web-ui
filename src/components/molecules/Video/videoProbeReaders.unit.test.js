import { vi } from 'vitest'
import {
    isRemoteUrl, readHttpHeadTail, readFileHeadTail, probeMp4Codec,
    CODEC_PROBE_CHUNK_SIZES_REMOTE, CODEC_PROBE_CHUNK_SIZES_LOCAL
} from './videoProbeReaders'

describe('isRemoteUrl', () => {
    test('http/https urls are remote', () => {
        expect(isRemoteUrl('https://example.com/video.mp4')).toBe(true)
        expect(isRemoteUrl('http://example.com/video.mp4')).toBe(true)
    })

    test('file/video/incyclist urls are not remote', () => {
        expect(isRemoteUrl('file:///home/user/video.mp4')).toBe(false)
        expect(isRemoteUrl('video:///home/user/video.mp4')).toBe(false)
        expect(isRemoteUrl(undefined)).toBe(false)
    })
})

describe('readHttpHeadTail', () => {
    const headOnlyResponse = (size) => ({
        headers: { get: (name) => name === 'content-length' ? String(size) : null }
    })
    const rangeResponse = (bytes) => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array(bytes).buffer,
        // real CDNs don't expose content-range cross-origin without an explicit
        // Access-Control-Expose-Headers - simulate that by never returning it here
        headers: { get: () => null }
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('single request when file fits within one chunk (HEAD says small enough)', async () => {
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(headOnlyResponse(100))
            .mockResolvedValueOnce(rangeResponse(new Array(100).fill(1)))
        global.fetch = fetchMock

        const { head, tail, size } = await readHttpHeadTail('https://example.com/video.mp4', 65536)

        expect(fetchMock).toHaveBeenCalledTimes(2) // HEAD + ranged GET, no tail needed
        expect(head.length).toBe(100)
        expect(tail).toBeUndefined()
        expect(size).toBe(100)
    })

    test('gets total size from a HEAD request (Content-Length), not from Content-Range on the ranged GET', async () => {
        // regression: real video CDNs don't send Access-Control-Expose-Headers: Content-Range,
        // so browsers can't read content-range cross-origin even though the request succeeds
        const totalSize = 200000
        const fetchMock = vi.fn()
            .mockResolvedValueOnce(headOnlyResponse(totalSize))
            .mockResolvedValueOnce(rangeResponse(new Array(1000).fill(1)))
            .mockResolvedValueOnce(rangeResponse(new Array(1000).fill(2)))
        global.fetch = fetchMock

        const { head, tail, size } = await readHttpHeadTail('https://example.com/video.mp4', 1000)

        expect(fetchMock).toHaveBeenCalledTimes(3)
        expect(fetchMock.mock.calls[0][1]).toEqual({ method: 'HEAD' })
        expect(fetchMock.mock.calls[1][1].headers.Range).toBe('bytes=0-999')
        expect(fetchMock.mock.calls[2][1].headers.Range).toBe(`bytes=${totalSize - 1000}-${totalSize - 1}`)
        expect(head.length).toBe(1000)
        expect(tail.length).toBe(1000)
        expect(size).toBe(totalSize)
    })

    test('falls back to head-only when the HEAD request itself fails (some servers reject HEAD)', async () => {
        const fetchMock = vi.fn()
            .mockRejectedValueOnce(new Error('HEAD not allowed'))
            .mockResolvedValueOnce(rangeResponse(new Array(1000).fill(1)))
        global.fetch = fetchMock

        const { head, tail, size } = await readHttpHeadTail('https://example.com/video.mp4', 1000)

        expect(head.length).toBe(1000)
        expect(tail).toBeUndefined()
        expect(size).toBeUndefined()
    })

    test('throws when the range request fails', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce(headOnlyResponse(100))
            .mockResolvedValueOnce({ ok: false, status: 404 })

        await expect(readHttpHeadTail('https://example.com/missing.mp4')).rejects.toThrow(/404/)
    })
})

describe('probeMp4Codec', () => {
    const headOnlyResponse = (size) => ({
        headers: { get: (name) => name === 'content-length' ? String(size) : null }
    })
    const rangeResponse = (length) => ({
        ok: true,
        arrayBuffer: async () => new Uint8Array(length).buffer,
        headers: { get: () => null }
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('stops at the first chunk size that yields a complete result, no escalation', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce(headOnlyResponse(500))
            .mockResolvedValueOnce(rangeResponse(500))
        const parseBoxes = vi.fn().mockReturnValue({ videoCodec: 'avc1', incomplete: false })

        const result = await probeMp4Codec('https://example.com/video.mp4', parseBoxes)

        expect(parseBoxes).toHaveBeenCalledTimes(1)
        expect(result).toMatchObject({
            videoCodec: 'avc1', incomplete: false,
            attempts: 1, chunkSizeUsed: CODEC_PROBE_CHUNK_SIZES_REMOTE[0]
        })
        expect(result.durationMs).toBeGreaterThanOrEqual(0)
    })

    test('escalates through the ladder while incomplete, stops once found - reports how many tiers it took', async () => {
        // 4 fetch calls per chunk-size attempt (HEAD + head-GET + HEAD + tail-GET, since size
        // is re-fetched each attempt) - only assert on parseBoxes call count/args, which is
        // what proves the escalation behavior regardless of the exact fetch call count
        global.fetch = vi.fn().mockImplementation((url, opts) => {
            if (opts?.method === 'HEAD')
                return Promise.resolve(headOnlyResponse(50 * 1024 * 1024))
            return Promise.resolve(rangeResponse(1000))
        })

        const parseBoxes = vi.fn()
            .mockReturnValueOnce({ incomplete: true })
            .mockReturnValueOnce({ incomplete: true })
            .mockReturnValueOnce({ videoCodec: 'hev1', incomplete: false })

        const result = await probeMp4Codec('https://example.com/video.mp4', parseBoxes)

        expect(parseBoxes).toHaveBeenCalledTimes(3)
        expect(result).toMatchObject({
            videoCodec: 'hev1', incomplete: false,
            attempts: 3, chunkSizeUsed: CODEC_PROBE_CHUNK_SIZES_REMOTE[2]
        })
    })

    test('gives up after exhausting the ladder (capped, not indefinite) and returns the last incomplete result', async () => {
        global.fetch = vi.fn().mockImplementation((url, opts) => {
            if (opts?.method === 'HEAD')
                return Promise.resolve(headOnlyResponse(50 * 1024 * 1024))
            return Promise.resolve(rangeResponse(1000))
        })

        const parseBoxes = vi.fn().mockReturnValue({ incomplete: true })

        const result = await probeMp4Codec('https://example.com/video.mp4', parseBoxes)

        expect(parseBoxes).toHaveBeenCalledTimes(CODEC_PROBE_CHUNK_SIZES_REMOTE.length)
        expect(result).toMatchObject({ incomplete: true, attempts: CODEC_PROBE_CHUNK_SIZES_REMOTE.length })
    })

    test('local files use the more generous local ladder, remote files the conservative one', () => {
        expect(CODEC_PROBE_CHUNK_SIZES_LOCAL[CODEC_PROBE_CHUNK_SIZES_LOCAL.length - 1])
            .toBeGreaterThan(CODEC_PROBE_CHUNK_SIZES_REMOTE[CODEC_PROBE_CHUNK_SIZES_REMOTE.length - 1])
    })
})

describe('readFileHeadTail', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllGlobals()
        delete window.electron
        delete window.require
    })

    test('throws outside Electron (no window.electron)', async () => {
        delete window.electron
        await expect(readFileHeadTail('file:///home/user/video.mp4')).rejects.toThrow(/Electron/)
    })
})
