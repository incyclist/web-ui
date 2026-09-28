import { hasFeature } from './electron/integration'

// Older desktop installs (pre incyclist/desktop#199) strip a well-formed local video:///
// or file:/// URL's own leading slash when parsing it (getFileInfo() split on the literal
// "scheme:///" instead of the real "scheme://" separator), turning an absolute Unix path
// into a relative one and failing the file lookup entirely. Matches only the well-formed
// 3-slash shape - already-4-slash urls and Windows drive-letter paths (scheme:///C:/...)
// never hit that bug and must be left alone.
const LEGACY_SLASH_BUG_URL = /^(video|file):\/\/\/(?!\/)(?![A-Za-z]:)/

/**
 * Inserting one extra slash compensates for the old bug exactly: its parsing then leaves
 * the needed leading slash behind instead of consuming it. This must never run once desktop
 * reports it has the fix (video.localUrlFix) - it already produces the correct absolute path
 * itself, and adding a slash there would double it (see the toFileUrl fix in the same desktop
 * PR). Applies uniformly to both file:/// and video:/// urls - even for a file:/// url that
 * would end up handled by Chromium's own lenient file: scheme (which already tolerates an
 * extra slash) rather than desktop's custom video: protocol, adding one is harmless.
 *
 * Used both for the IPC calls that hand a local url to desktop for conversion/screenshot
 * (bindings/video/desktop.js) and for urls rendered directly into a <video src> - the latter
 * can resolve to desktop's custom `video:` protocol (Electron's protocol.registerFileProtocol,
 * which calls the same buggy getFileInfo() as a direct browser resource request, invisible to
 * any IPC-level fix) depending on which scheme a route happens to be stored with - see
 * incyclist-services' resolvePlaybackUrl().
 */
export const withLegacyLocalUrlWorkaround = (url) => {
    if (hasFeature('video.localUrlFix') || !LEGACY_SLASH_BUG_URL.test(url ?? ''))
        return url
    return url.replace(/^(video|file):\/\/\//, '$1:////')
}


const LOCAL_URL = /^(video|file):\/\/(.*)$/s

/**
 * Stored local video URLs are percent-encoded (encodeURI in incyclist-services' URL builders,
 * e.g. `video:///mnt/nas/Hochb%C3%A4rneck-1.avi`) - right for a <video src>, which the browser
 * and desktop's protocol handler decode themselves. The desktop IPC calls that convert or
 * screenshot a file (bindings/video/desktop.js) use the path of the URL as it is as a file name,
 * so an encoded one is reported as "file not found". Hands them the real path instead.
 *
 * Must not run once desktop announces that it decodes these paths itself (video.localUrlDecode):
 * a name that literally contains e.g. "%20" would then be decoded a second time.
 * A URL with a malformed percent sequence is left as it is.
 */
export const withDecodedLocalPath = (url) => {
    if (hasFeature('video.localUrlDecode'))
        return url

    const match = LOCAL_URL.exec(url ?? '')
    if (!match)
        return url

    try {
        return `${match[1]}://${decodeURIComponent(match[2])}`
    }
    catch {
        return url
    }
}
