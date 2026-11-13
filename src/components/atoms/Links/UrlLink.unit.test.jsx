import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

const { hasFeature, openExternal } = vi.hoisted(() => ({
    hasFeature: vi.fn(), openExternal: vi.fn(),
}))
vi.mock('../../../utils/electron/integration', () => ({
    hasFeature, api: { shell: { openExternal } },
}))

import { UrlLink } from './UrlLink'

const url = 'https://incyclist.com/faq/#street-view-simulate'
const logger = { logEvent: vi.fn() }

beforeEach(() => {
    vi.clearAllMocks()
    hasFeature.mockReturnValue(false)
})

describe('UrlLink navigation', () => {
    test('provides the actual URL for native browser navigation', () => {
        render(<UrlLink url={url} text='More information' logger={logger} />)
        const link = screen.getByRole('link')
        const click = new MouseEvent('click', { bubbles: true, cancelable: true })
        // Prevent jsdom navigation after observing whether the component cancelled it.
        const wasPrevented = vi.fn()
        document.addEventListener('click', event => {
            wasPrevented(event.defaultPrevented)
            event.preventDefault()
        }, { once: true })
        fireEvent(link, click)

        expect(link).toHaveAttribute('href', url)
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        expect(wasPrevented).toHaveBeenCalledWith(false)
        expect(openExternal).not.toHaveBeenCalled()
    })

    test('uses Electron shell when available and reports the opened link', () => {
        hasFeature.mockReturnValue(true)
        const onOpened = vi.fn()
        render(<UrlLink url={url} onOpened={onOpened} logger={logger} />)

        expect(fireEvent.click(screen.getByRole('link'))).toBe(false)
        expect(openExternal).toHaveBeenCalledWith(url)
        expect(onOpened).toHaveBeenCalledTimes(1)
        expect(logger.logEvent).toHaveBeenCalledWith({ message: 'external link clicked', url, eventSource: 'user' })
    })

    test('preserves custom click handling', () => {
        const onClick = vi.fn()
        render(<UrlLink url={url} onClick={onClick} logger={logger} />)

        expect(fireEvent.click(screen.getByRole('link'))).toBe(false)
        expect(onClick).toHaveBeenCalledWith(url)
        expect(openExternal).not.toHaveBeenCalled()
    })
})
