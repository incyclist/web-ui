import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

import { ConnectWindow } from './ConnectWindow'
import * as fx from './fixtures.mock'

const renderWindow = (connectWindow, extra = {}) => {
    const handlers = { onDeny: vi.fn(), onClose: vi.fn(), onRetry: vi.fn() }
    const res = render(<ConnectWindow connectWindow={connectWindow} computerName='Home PC' platform='windows' {...handlers} {...extra} />)
    return { ...res, ...handlers }
}

describe('ConnectWindow', () => {

    test('renders nothing without a window', () => {
        const { container } = renderWindow(undefined)
        expect(container.textContent).toBe('')
    })

    test('starting: shows the progress text and the OS firewall reminder', () => {
        const { onClose } = renderWindow(fx.windowStarting)

        expect(screen.getByText('Getting ready…')).toBeDefined()
        expect(screen.getByText(/If Windows asks about Incyclist/)).toBeDefined()
        fireEvent.click(screen.getByText('Close'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('starting on macOS: shows the macOS reminder', () => {
        renderWindow(fx.windowStarting, { platform: 'macos' })
        expect(screen.getByText(/If your Mac asks whether Incyclist/)).toBeDefined()
    })

    describe('waiting', () => {
        test('shows the steps and the suffix line', () => {
            renderWindow(fx.windowWaiting, { suffix: 'K3F9' })

            expect(screen.getByText('1. On your phone or tablet, open Incyclist.')).toBeDefined()
            expect(screen.getByText('2. Go to Settings › Routes › Route Sharing › Add Computer.')).toBeDefined()
            expect(screen.getByText('3. Choose "Home PC".')).toBeDefined()
            expect(screen.getByText('If "Home PC" is listed more than once, choose "Home PC (K3F9)".')).toBeDefined()
            expect(screen.getByText('Waiting for your phone or tablet…')).toBeDefined()
            expect(screen.getByText(/Keep this window open until/)).toBeDefined()
            expect(screen.queryByText('Deny')).toBeNull()
        })

        test.each([
            ['denied', 'You turned down the request from Pixel 8.'],
            ['expired', 'The code for Pixel 8 has expired. If you still want to connect it, tap "Get a new code" on Pixel 8.'],
            ['invalidated', 'The code was typed wrongly three times. To try again, tap "Get a new code" on Pixel 8.'],
            ['abandoned', 'Pixel 8 stopped connecting.']
        ])('shows the %s notice', (notice, text) => {
            renderWindow({ phase: 'waiting', device: 'Pixel 8', notice })
            expect(screen.getByText(text)).toBeDefined()
        })
    })

    describe('code', () => {
        beforeEach(() => { vi.useFakeTimers() })
        afterEach(() => { vi.useRealTimers() })

        test('shows device, grouped code, countdown and wrong-try line', () => {
            vi.setSystemTime(1_000_000)
            renderWindow({ ...fx.windowCode, expiresAt: 1_000_000 + 107_000 })

            expect(screen.getByText('Pixel 8 wants to connect')).toBeDefined()
            expect(screen.getByText('Type this code on Pixel 8:')).toBeDefined()
            expect(screen.getByText('481 209')).toBeDefined()
            expect(screen.getByText('Code expires in 1:47')).toBeDefined()
            expect(screen.getByText('Wrong code typed on Pixel 8 — 2 tries left.')).toBeDefined()
        })

        test('counts down every second', () => {
            vi.setSystemTime(1_000_000)
            renderWindow({ ...fx.windowCode, expiresAt: 1_000_000 + 107_000 })

            act(() => { vi.advanceTimersByTime(2000) })

            expect(screen.getByText('Code expires in 1:45')).toBeDefined()
        })

        test('uses the singular for one try left and hides the line for three', () => {
            const { rerender, onDeny, onClose, onRetry } = renderWindow({ ...fx.windowCode, attemptsLeft: 1 })
            expect(screen.getByText('Wrong code typed on Pixel 8 — 1 try left.')).toBeDefined()

            rerender(<ConnectWindow connectWindow={{ ...fx.windowCode, attemptsLeft: 3 }} computerName='Home PC'
                onDeny={onDeny} onClose={onClose} onRetry={onRetry} />)
            expect(screen.queryByText(/Wrong code typed/)).toBeNull()
        })

        test('shows the replaced line', () => {
            renderWindow({ ...fx.windowCode, attemptsLeft: 3, notice: 'replaced' })
            expect(screen.getByText('A new request from Pixel 8 replaced the previous one.')).toBeDefined()
        })

        test('Deny and Close are reported, neither is the default button', () => {
            const { onDeny, onClose } = renderWindow(fx.windowCode)

            fireEvent.click(screen.getByText('Deny'))
            expect(onDeny).toHaveBeenCalledTimes(1)
            fireEvent.click(screen.getByText('Close'))
            expect(onClose).toHaveBeenCalledTimes(1)
            expect(screen.getByText('Deny').className).not.toMatch(/default/)
        })
    })

    test('connected: confirms and closes with Done', () => {
        const { onClose } = renderWindow(fx.windowConnected)

        expect(screen.getByText('Pixel 8 is connected')).toBeDefined()
        expect(screen.getByText('Your routes will show up on it in a moment.')).toBeDefined()
        expect(screen.queryByText('Close')).toBeNull()
        fireEvent.click(screen.getByText('Done'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test.each(['Android device', 'iOS device', 'Guido\'s tablet'])('connected: reads correctly with the name "%s"', (device) => {
        renderWindow({ phase: 'connected', device })

        expect(screen.getByText(`${device} is connected`)).toBeDefined()
        expect(screen.getByText('Your routes will show up on it in a moment.')).toBeDefined()
    })

    test('error: offers Try Again and Close', () => {
        const { onRetry, onClose } = renderWindow(fx.windowError)

        expect(screen.getByText(/Couldn't get ready to connect/)).toBeDefined()
        fireEvent.click(screen.getByText('Try Again'))
        expect(onRetry).toHaveBeenCalledTimes(1)
        fireEvent.click(screen.getByText('Close'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
