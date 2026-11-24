import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('incyclist-services', () => ({
    useAppState: vi.fn(),
    getKnownDeviceNames: vi.fn(),
}))

vi.mock('gd-eventlog', () => ({
    EventLogger: vi.fn(function () { this.logEvent = vi.fn() }),
}))

vi.mock('../../utils', () => ({
    api: {},
    hasFeature: vi.fn(),
    isElectron: vi.fn(),
    isReactNative: vi.fn(),
}))

vi.mock('../app-info', () => ({
    default: { getInstance: vi.fn(() => ({ isApp: () => false })) },
}))

import { getKnownDeviceNames, useAppState } from 'incyclist-services'
import { api, hasFeature, isElectron, isReactNative } from '../../utils'
import getBleBinding from './ble'

const knownNames = { version: 3, names: ['kickr', 'hrm*'] }
const webbleInstance = { name: 'webble-binding', setKnownDeviceNames: vi.fn() }
const bleInstance = { name: 'ble-binding' }

beforeEach(() => {
    vi.clearAllMocks()
    webbleInstance.setKnownDeviceNames.mockReset()

    isReactNative.mockReturnValue(false)
    isElectron.mockReturnValue(true)

    api.appSettings = { getOSSync: vi.fn(() => ({ platform: 'win32' })) }
    api.webble = { getInstance: vi.fn(() => webbleInstance) }
    api.ble = { getInstance: vi.fn(() => bleInstance) }

    useAppState.mockReturnValue({ hasFeature: vi.fn(() => false) })
    getKnownDeviceNames.mockReturnValue(knownNames)
})

describe('getBleBinding', () => {

    test('returns null on React Native', () => {
        isReactNative.mockReturnValue(true)
        expect(getBleBinding()).toBeNull()
    })

    test('returns null outside Electron and without app-info feature (web)', () => {
        isElectron.mockReturnValue(false)
        expect(getBleBinding()).toBeNull()
    })

    describe('linux', () => {

        beforeEach(() => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'linux' })
            hasFeature.mockImplementation((f) => f === 'appSettings.appInfo')
        })

        test('returns the webble binding when webble is announced', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble'].includes(f))
            expect(getBleBinding()).toBe(webbleInstance)
        })

        test('returns null when webble is not announced (no ble fallback on linux)', () => {
            expect(getBleBinding()).toBeNull()
        })

    })

    describe('known device names', () => {

        beforeEach(() => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'linux' })
        })

        test('are handed to the webble binding when the desktop announces webble-known-names', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble', 'webble-known-names'].includes(f))

            expect(getBleBinding()).toBe(webbleInstance)
            expect(webbleInstance.setKnownDeviceNames).toHaveBeenCalledTimes(1)
            expect(webbleInstance.setKnownDeviceNames).toHaveBeenCalledWith(knownNames)
        })

        test('are not handed over by a desktop shell that does not announce webble-known-names', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble'].includes(f))

            expect(getBleBinding()).toBe(webbleInstance)
            expect(webbleInstance.setKnownDeviceNames).not.toHaveBeenCalled()
        })

        test('are handed to the webble binding on windows, too', () => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'win32' })
            useAppState.mockReturnValue({ hasFeature: vi.fn((f) => f === 'WEBBLE_WINDOWS') })
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble', 'webble-known-names'].includes(f))

            expect(getBleBinding()).toBe(webbleInstance)
            expect(webbleInstance.setKnownDeviceNames).toHaveBeenCalledWith(knownNames)
        })

        test('a binding that does not know setKnownDeviceNames still works', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble', 'webble-known-names'].includes(f))
            const old = { name: 'old-webble' }
            api.webble.getInstance.mockReturnValue(old)

            expect(getBleBinding()).toBe(old)
        })

        test('a failure to hand them over never breaks the binding', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble', 'webble-known-names'].includes(f))
            webbleInstance.setKnownDeviceNames.mockImplementation(() => { throw new Error('ipc down') })

            expect(getBleBinding()).toBe(webbleInstance)
        })

        test('the ble binding of the other paths gets nothing', () => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'darwin' })
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'ble', 'webble-known-names'].includes(f))

            expect(getBleBinding()).toBe(bleInstance)
            expect(webbleInstance.setKnownDeviceNames).not.toHaveBeenCalled()
        })
    })

    describe('win32', () => {

        beforeEach(() => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'win32' })
        })

        test('uses webble when the desktop announces it and WEBBLE_WINDOWS is enabled', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble', 'ble'].includes(f))
            useAppState.mockReturnValue({ hasFeature: vi.fn((toggle) => toggle === 'WEBBLE_WINDOWS') })

            expect(getBleBinding()).toBe(webbleInstance)
        })

        test('falls back to ble when WEBBLE_WINDOWS is not enabled (default behavior)', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'webble', 'ble'].includes(f))
            useAppState.mockReturnValue({ hasFeature: vi.fn(() => false) })

            expect(getBleBinding()).toBe(bleInstance)
        })

        test('falls back to ble when the desktop build does not announce webble', () => {
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'ble'].includes(f))
            useAppState.mockReturnValue({ hasFeature: vi.fn(() => true) })

            expect(getBleBinding()).toBe(bleInstance)
        })

    })

    describe('other platforms (e.g. mac)', () => {

        test('is unaffected by the win32 toggle and uses ble directly', () => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'darwin' })
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'ble'].includes(f))
            useAppState.mockReturnValue({ hasFeature: vi.fn(() => true) })

            expect(getBleBinding()).toBe(bleInstance)
            expect(api.webble.getInstance).not.toHaveBeenCalled()
        })

    })

    describe('backward compatibility shim', () => {

        test('adds no-op logging methods when ble-pauseLogging is not announced', () => {
            api.appSettings.getOSSync.mockReturnValue({ platform: 'darwin' })
            hasFeature.mockImplementation((f) => ['appSettings.appInfo', 'ble'].includes(f))

            const binding = getBleBinding()

            expect(typeof binding.setServerDebug).toBe('function')
            expect(typeof binding.pauseLogging).toBe('function')
            expect(typeof binding.resumeLogging).toBe('function')
        })

    })

})
