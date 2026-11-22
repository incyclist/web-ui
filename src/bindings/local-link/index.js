import { api, hasFeature } from '../../utils'

/** Transport major versions this renderer knows how to talk to. */
const SUPPORTED_MAJORS = [1]

/**
 * Desktop-only binding for the `local-link` transport. A thin map over the `localLink`
 * object exposed by the Electron shell; all decisions live in incyclist-services.
 * Not available on mobile/browser (or on a shell without the feature) - callers must stay
 * inert when the binding is undefined or isSupported() is false.
 */
export class LocalLinkBinding {

    isSupported() {
        if (!hasFeature('local-link'))
            return false
        const version = api?.localLink?.transportVersion
        return typeof version === 'number' && SUPPORTED_MAJORS.includes(Math.floor(version))
    }

    getCapabilities()       { return api.localLink.getCapabilities() }
    getStatus()             { return api.localLink.getStatus() }
    start(opts)             { return api.localLink.start(opts) }
    stop(opts)              { return api.localLink.stop(opts) }
    setPeerPolicy(policy)   { return api.localLink.setPeerPolicy(policy) }
    setLimits(limits)       { return api.localLink.setLimits(limits) }
    announce(a)             { return api.localLink.announce(a) }
    reannounce()            { return api.localLink.reannounce() }
    publishMedia(state)     { return api.localLink.publishMedia(state) }
    send(connectionId, payload) { return api.localLink.send(connectionId, payload) }
    close(connectionId, reason) { return api.localLink.close(connectionId, reason) }

    onEvent(cb) {
        if (typeof cb !== 'function')
            return () => {}
        const unsubscribe = api.localLink.onEvent(cb)
        return typeof unsubscribe === 'function' ? unsubscribe : () => {}
    }
}

export const getLocalLinkBinding = () => {
    if (hasFeature('local-link'))
        return new LocalLinkBinding()
    return undefined
}
