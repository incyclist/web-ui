import { describe, test, expect } from 'vitest'
import { isValidGoogleMapsKeyFormat, maskGoogleMapsKey } from './validations'

describe('maskGoogleMapsKey', () => {
    const key = 'AIzaSyB' + '0123456789'.repeat(3) + '01'

    test('keeps the first 7 and the last 2 characters', () => {
        const masked = maskGoogleMapsKey(key)

        expect(masked.startsWith('AIzaSyB')).toBe(true)
        expect(masked.endsWith('01')).toBe(true)
        expect(masked).toHaveLength(key.length)
        expect(masked.slice(7, -2)).toBe('·'.repeat(key.length - 9))
    })

    test('does not leak the hidden part', () => {
        expect(maskGoogleMapsKey(key)).not.toContain('0123456789')
    })

    test.each([undefined, null, '', 'short'])('returns %s as it is', (value) => {
        expect(maskGoogleMapsKey(value)).toBe(value)
    })

    test('the format check is unaffected', () => {
        expect(isValidGoogleMapsKeyFormat(key)).toBe(true)
    })
})
