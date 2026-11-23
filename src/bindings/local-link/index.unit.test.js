import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventLogger } from 'gd-eventlog'

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
        const off = new LocalLinkBinding().onEvent(cb)
        expect(api.localLink.onEvent).toHaveBeenCalledWith(expect.any(Function))
        api.localLink.onEvent.mock.calls[0][0]({ type: 'resumed' })
        expect(cb).toHaveBeenCalledWith({ type: 'resumed' })
        off()
        expect(unsub).toHaveBeenCalled()
    })
    test('returns a no-op unsubscribe if the shell returns none', () => {
        const off = new LocalLinkBinding().onEvent(vi.fn())
        expect(() => off()).not.toThrow()
    })
})

describe('never throws or rejects', () => {
    let logSpy
    beforeEach(() => { logSpy = vi.spyOn(EventLogger.prototype, 'logEvent').mockImplementation(() => {}) })
    afterEach(() => { logSpy.mockRestore() })

    const boom = () => { throw new Error('boom') }

    test.each([
        ['getCapabilities', [], { transportVersion: 0, capabilities: [] }],
        ['stop', [], { ok: false }],
        ['setPeerPolicy', [{}], { ok: false, error: 'EBINDING' }],
        ['setLimits', [{}], { ok: false, applied: {} }],
        ['announce', [null], { ok: false, error: 'EBINDING' }],
        ['reannounce', [], { ok: false }],
        ['publishMedia', [{}], { ok: false, rejectedHandles: [], rejectedTokens: 0 }],
        ['send', ['c', '{}'], { ok: false }],
        ['close', ['c'], undefined],
    ])('%s resolves with the fallback when the shell throws or rejects', async (method, args, fallback) => {
        const b = new LocalLinkBinding()
        api.localLink[method] = vi.fn(boom)
        await expect(b[method](...args)).resolves.toEqual(fallback)
        api.localLink[method] = vi.fn().mockRejectedValue(new Error('boom'))
        await expect(b[method](...args)).resolves.toEqual(fallback)
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: method, error: 'boom' }))
    })

    test('getStatus resolves a stopped status', async () => {
        api.localLink.getStatus = vi.fn(boom)
        const res = await new LocalLinkBinding().getStatus()
        expect(res.running).toEqual({ control: false, media: false })
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'getStatus' }))
    })

    test('start resolves ok:false for the requested listeners', async () => {
        api.localLink.start = vi.fn().mockRejectedValue(new Error('boom'))
        const res = await new LocalLinkBinding().start({ control: { port: 0 } })
        expect(res.control).toEqual({ ok: false, error: { code: 'EBINDING' } })
        expect(res.media).toBeUndefined()
        expect(res.addresses).toEqual([])
    })

    test('isSupported is false when hasFeature throws', () => {
        hasFeature.mockImplementation(boom)
        expect(new LocalLinkBinding().isSupported()).toBe(false)
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'isSupported' }))
    })

    test('getLocalLinkBinding is undefined when hasFeature throws', () => {
        hasFeature.mockImplementation(boom)
        expect(getLocalLinkBinding()).toBeUndefined()
    })

    test('onEvent returns a no-op unsubscribe when subscribing throws', () => {
        api.localLink.onEvent = vi.fn(boom)
        const off = new LocalLinkBinding().onEvent(vi.fn())
        expect(() => off()).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'onEvent' }))
    })

    test('a throwing listener does not propagate', () => {
        new LocalLinkBinding().onEvent(boom)
        const wrapped = api.localLink.onEvent.mock.calls[0][0]
        expect(() => wrapped({ type: 'x' })).not.toThrow()
        expect(logSpy).toHaveBeenCalledWith(expect.objectContaining({ fn: 'onEvent.listener' }))
    })

    test('a throwing unsubscribe does not propagate', () => {
        api.localLink.onEvent.mockReturnValue(boom)
        const off = new LocalLinkBinding().onEvent(vi.fn())
        expect(() => off()).not.toThrow()
    })
})
