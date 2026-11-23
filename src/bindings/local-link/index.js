import { EventLogger } from 'gd-eventlog'
import { api, hasFeature } from '../../utils'

/** Transport major versions this renderer knows how to talk to. */
const SUPPORTED_MAJORS = [1]

const logger = new EventLogger('LocalLinkBinding')

/** Logs a swallowed error (function name and message only, never payloads). Must itself never throw. */
const logError = (fn, err) => {
    try {
        logger.logEvent({ message: 'error', fn, error: err?.message ?? String(err) })
    }
    catch { /* nothing left to do */ }
}

const LISTENERS = ['control', 'media']
const FAILED = 'EBINDING'

/**
 * Desktop-only binding for the `local-link` transport. A thin map over the `localLink`
 * object exposed by the Electron shell; all decisions live in incyclist-services.
 * Not available on mobile/browser (or on a shell without the feature) - callers must stay
 * inert when the binding is undefined or isSupported() is false.
 *
 * No method throws or rejects: failures are logged and answered with the fallback of the
 * ILocalLinkBinding contract (ok:false / stopped status / no-op unsubscribe).
 */
export class LocalLinkBinding {

    isSupported() {
        try {
            if (!hasFeature('local-link'))
                return false
            const version = api?.localLink?.transportVersion
            return typeof version === 'number' && SUPPORTED_MAJORS.includes(Math.floor(version))
        }
        catch (err) {
            logError('isSupported', err)
            return false
        }
    }

    async getCapabilities() {
        try {
            return await api.localLink.getCapabilities()
        }
        catch (err) {
            logError('getCapabilities', err)
            return { transportVersion: 0, capabilities: [] }
        }
    }

    async getStatus() {
        try {
            return await api.localLink.getStatus()
        }
        catch (err) {
            logError('getStatus', err)
            return {
                running: { control: false, media: false }, ports: {}, addresses: [], announced: null,
                connections: 0, handleCount: 0, tokenCount: 0
            }
        }
    }

    async start(opts) {
        try {
            return await api.localLink.start(opts)
        }
        catch (err) {
            logError('start', err)
            const res = { addresses: [] }
            try {
                LISTENERS.filter(l => opts?.[l]).forEach(l => { res[l] = { ok: false, error: { code: FAILED } } })
            }
            catch { /* keep the bare fallback */ }
            return res
        }
    }

    async stop(opts) {
        try {
            return await api.localLink.stop(opts)
        }
        catch (err) {
            logError('stop', err)
            return { ok: false }
        }
    }

    async setPeerPolicy(policy) {
        try {
            return await api.localLink.setPeerPolicy(policy)
        }
        catch (err) {
            logError('setPeerPolicy', err)
            return { ok: false, error: FAILED }
        }
    }

    async setLimits(limits) {
        try {
            return await api.localLink.setLimits(limits)
        }
        catch (err) {
            logError('setLimits', err)
            return { ok: false, applied: {} }
        }
    }

    async announce(a) {
        try {
            return await api.localLink.announce(a)
        }
        catch (err) {
            logError('announce', err)
            return { ok: false, error: FAILED }
        }
    }

    async reannounce() {
        try {
            return await api.localLink.reannounce()
        }
        catch (err) {
            logError('reannounce', err)
            return { ok: false }
        }
    }

    async publishMedia(state) {
        try {
            return await api.localLink.publishMedia(state)
        }
        catch (err) {
            logError('publishMedia', err)
            return { ok: false, rejectedHandles: [], rejectedTokens: 0 }
        }
    }

    async send(connectionId, payload) {
        try {
            return await api.localLink.send(connectionId, payload)
        }
        catch (err) {
            logError('send', err)
            return { ok: false }
        }
    }

    async close(connectionId, reason) {
        try {
            await api.localLink.close(connectionId, reason)
        }
        catch (err) {
            logError('close', err)
        }
    }

    onEvent(cb) {
        try {
            if (typeof cb !== 'function')
                return () => {}

            // a throwing listener must not propagate into the shell's event dispatch
            const safeCb = (e) => {
                try {
                    cb(e)
                }
                catch (err) {
                    logError('onEvent.listener', err)
                }
            }
            const unsubscribe = api.localLink.onEvent(safeCb)
            if (typeof unsubscribe !== 'function')
                return () => {}
            return () => {
                try {
                    unsubscribe()
                }
                catch (err) {
                    logError('onEvent.unsubscribe', err)
                }
            }
        }
        catch (err) {
            logError('onEvent', err)
            return () => {}
        }
    }
}

export const getLocalLinkBinding = () => {
    try {
        if (hasFeature('local-link'))
            return new LocalLinkBinding()
        return undefined
    }
    catch (err) {
        logError('getLocalLinkBinding', err)
        return undefined
    }
}
