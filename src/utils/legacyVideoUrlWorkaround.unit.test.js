import { describe, test, expect, vi, beforeEach } from 'vitest'

const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn() }))

vi.mock('./electron/integration', () => ({
    hasFeature: hasFeatureMock
}))

import { withLegacyLocalUrlWorkaround } from './legacyVideoUrlWorkaround'

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
