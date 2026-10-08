import { describe, test, expect, vi, beforeEach } from 'vitest'

const { hasFeatureMock, apiMock } = vi.hoisted(() => ({
    hasFeatureMock: vi.fn(),
    apiMock: {
        openFileDialog: vi.fn()
    }
}))

vi.mock('../../utils/electron/integration', () => ({
    hasFeature: hasFeatureMock,
    api: apiMock
}))

vi.mock('react-router', () => ({
    useNavigate: vi.fn()
}))

import NativeUiService, { getDirectoryDisplayName } from './index'

describe('NativeUiService.selectDirectory()', () => {

    let service

    beforeEach(() => {
        vi.clearAllMocks()
        hasFeatureMock.mockReturnValue(true)
        service = NativeUiService.getInstance()
    })

    test('returns {selected, displayName} when a directory is picked', async () => {
        apiMock.openFileDialog.mockResolvedValue([{ name: 'route.videos', path: '/home/dirk/route.videos', info: {} }])

        const res = await service.selectDirectory()

        expect(res).toEqual({ selected: '/home/dirk/route.videos', displayName: 'route.videos' })
    })

    test('returns {selected, displayName} on Windows-style paths', async () => {
        apiMock.openFileDialog.mockResolvedValue([{ name: 'route.videos', path: 'C:\\Users\\dirk\\route.videos', info: {} }])

        const res = await service.selectDirectory()

        expect(res).toEqual({ selected: 'C:\\Users\\dirk\\route.videos', displayName: 'route.videos' })
    })

    test('returns {canceled:true} when the user cancels the dialog', async () => {
        apiMock.openFileDialog.mockResolvedValue([])

        const res = await service.selectDirectory()

        expect(res).toEqual({ canceled: true })
    })

    test('returns undefined when the capability is not supported', async () => {
        hasFeatureMock.mockReturnValue(false)

        const res = await service.selectDirectory()

        expect(res).toBeUndefined()
        expect(apiMock.openFileDialog).not.toHaveBeenCalled()
    })

    test('unsupported result is not confusable with a cancel', async () => {
        hasFeatureMock.mockReturnValue(false)
        const unsupported = await service.selectDirectory()

        hasFeatureMock.mockReturnValue(true)
        apiMock.openFileDialog.mockResolvedValue([])
        const cancelled = await service.selectDirectory()

        expect(unsupported).not.toEqual(cancelled)
    })
})

describe('NativeUiService.openPage() / registerNavigate()', () => {

    let service

    beforeEach(() => {
        service = NativeUiService.getInstance()
        service.navigate = null
        service.pendingNavigations = []
    })

    test('navigates immediately once a navigate function is registered', () => {
        const navigate = vi.fn()
        service.registerNavigate(navigate)

        service.openPage('/routes')

        expect(navigate).toHaveBeenCalledWith('/routes', undefined)
    })

    test('passes state through as {state}, react-router\'s own navigate() option shape', () => {
        const navigate = vi.fn()
        service.registerNavigate(navigate)

        service.openPage('/devices', { source: '/routes' })

        expect(navigate).toHaveBeenCalledWith('/devices', { state: { source: '/routes' } })
    })

    test('queues a call made before registration, instead of dropping it', () => {
        service.openPage('/devices', { source: '/routes' })

        const navigate = vi.fn()
        service.registerNavigate(navigate)

        expect(navigate).toHaveBeenCalledWith('/devices', { state: { source: '/routes' } })
    })

    test('queues several calls in order and flushes them all on registration', () => {
        service.openPage('/routes')
        service.openPage('/workouts')

        const navigate = vi.fn()
        service.registerNavigate(navigate)

        expect(navigate).toHaveBeenNthCalledWith(1, '/routes', undefined)
        expect(navigate).toHaveBeenNthCalledWith(2, '/workouts', undefined)
    })
})

describe('getDirectoryDisplayName()', () => {

    test('derives the basename from a posix path', () => {
        expect(getDirectoryDisplayName('/home/dirk/route.videos')).toBe('route.videos')
    })

    test('derives the basename from a windows path', () => {
        expect(getDirectoryDisplayName('C:\\Users\\dirk\\route.videos')).toBe('route.videos')
    })

    test('handles a trailing separator', () => {
        expect(getDirectoryDisplayName('/home/dirk/route.videos/')).toBe('route.videos')
    })

    test('returns undefined for an empty path', () => {
        expect(getDirectoryDisplayName('')).toBeUndefined()
        expect(getDirectoryDisplayName(undefined)).toBeUndefined()
    })
})
