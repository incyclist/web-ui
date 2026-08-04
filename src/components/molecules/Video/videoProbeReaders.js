import { isElectron } from '../../../utils/electron/integration'

// Real, full-length ride videos can have a moov box well over 64KB (dense stco/stsz/stts
// sample tables for an hour of frames) - a small window can miss the box header entirely.
// 1MB is still negligible next to a hundreds-of-MB/GB video file. moovLocation/incomplete
// in the logged probe result make the real-world hit rate observable, so this can be tuned
// from production data rather than guessed further.
const DEFAULT_CHUNK_SIZE = 1024 * 1024

// Escalation ladder used when moov isn't found at the first chunk size (real ride-length
// videos can have moov well past 1MB - see the h265 case in design/video-decode-diagnostics.md
// that motivated this). Local reads are cheap to retry (local disk, no bandwidth cost), so
// escalate further; remote reads cost real network transfer per retry, so stay conservative.
export const CODEC_PROBE_CHUNK_SIZES_LOCAL = [1024 * 1024, 4 * 1024 * 1024, 16 * 1024 * 1024]
export const CODEC_PROBE_CHUNK_SIZES_REMOTE = [1024 * 1024, 2 * 1024 * 1024, 4 * 1024 * 1024]

export const isRemoteUrl = (url) => /^https?:/i.test(url ?? '')

const toFsPath = (url) => {
    let path = url.replace(/^(video|file|incyclist):\/\//i, '')
    try { path = decodeURIComponent(path) } catch { /* keep as-is if not encoded */ }

    // "video:///C:/Users/..." -> "/C:/Users/..." -> strip the extra leading slash on Windows drive paths
    if (/^\/[A-Za-z]:\//.test(path))
        path = path.slice(1)

    return path
}

/**
 * Reads a bounded head+tail of a local video file directly via Node's fs, bypassing the
 * api.fs/IPC binding entirely. Deliberate: nodeIntegration:true already exposes Node's fs
 * to this renderer today so this
 * needs no new binding, no desktop/src change, and stays fully async/non-blocking - see
 * design/video-decode-diagnostics.md for the full rationale (§3.1, decision #6).
 */
export const readFileHeadTail = async (url, chunkSize = DEFAULT_CHUNK_SIZE) => {
    if (!isElectron())
        throw new Error('local file range read requires Electron (nodeIntegration)')

    const fs = window.require('fs')
    const path = toFsPath(url)

    const size = (await fs.promises.stat(path)).size

    const readRange = (start, length) => new Promise((resolve, reject) => {
        const end = Math.min(start + length, size) - 1
        if (end < start) {
            resolve(Buffer.alloc(0))
            return
        }
        const chunks = []
        fs.createReadStream(path, { start, end })
            .on('data', (chunk) => chunks.push(chunk))
            .on('end', () => resolve(Buffer.concat(chunks)))
            .on('error', reject)
    })

    const head = await readRange(0, chunkSize)
    const tailStart = Math.max(0, size - chunkSize)
    const tail = tailStart > head.length ? await readRange(tailStart, chunkSize) : undefined

    return { head, tail, size }
}

/**
 * Reads a bounded head+tail of a remote video file via two Range-fetch requests. No binding
 * involved - fetch() with a Range header works the same everywhere.
 *
 * Total size comes from a separate HEAD request's Content-Length, not from the ranged GET's
 * Content-Range header. Content-Range is not on the CORS-safelisted response header list, so
 * a cross-origin server has to explicitly opt in via Access-Control-Expose-Headers for JS to
 * read it - none of the real video CDNs tested during development do, which silently skipped
 * the tail read (and therefore the codec lookup) for every non-faststart remote video. Content-
 * Length *is* CORS-safelisted by default, so it doesn't have this problem.
 */
export const readHttpHeadTail = async (url, chunkSize = DEFAULT_CHUNK_SIZE) => {
    let size
    try {
        const headOnlyResponse = await fetch(url, { method: 'HEAD' })
        const contentLength = headOnlyResponse.headers.get('content-length')
        size = contentLength ? Number(contentLength) : undefined
    }
    catch { /* some servers reject HEAD; fall back to head-chunk-only below */ }

    const headResponse = await fetch(url, { headers: { Range: `bytes=0-${chunkSize - 1}` } })
    if (!headResponse.ok)
        throw new Error(`range request failed: ${headResponse.status}`)

    const head = Buffer.from(await headResponse.arrayBuffer())

    let tail
    const tailStart = size ? Math.max(0, size - chunkSize) : undefined
    if (tailStart !== undefined && tailStart > head.length) {
        const tailResponse = await fetch(url, { headers: { Range: `bytes=${tailStart}-${size - 1}` } })
        if (tailResponse.ok)
            tail = Buffer.from(await tailResponse.arrayBuffer())
    }

    return { head, tail, size }
}

export const readVideoHeadTail = async (url, chunkSize = DEFAULT_CHUNK_SIZE) => {
    if (isRemoteUrl(url))
        return readHttpHeadTail(url, chunkSize)
    return readFileHeadTail(url, chunkSize)
}

/**
 * Reads head+tail at increasing chunk sizes until parseBoxes reports a complete result (moov
 * found) or the ladder is exhausted. `parseBoxes` is injected (rather than importing
 * parseMp4Boxes from incyclist-services directly) so this stays a pure I/O module, testable
 * without needing real box-parsing logic.
 *
 * Also reports how long this took and how many tiers it needed (durationMs, attempts,
 * chunkSizeUsed) - added specifically to find out whether the escalation ladder is a real,
 * measurable cost (e.g. for a NAS-mounted file needing the largest local tier, cumulative
 * re-reads could be substantial) rather than guessing at a fix.
 */
export const probeMp4Codec = async (url, parseBoxes) => {
    const sizes = isRemoteUrl(url) ? CODEC_PROBE_CHUNK_SIZES_REMOTE : CODEC_PROBE_CHUNK_SIZES_LOCAL
    const startTs = Date.now()

    let boxInfo
    let attempts = 0
    let chunkSizeUsed
    for (const chunkSize of sizes) {
        attempts += 1
        chunkSizeUsed = chunkSize
        const { head, tail } = await readVideoHeadTail(url, chunkSize)
        boxInfo = parseBoxes(head, tail)
        if (!boxInfo.incomplete)
            break
    }

    return { ...boxInfo, attempts, chunkSizeUsed, durationMs: Date.now() - startTs }
}
