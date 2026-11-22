import { describe, test, expect } from 'vitest'
import { clipName, formatLastUsed, getRemaining, groupCode } from './utils'

describe('route sharing utils', () => {
    test('clipName limits the name to 40 characters', () => {
        expect(clipName('x'.repeat(50))).toHaveLength(40)
        expect(clipName(undefined)).toBe('')
    })

    test('groupCode splits the code in two groups', () => {
        expect(groupCode('481209')).toBe('481 209')
        expect(groupCode(undefined)).toBe('')
    })

    test('getRemaining formats m:ss and never goes below zero', () => {
        expect(getRemaining(107_000, 0)).toEqual({ seconds: 107, m: 1, ss: '47' })
        expect(getRemaining(5_000, 10_000)).toEqual({ seconds: 0, m: 0, ss: '00' })
    })

    test('formatLastUsed is relative for recent days', () => {
        const now = new Date(2026, 10, 22, 12).getTime()
        expect(formatLastUsed(new Date(2026, 10, 22, 8).getTime(), now)).toBe('Last used today')
        expect(formatLastUsed(new Date(2026, 10, 21, 23).getTime(), now)).toBe('Last used yesterday')
        expect(formatLastUsed(new Date(2026, 10, 19, 9).getTime(), now)).toBe('Last used 3 days ago')
    })
})
