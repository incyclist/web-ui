import React, { useEffect, useRef } from 'react'
import { EventLogger } from 'gd-eventlog'
import { parseMp4Boxes, resolvePlaybackUrl } from 'incyclist-services'

import { probeMp4Codec } from './videoProbeReaders'

/**
 * Silently probes a video route's file, before the user starts a ride, to understand
 * production "could not decode video" failures - see design/video-decode-diagnostics.md.
 * Primary goal: root-cause cases where the video component actually reports an error.
 *
 * Two independent checks run in parallel and are logged together, deliberately not sharing
 * data with each other:
 *  - codec identity: parses ftyp/stsd boxes out of a head+tail read, escalating the chunk
 *    size (probeMp4Codec) if moov isn't found at the first size - real ride-length videos
 *    can have a moov well past 1MB, a fixed guess proved too fragile against real data
 *  - real pass/fail: a hidden native <video src={playbackUrl}> lets Chromium attempt its own
 *    load, so the verdict is never contaminated by anything our own bounded read did
 *
 * The pass/fail element uses resolvePlaybackUrl() - the same scheme rewrite
 * RLVDisplayService.cleanupUrl() applies for a real ride - not the raw stored route URL.
 * This matters: real-world data caught this. A local video with a malformed extra-slash
 * path (video:////mnt/...) played fine in a real ride but failed this probe, because
 * Chromium tolerates extra slashes on the special `file:` scheme (what a real ride actually
 * uses) but passes a custom, non-special scheme like `video:` through literally. Probing the
 * raw url would have logged a false decode failure that doesn't reflect real playback.
 *
 * Renders an invisible (opacity:0, not display:none - some browsers skip/delay decode work
 * on display:none media elements) 1x1 <video> element; nothing here is shown to the user.
 */
export const VideoProbe = ({ url, routeId, extension }) => {

    const playbackUrl = resolvePlaybackUrl(url, false) // desktop only - see design doc, mobile deferred
    const refVideo = useRef(null)
    const refLogger = useRef(new EventLogger('VideoProbe'))
    const refState = useRef({ boxInfo: undefined, playbackResult: undefined, logged: false, mountTs: 0 })

    const logIfComplete = () => {
        const { boxInfo, playbackResult, logged } = refState.current
        if (logged || boxInfo === undefined || playbackResult === undefined)
            return

        refState.current.logged = true

        refLogger.current.logEvent({
            message: 'video probe result',
            routeId,
            videoUrl: url,
            sourceType: /^https?:/i.test(url ?? '') ? 'remote' : 'local',
            extension,
            videoCodec: boxInfo.videoCodec,
            audioCodec: boxInfo.audioCodec,
            codecDetails: boxInfo.codecDetails,
            containerBrand: boxInfo.containerBrand,
            width: boxInfo.width,
            height: boxInfo.height,
            moovLocation: boxInfo.moovLocation,
            boxParseIncomplete: boxInfo.incomplete,
            boxParseAttempts: boxInfo.attempts,
            boxParseChunkSize: boxInfo.chunkSizeUsed,
            boxParseDurationMs: boxInfo.durationMs,
            result: playbackResult.result,
            errorMessage: playbackResult.errorMessage,
            errorCode: playbackResult.errorCode,
            playbackDurationMs: playbackResult.durationMs
        })
    }

    useEffect(() => {
        let cancelled = false
        refState.current = { boxInfo: undefined, playbackResult: undefined, logged: false, mountTs: Date.now() }

        if (!url) {
            return
        }

        probeMp4Codec(url, parseMp4Boxes)
            .catch((err) => ({ incomplete: true, parseError: err?.message }))
            .then((boxInfo) => {
                if (cancelled) return
                refState.current.boxInfo = boxInfo ?? {}
                logIfComplete()
            })

        return () => { cancelled = true }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url])

    const onLoadedMetadata = () => {
        refState.current.playbackResult = { result: 'ok', durationMs: Date.now() - refState.current.mountTs }
        logIfComplete()
    }

    const onError = () => {
        const error = refVideo.current?.error
        refState.current.playbackResult = {
            result: 'decode-error',
            errorCode: error?.code,
            errorMessage: error?.message,
            durationMs: Date.now() - refState.current.mountTs
        }
        logIfComplete()
    }

    if (!url) {
        return null
    }

    return (
        <video
            ref={refVideo}
            src={playbackUrl}
            preload="metadata"
            muted
            style={{ opacity: 0, position: 'absolute', width: 1, height: 1, pointerEvents: 'none' }}
            onLoadedMetadata={onLoadedMetadata}
            onError={onError}
        />
    )
}
