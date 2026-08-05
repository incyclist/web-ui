import { api, hasFeature } from '../../utils/electron/integration';
import { withLegacyLocalUrlWorkaround } from '../../utils/legacyVideoUrlWorkaround';

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