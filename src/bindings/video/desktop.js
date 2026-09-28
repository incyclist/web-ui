import { api, hasFeature } from '../../utils/electron/integration';
import { withDecodedLocalPath, withLegacyLocalUrlWorkaround } from '../../utils/legacyVideoUrlWorkaround';

// the desktop IPC calls need the real file path - decode first, then compensate for old desktops
const toDesktopUrl = (url) => withLegacyLocalUrlWorkaround(withDecodedLocalPath(url))

export class DesktopBinding {

    isScreenshotSuported() {
        return hasFeature('video.screenshot')
    }

    async screenshot(url, props={}) {
        if (hasFeature('video.screenshot')) {
            return await api.video.screenshot(toDesktopUrl(url),props)
        }

        throw new Error('not supported')

    }


    isConvertSuported() {
        return hasFeature('video.convertOffline')
    }

    async convert(url, props={}) {
        if (hasFeature('video.convertOffline')) {
            return await api.video.convertOffline(toDesktopUrl(url),props)
        }

        throw new Error('not supported')
    }

    async convertOnline(url,props={}) {
        if (hasFeature('video.convert')) {
            return api.video.convert(toDesktopUrl(url),props)
        }

        throw new Error('not supported')

    }

}