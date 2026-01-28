import { api, hasFeature } from '../../utils/electron/integration';

export class DesktopBinding {

    isScreenshotSuported() {
        return hasFeature('video.screenshot')
    }

    async screenshot(url, props={}) {
        if (hasFeature('video.screenshot')) {
            return await api.video.screenshot(url,props)
        }

        throw new Error('not supported')

    }


    isConvertSuported() {
        return hasFeature('video.convertOffline')
    }

    async convert(url, props={}) {
        if (hasFeature('video.convertOffline')) {
            return await api.video.convertOffline(url,props)
        }

        throw new Error('not supported')
    }

    async convertOnline(url,props={}) {
        if (hasFeature('video.convert')) {
            return api.video.convert(url,props)
        }

        throw new Error('not supported')

    }

}