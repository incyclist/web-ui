import { api, hasFeature } from '../../utils/electron/integration'

/**
 * Desktop-only binding: issues the HTTP request from the Electron main process
 * (via the `fetch` feature, see desktop/src/features/fetch/feature.js), so callers
 * can set otherwise-forbidden headers (Referer, User-Agent) and force a cross-origin
 * Referer with referrerPolicy:'unsafe-url'. Not available on mobile/browser - callers
 * must fall back to their own request path when this binding is undefined.
 */
export class FetchBinding {
    fetch(url, init) {
        return api.fetch.request(url, init)
    }
}

export const getFetchBinding = () => {
    if (hasFeature('fetch'))
        return new FetchBinding()
    return undefined
}
