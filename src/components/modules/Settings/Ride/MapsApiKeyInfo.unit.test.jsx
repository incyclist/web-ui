import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { EventLogger } from 'gd-eventlog'
import { AppThemeProvider } from '../../../../theme'
import { MapsApiKeyInfo } from './MapsApiKeyInfo'

const renderInfo = () => render(<AppThemeProvider><MapsApiKeyInfo /></AppThemeProvider>)
const openInfo = async () => {
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Info about Maps API Key' })))
    return screen.getByRole('dialog', { name: 'About Maps API Key' })
}

describe('Maps API key info pill', () => {
    test('logs the info control click through the shared Button atom', async () => {
        const logEvent = vi.spyOn(EventLogger.prototype, 'logEvent')
        try {
            renderInfo()
            await openInfo()

            expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({
                message: 'button clicked', button: 'maps-api-key-info', eventSource: 'user',
            }))
        }
        finally {
            logEvent.mockRestore()
        }
    })

    test('opens on click and explains all three reasons with the FAQ deeplink', async () => {
        renderInfo()
        expect(screen.queryByRole('dialog')).toBeNull()

        const popup = await openInfo()

        expect(popup).toHaveTextContent('simulate GPX rides with Street View or Satellite View')
        expect(popup).toHaveTextContent('enable side views (left and right)')
        expect(popup).toHaveTextContent('running out of its shared free tier allowance')
        expect(screen.getByRole('link', { name: /Learn more/ })).toHaveAttribute('href',
            'https://incyclist.com/faq/#street-view-simulate')
        expect(screen.getByRole('button', { name: 'Info about Maps API Key' })).toHaveAttribute('aria-expanded', 'true')
    })

    test('keeps the link available when moving focus from the pill into the popup', async () => {
        renderInfo()
        await openInfo()

        const link = screen.getByRole('link')
        fireEvent.blur(screen.getByRole('button', { name: 'Info about Maps API Key' }), { relatedTarget: link })
        fireEvent.focus(link)

        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    test('Escape closes the help, restores focus and does not reach the settings handler', async () => {
        renderInfo()
        await openInfo()
        const parentEscape = vi.fn()
        window.addEventListener('keyup', parentEscape)
        try {
            fireEvent.keyUp(screen.getByRole('link'), { key: 'Escape', keyCode: 27 })

            expect(screen.queryByRole('dialog')).toBeNull()
            expect(screen.getByRole('button', { name: 'Info about Maps API Key' })).toHaveFocus()
            expect(parentEscape).not.toHaveBeenCalled()
        }
        finally {
            window.removeEventListener('keyup', parentEscape)
        }
    })

    test('closes on a second click or when clicking outside', async () => {
        renderInfo()
        await openInfo()
        fireEvent.click(screen.getByRole('button', { name: 'Info about Maps API Key' }))
        expect(screen.queryByRole('dialog')).toBeNull()

        await openInfo()
        fireEvent.pointerDown(document.body)
        expect(screen.queryByRole('dialog')).toBeNull()
    })
})
