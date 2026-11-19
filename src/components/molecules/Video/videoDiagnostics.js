// Shared by Video.jsx and AutoConvertVideo.jsx: pure helpers that build the diagnostic log payloads
// for failed video playback, and that limit retries/logging of a failing play() call.

// Chromium rejects (throws on) playback rates below this value
export const MIN_PLAYBACK_RATE = 0.0625

/** Raises a positive rate that is below the supported range to the minimum. 0 (pause) is kept as is */
export const clampPlaybackRate = (rate) => (rate > 0 && rate < MIN_PLAYBACK_RATE) ? MIN_PLAYBACK_RATE : rate

/** Lower case file extension of a url (without query or hash), undefined if there is none */
export const getFileExtension = (url) => {
    if (typeof url !== 'string')
        return undefined
    const path = url.split(/[?#]/)[0]
    const name = path.split(/[/\\]/).pop()
    const idx = name.lastIndexOf('.')
    return idx > 0 ? name.slice(idx + 1).toLowerCase() : undefined
}

const MIME_BY_EXTENSION = {
    mp4: 'video/mp4', m4v: 'video/mp4', webm: 'video/webm', mkv: 'video/x-matroska',
    avi: 'video/x-msvideo', mov: 'video/quicktime', ogv: 'video/ogg'
}

const elementState = (video) => ({
    networkState: video?.networkState,
    readyState: video?.readyState,
    currentSrc: video?.currentSrc
})

// identifies which part of a chained route a log entry belongs to
const segmentFields = (segment) => segment ? {
    routeId: segment.routeId,
    segmentIndex: segment.index,
    segmentCount: segment.count,
    hasNext: segment.hasNext
} : {}

/** Payload for the element's `error` event. phase: 'loading' | 'playback' */
export const buildElementErrorLog = ({ video, phase, src, resolvedSrc, segment }) => ({
    message: 'video element error',
    code: video?.error?.code,
    mediaErrorMessage: video?.error?.message,
    phase,
    ...elementState(video),
    src,
    resolvedSrc,
    ...segmentFields(segment)
})

/** Payload for a rejected play() call */
export const buildPlayFailureLog = ({ error, video, resolvedSrc, segment }) => ({
    message: 'error',
    fn: 'startPlay',
    error: error?.message,
    errorName: error?.name,
    ...elementState(video),
    resolvedSrc,
    ...segmentFields(segment)
})

/** Payload with extension and canPlayType() of the matching container (logged once per src) */
export const buildSourceInfoLog = ({ video, src, resolvedSrc, segment }) => {
    const extension = getFileExtension(resolvedSrc) ?? getFileExtension(src)
    const mime = MIME_BY_EXTENSION[extension]
    let canPlayType
    try {
        canPlayType = mime ? video?.canPlayType?.(mime) : undefined
    }
    catch { /* ignore */ }

    return { message: 'video source info', extension, mime, canPlayType, src, resolvedSrc, ...segmentFields(segment) }
}

const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0

/**
 * Tracks failed play() calls: exponential back-off between attempts, gives up for good after repeated
 * source errors (NotSupportedError), and decides which failures are worth a log line
 */
export const createPlayFailureTracker = ({ maxSourceFailures = 3, baseDelayMs = 1000, maxDelayMs = 8000, now = Date.now } = {}) => {
    const counts = new Map()
    const loggedSources = new Set()
    let consecutive = 0
    let nextAttemptAt = 0
    let gaveUp = false

    return {
        canAttempt: () => !gaveUp && now() >= nextAttemptAt,
        hasGivenUp: () => gaveUp,

        recordFailure: (src, errorName) => {
            const key = `${src}|${errorName}`
            const count = (counts.get(key) ?? 0) + 1
            counts.set(key, count)

            consecutive++
            nextAttemptAt = now() + Math.min(baseDelayMs * 2 ** (consecutive - 1), maxDelayMs)

            const giveUp = errorName === 'NotSupportedError' && count >= maxSourceFailures
            if (giveUp)
                gaveUp = true

            return { count, first: count === 1, logRepeat: count > 1 && isPowerOfTwo(count), giveUp }
        },

        recordSuccess: () => {
            consecutive = 0
            nextAttemptAt = 0
        },

        /** true only the first time a src is seen */
        markSourceLogged: (src) => {
            if (loggedSources.has(src))
                return false
            loggedSources.add(src)
            return true
        }
    }
}

/**
 * Logs a failed play() (first failure per src+error in full, then repeat counts only).
 * Returns true if the caller should stop retrying and report the source as unplayable.
 */
export const handlePlayFailure = ({ tracker, error, video, src, resolvedSrc, segment, log }) => {
    const errorName = error?.name
    const key = resolvedSrc ?? src ?? video?.currentSrc
    const res = tracker.recordFailure(key, errorName)

    if (res.first) {
        log(buildPlayFailureLog({ error, video, resolvedSrc, segment }))
        if (tracker.markSourceLogged(key))
            log(buildSourceInfoLog({ video, src, resolvedSrc, segment }))
    }
    else if (res.logRepeat) {
        log({ message: 'play failed again', errorName, count: res.count, resolvedSrc, ...segmentFields(segment) })
    }

    if (res.giveUp)
        log({ message: 'giving up playback start', errorName, count: res.count, resolvedSrc, ...segmentFields(segment) })

    return res.giveUp
}

/** Reports an unplayable source once, through the existing load/playback error callbacks */
export const reportUnplayable = ({ loading, video, error, onLoadError, onPlaybackError }) => {
    const mediaError = video?.error ?? { code: 4, message: error?.message }
    if (loading && onLoadError)
        onLoadError(mediaError)
    else if (!loading && onPlaybackError)
        onPlaybackError(mediaError)
}
