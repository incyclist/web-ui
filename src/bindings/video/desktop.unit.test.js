import { describe, test, expect, vi, beforeEach } from 'vitest'

const { hasFeatureMock, apiMock } = vi.hoisted(() => ({
    hasFeatureMock: vi.fn(),
    apiMock: {
        video: {
            screenshot: vi.fn(),
            convert: vi.fn(),
            convertOffline: vi.fn()
        }
    }
}))

vi.mock('../../utils/electron/integration', () => ({
    hasFeature: hasFeatureMock,
    api: apiMock
}))

import { DesktopBinding } from './desktop'

describe('DesktopBinding', () => {

    let binding

    beforeEach(() => {
        vi.clearAllMocks()
        binding = new DesktopBinding()
    })

    describe('legacy local URL workaround (desktop installs without video.localUrlFix)', () => {

        const oldDesktop = () => hasFeatureMock.mockImplementation((f) => f !== 'video.localUrlFix')

        test('adds a slash to a well-formed local video:/// url', async () => {
            oldDesktop()
            apiMock.video.convert.mockResolvedValue('client')

            await binding.convertOnline('video:///home/dirk/incyclist/sonstige/NO_Ocean_Road/NO_Ocean Road.avi')

            expect(apiMock.video.convert).toHaveBeenCalledWith(
                'video:////home/dirk/incyclist/sonstige/NO_Ocean_Road/NO_Ocean Road.avi', {}
            )
        })

        test('adds a slash to a well-formed local file:/// url', async () => {
            oldDesktop()
            apiMock.video.convert.mockResolvedValue('client')

            await binding.convertOnline('file:///home/dirk/route.avi')

            expect(apiMock.video.convert).toHaveBeenCalledWith('file:////home/dirk/route.avi', {})
        })

        test('leaves an already-4-slash url alone (already compensated)', async () => {
            oldDesktop()
            apiMock.video.convert.mockResolvedValue('client')

            await binding.convertOnline('video:////home/dirk/route.avi')

            expect(apiMock.video.convert).toHaveBeenCalledWith('video:////home/dirk/route.avi', {})
        })

        test('leaves a Windows drive-letter path alone (never had this bug)', async () => {
            oldDesktop()
            apiMock.video.convert.mockResolvedValue('client')

            await binding.convertOnline('video:///C:/Users/Guido/route.avi')

            expect(apiMock.video.convert).toHaveBeenCalledWith('video:///C:/Users/Guido/route.avi', {})
        })

        test('leaves a remote http url alone', async () => {
            oldDesktop()
            apiMock.video.convert.mockResolvedValue('client')

            await binding.convertOnline('https://example.com/route.mp4')

            expect(apiMock.video.convert).toHaveBeenCalledWith('https://example.com/route.mp4', {})
        })

        test('applies the same workaround to screenshot() and convert() (offline)', async () => {
            oldDesktop()
            apiMock.video.screenshot.mockResolvedValue('preview.png')
            apiMock.video.convertOffline.mockResolvedValue('offline')

            await binding.screenshot('video:///home/dirk/route.avi')
            await binding.convert('video:///home/dirk/route.avi')

            expect(apiMock.video.screenshot).toHaveBeenCalledWith('video:////home/dirk/route.avi', {})
            expect(apiMock.video.convertOffline).toHaveBeenCalledWith('video:////home/dirk/route.avi', {})
        })
    })

    describe('fixed desktop (video.localUrlFix present)', () => {

        test('passes a well-formed local url through unchanged', async () => {
            hasFeatureMock.mockReturnValue(true)
            apiMock.video.convert.mockResolvedValue('client')

            await binding.convertOnline('video:///home/dirk/route.avi')

            expect(apiMock.video.convert).toHaveBeenCalledWith('video:///home/dirk/route.avi', {})
        })
    })

    test('throws when desktop does not support the underlying feature', async () => {
        hasFeatureMock.mockReturnValue(false)
        await expect(binding.convertOnline('video:///home/dirk/route.avi')).rejects.toThrow('not supported')
    })
})
