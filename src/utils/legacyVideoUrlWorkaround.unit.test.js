import { describe, test, expect, vi, beforeEach } from 'vitest'

const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn() }))

vi.mock('./electron/integration', () => ({
    hasFeature: hasFeatureMock
}))

import { withLegacyLocalUrlWorkaround, withDecodedLocalPath } from './legacyVideoUrlWorkaround'

describe('withLegacyLocalUrlWorkaround', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('old desktop (no video.localUrlFix)', () => {

        beforeEach(() => {
            hasFeatureMock.mockImplementation((f) => f !== 'video.localUrlFix')
        })

        test('adds a slash to a well-formed local video:/// url', () => {
            expect(withLegacyLocalUrlWorkaround('video:///home/dirk/route.avi'))
                .toBe('video:////home/dirk/route.avi')
        })

        test('adds a slash to a well-formed local file:/// url', () => {
            expect(withLegacyLocalUrlWorkaround('file:///home/dirk/route.avi'))
                .toBe('file:////home/dirk/route.avi')
        })

        test('leaves an already-4-slash url alone (already compensated)', () => {
            expect(withLegacyLocalUrlWorkaround('video:////home/dirk/route.avi'))
                .toBe('video:////home/dirk/route.avi')
        })

        test('leaves a Windows drive-letter path alone (never had this bug)', () => {
            expect(withLegacyLocalUrlWorkaround('video:///C:/Users/Guido/route.avi'))
                .toBe('video:///C:/Users/Guido/route.avi')
        })

        test('leaves a remote http url alone', () => {
            expect(withLegacyLocalUrlWorkaround('https://example.com/route.mp4'))
                .toBe('https://example.com/route.mp4')
        })

        test('passes through undefined/empty unchanged', () => {
            expect(withLegacyLocalUrlWorkaround(undefined)).toBeUndefined()
            expect(withLegacyLocalUrlWorkaround('')).toBe('')
        })
    })

    describe('fixed desktop (video.localUrlFix present)', () => {

        test('passes a well-formed local url through unchanged', () => {
            hasFeatureMock.mockReturnValue(true)
            expect(withLegacyLocalUrlWorkaround('video:///home/dirk/route.avi'))
                .toBe('video:///home/dirk/route.avi')
        })
    })
})

describe('withDecodedLocalPath', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        hasFeatureMock.mockReturnValue(false)
    })

    test.each([
        ['video:///mnt/nas/videos/tacx/AT_Hochb%C3%A4rneck/Hochb%C3%A4rneck-1.avi', 'video:///mnt/nas/videos/tacx/AT_Hochbärneck/Hochbärneck-1.avi'],
        ['file:///mnt/nas/My%20Videos/route.avi', 'file:///mnt/nas/My Videos/route.avi'],
        ['video:///mnt/nas/videos/route%231.avi', 'video:///mnt/nas/videos/route#1.avi'],
        ['video:///C:/Users/Guido/Neuer%20Ordner/route.avi', 'video:///C:/Users/Guido/Neuer Ordner/route.avi'],
        ['video:////mnt/nas/Hochb%C3%A4rneck.avi', 'video:////mnt/nas/Hochbärneck.avi'],
    ])('decodes the path of %s', (url, expected) => {
        expect(withDecodedLocalPath(url)).toBe(expected)
    })

    test('an already decoded url is left as it is', () => {
        expect(withDecodedLocalPath('video:///mnt/nas/videos/Hochbärneck-1.avi')).toBe('video:///mnt/nas/videos/Hochbärneck-1.avi')
    })

    test('an escaped percent sign is decoded exactly once', () => {
        expect(withDecodedLocalPath('video:///mnt/nas/50%2520off.avi')).toBe('video:///mnt/nas/50%20off.avi')
    })

    test('a malformed percent sequence is left as it is', () => {
        expect(withDecodedLocalPath('video:///mnt/nas/100%.avi')).toBe('video:///mnt/nas/100%.avi')
    })

    test('remote and unrelated urls are not touched', () => {
        expect(withDecodedLocalPath('https://example.com/a%20b.mp4')).toBe('https://example.com/a%20b.mp4')
        expect(withDecodedLocalPath(undefined)).toBeUndefined()
    })

    test('is skipped once desktop decodes these paths itself', () => {
        hasFeatureMock.mockImplementation((f) => f === 'video.localUrlDecode')
        expect(withDecodedLocalPath('video:///mnt/nas/Hochb%C3%A4rneck.avi')).toBe('video:///mnt/nas/Hochb%C3%A4rneck.avi')
    })
})
