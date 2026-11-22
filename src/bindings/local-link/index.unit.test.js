import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../../utils', () => ({
    api: {},
    hasFeature: vi.fn(),
}))

import { api, hasFeature } from '../../utils'
import { getLocalLinkBinding, LocalLinkBinding } from './index'

const METHODS = ['getCapabilities', 'getStatus', 'start', 'stop', 'setPeerPolicy', 'setLimits',
    'announce', 'reannounce', 'publishMedia', 'send', 'close']

beforeEach(() => {
    vi.clearAllMocks()
    api.localLink = { transportVersion: 1, onEvent: vi.fn() }
    METHODS.forEach(m => { api.localLink[m] = vi.fn().mockResolvedValue({ ok: true }) })
    hasFeature.mockReturnValue(true)
})

describe('getLocalLinkBinding', () => {
    test('returns undefined without the local-link feature', () => {
        hasFeature.mockReturnValue(false)
        expect(getLocalLinkBinding()).toBeUndefined()
        expect(hasFeature).toHaveBeenCalledWith('local-link')
    })

    test('returns a binding with the feature', () => {
        expect(getLocalLinkBinding()).toBeInstanceOf(LocalLinkBinding)
    })
})

describe('isSupported', () => {
    test('true for known major', () => {
        api.localLink.transportVersion = 1.2
        expect(new LocalLinkBinding().isSupported()).toBe(true)
    })
    test('false for unknown major', () => {
        api.localLink.transportVersion = 2
        expect(new LocalLinkBinding().isSupported()).toBe(false)
    })
    test('false when version is missing', () => {
        delete api.localLink.transportVersion
        expect(new LocalLinkBinding().isSupported()).toBe(false)
    })
    test('false without the feature', () => {
        hasFeature.mockReturnValue(false)
        expect(new LocalLinkBinding().isSupported()).toBe(false)
    })
})

describe('delegation', () => {
    test('forwards calls and results', async () => {
        const b = new LocalLinkBinding()
        await expect(b.start({ control: { port: 0 } })).resolves.toEqual({ ok: true })
        expect(api.localLink.start).toHaveBeenCalledWith({ control: { port: 0 } })
        await b.send('c1', '{}')
        expect(api.localLink.send).toHaveBeenCalledWith('c1', '{}')
        await b.close('c1', 'bye')
        expect(api.localLink.close).toHaveBeenCalledWith('c1', 'bye')
        await b.stop()
        expect(api.localLink.stop).toHaveBeenCalledWith(undefined)
        await b.announce(null)
        expect(api.localLink.announce).toHaveBeenCalledWith(null)
    })
})

describe('onEvent', () => {
    test('subscribes and returns the unsubscribe function', () => {
        const unsub = vi.fn()
        api.localLink.onEvent.mockReturnValue(unsub)
        const cb = vi.fn()
        expect(new LocalLinkBinding().onEvent(cb)).toBe(unsub)
        expect(api.localLink.onEvent).toHaveBeenCalledWith(cb)
    })
    test('returns a no-op unsubscribe if the shell returns none', () => {
        const off = new LocalLinkBinding().onEvent(vi.fn())
        expect(() => off()).not.toThrow()
    })
})
