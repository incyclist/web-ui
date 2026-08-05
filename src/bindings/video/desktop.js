import { api, hasFeature } from '../../utils/electron/integration';

// Older desktop installs (pre incyclist/desktop#199) strip a well-formed local video:///
// or file:/// URL's own leading slash when parsing it (getFileInfo() split on the literal
// "scheme:///" instead of the real "scheme://" separator), turning an absolute Unix path
// into a relative one and failing the file lookup entirely. Matches only the well-formed
// 3-slash shape - already-4-slash urls and Windows drive-letter paths (scheme:///C:/...)
// never hit that bug and must be left alone.
const LEGACY_SLASH_BUG_URL = /^(video|file):\/\/\/(?!\/)(?![A-Za-z]:)/

// Inserting one extra slash compensates for the old bug exactly: its parsing then leaves
// the needed leading slash behind instead of consuming it. This must never run once desktop
// reports it has the fix - it already produces the correct absolute path itself, and adding
// a slash there would double it (see the toFileUrl fix in the same desktop PR).
const withLegacyLocalUrlWorkaround = (url) => {
    if (hasFeature('video.localUrlFix') || !LEGACY_SLASH_BUG_URL.test(url ?? ''))
        return url
    return url.replace(/^(video|file):\/\/\//, '$1:////')
}

export class DesktopBinding {

    isScreenshotSuported() {
        return hasFeature('video.screenshot')
    }

    async screenshot(url, props={}) {
        if (hasFeature('video.screenshot')) {
            return await api.video.screenshot(withLegacyLocalUrlWorkaround(url),props)
        }

        throw new Error('not supported')

    }


    isConvertSuported() {
        return hasFeature('video.convertOffline')
    }

    async convert(url, props={}) {
        if (hasFeature('video.convertOffline')) {
            return await api.video.convertOffline(withLegacyLocalUrlWorkaround(url),props)
        }

        throw new Error('not supported')
    }

    async convertOnline(url,props={}) {
        if (hasFeature('video.convert')) {
            return api.video.convert(withLegacyLocalUrlWorkaround(url),props)
        }

        throw new Error('not supported')

    }

}