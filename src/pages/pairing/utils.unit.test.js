import { describe, test, expect, vi } from 'vitest'
import { getStatusLinkHandler, isHelperShown } from './utils'

const helper = (phase = 'hidden') => ({ phase, onOpen: vi.fn() })

describe('getStatusLinkHandler', () => {

    test('a link opens the helper', () => {
        const h = helper()
        expect(getStatusLinkHandler({ id: 'S6', link: "Can't find your trainer?" }, h)).toBe(h.onOpen)
    })

    test('the trainer-unavailable link opens the helper too', () => {
        const h = helper()
        expect(getStatusLinkHandler({ id: 'S7', link: 'Not available today?' }, h)).toBe(h.onOpen)
    })

    test('no handler when the line has no link', () => {
        expect(getStatusLinkHandler({ id: 'S4', text: 'Getting ready to search…' }, helper())).toBeUndefined()
    })

    test('no handler without a helper to open', () => {
        expect(getStatusLinkHandler({ id: 'S6', link: "Can't find your trainer?" }, undefined)).toBeUndefined()
    })

    test('no handler without a status', () => {
        expect(getStatusLinkHandler(undefined, helper())).toBeUndefined()
    })
})

describe('isHelperShown', () => {

    test('shown while open or resolved', () => {
        expect(isHelperShown(helper('open'))).toBe(true)
        expect(isHelperShown(helper('resolved'))).toBe(true)
    })

    test('not shown while hidden or without a helper', () => {
        expect(isHelperShown(helper('hidden'))).toBe(false)
        expect(isHelperShown(undefined)).toBe(false)
    })
})
