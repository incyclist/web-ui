import { describe, test, expect, vi, beforeEach } from 'vitest'

const { hasFeatureMock, apiMock, workaroundMock } = vi.hoisted(() => ({
    hasFeatureMock: vi.fn(),
    apiMock: {
        video: {
            screenshot: vi.fn(),
            convert: vi.fn(),
            convertOffline: vi.fn()
        }
    },
    workaroundMock: vi.fn((url) => `fixed(${url})`)
}))

vi.mock('../../utils/electron/integration', () => ({
    hasFeature: hasFeatureMock,
    api: apiMock
}))

vi.mock('../../utils/legacyVideoUrlWorkaround', () => ({
    withLegacyLocalUrlWorkaround: workaroundMock
}))

import { DesktopBinding } from './desktop'

describe('DesktopBinding', () => {

    let binding

    beforeEach(() => {
        vi.clearAllMocks()
        workaroundMock.mockImplementation((url) => `fixed(${url})`)
        hasFeatureMock.mockReturnValue(true)
        binding = new DesktopBinding()
    })

    test('convertOnline() runs the url through the legacy-url workaround before calling api.video.convert', async () => {
        apiMock.video.convert.mockResolvedValue('client')

        await binding.convertOnline('video:///home/dirk/route.avi', { foo: 1 })

        expect(workaroundMock).toHaveBeenCalledWith('video:///home/dirk/route.avi')
        expect(apiMock.video.convert).toHaveBeenCalledWith('fixed(video:///home/dirk/route.avi)', { foo: 1 })
    })

    test('convert() (offline) runs the url through the legacy-url workaround before calling api.video.convertOffline', async () => {
        apiMock.video.convertOffline.mockResolvedValue('offline')

        await binding.convert('video:///home/dirk/route.avi')

        expect(workaroundMock).toHaveBeenCalledWith('video:///home/dirk/route.avi')
        expect(apiMock.video.convertOffline).toHaveBeenCalledWith('fixed(video:///home/dirk/route.avi)', {})
    })

    test('screenshot() runs the url through the legacy-url workaround before calling api.video.screenshot', async () => {
        apiMock.video.screenshot.mockResolvedValue('preview.png')

        await binding.screenshot('video:///home/dirk/route.avi')

        expect(workaroundMock).toHaveBeenCalledWith('video:///home/dirk/route.avi')
        expect(apiMock.video.screenshot).toHaveBeenCalledWith('fixed(video:///home/dirk/route.avi)', {})
    })

    test('throws when desktop does not support the underlying feature', async () => {
        hasFeatureMock.mockReturnValue(false)
        await expect(binding.convertOnline('video:///home/dirk/route.avi')).rejects.toThrow('not supported')
    })
})
