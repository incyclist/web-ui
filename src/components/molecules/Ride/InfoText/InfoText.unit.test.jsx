import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { logEvent } = vi.hoisted(() => ({ logEvent: vi.fn() }))

vi.mock('gd-eventlog', () => ({ EventLogger: vi.fn(function () { return { logEvent } }) }))
vi.mock('../../../../utils/electron/integration', () => ({ hasFeature: () => false, api: undefined }))

import { InfoText } from './InfoText'

const message = "Street View isn't available in simulated rides. Showing the Map instead."
const actions = [
    { id: 'how-to', label: 'How to get Street View' },
    { id: 'dont-show-again', label: "Don't show this again" },
]

describe('InfoText', () => {

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.clearAllMocks()
    })

    describe('text only', () => {
        test('shows the text and hides it after the timeout', () => {
            render(<InfoText text='Hello' routeDistance={1} timeout={1000} />)
            expect(screen.queryByText('Hello')).not.toBeNull()

            act(() => { vi.advanceTimersByTime(1000) })

            expect(screen.queryByText('Hello')).toBeNull()
            expect(logEvent).toHaveBeenCalledWith({ message: 'Infotext closed' })
        })

        test('has no close button and no actions', () => {
            render(<InfoText text='Hello' routeDistance={1} />)
            expect(screen.queryAllByRole('button')).toHaveLength(0)
        })
    })

    describe('notice with actions', () => {
        test('shows the text, the actions and a close button', () => {
            render(<InfoText text={message} routeDistance={7} actions={actions} timeout={12000} />)

            expect(screen.queryByText(message)).not.toBeNull()
            expect(screen.queryByRole('button', { name: 'How to get Street View' })).not.toBeNull()
            expect(screen.queryByRole('button', { name: "Don't show this again" })).not.toBeNull()
            expect(screen.queryByRole('button', { name: 'Close' })).not.toBeNull()
        })

        test('logs "Infotext shown" with the text and the id', () => {
            render(<InfoText text={message} routeDistance={7} actions={actions} />)

            expect(logEvent).toHaveBeenCalledWith({ message: 'Infotext shown', text: message, routeDistance: 7 })
        })

        test('reports the id of the clicked action', () => {
            const onAction = vi.fn()
            render(<InfoText text={message} routeDistance={7} actions={actions} onAction={onAction} />)

            fireEvent.click(screen.getByRole('button', { name: "Don't show this again" }))

            expect(onAction).toHaveBeenCalledWith('dont-show-again')
            expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'button clicked', button: "Don't show this again", eventSource: 'user' }))
        })

        test('the close button hides the notice and reports it', () => {
            const onClose = vi.fn()
            render(<InfoText text={message} routeDistance={7} actions={actions} onClose={onClose} />)

            fireEvent.click(screen.getByRole('button', { name: 'Close' }))

            expect(screen.queryByText(message)).toBeNull()
            expect(onClose).toHaveBeenCalledTimes(1)
            expect(logEvent).toHaveBeenCalledWith({ message: 'Infotext closed' })
        })

        test('closes by itself after the timeout and reports it', () => {
            const onClose = vi.fn()
            render(<InfoText text={message} routeDistance={7} actions={actions} onClose={onClose} timeout={12000} />)

            act(() => { vi.advanceTimersByTime(11999) })
            expect(onClose).not.toHaveBeenCalled()

            act(() => { vi.advanceTimersByTime(1) })
            expect(onClose).toHaveBeenCalledTimes(1)
            expect(screen.queryByText(message)).toBeNull()
        })

        test('replacing the message by an acknowledgement keeps one timer and logs "shown" only once', () => {
            const onClose = vi.fn()
            const ack = [{ id: 'change-this', label: "We won't show this again. Change this" }]
            const { rerender } = render(<InfoText text={message} routeDistance={7} actions={actions} onClose={onClose} timeout={12000} />)

            act(() => { vi.advanceTimersByTime(5000) })
            rerender(<InfoText routeDistance={7} actions={ack} onClose={onClose} timeout={12000} />)

            expect(screen.queryByText(message)).toBeNull()
            expect(screen.queryByRole('button', { name: "We won't show this again. Change this" })).not.toBeNull()

            // the original 12s are still running: 5s + 6.99s is not enough, 7s is
            act(() => { vi.advanceTimersByTime(6999) })
            expect(onClose).not.toHaveBeenCalled()
            act(() => { vi.advanceTimersByTime(1) })
            expect(onClose).toHaveBeenCalledTimes(1)

            expect(logEvent.mock.calls.filter(([e]) => e.message === 'Infotext shown')).toHaveLength(1)
        })

        test('a new id shows the notice again', () => {
            const { rerender } = render(<InfoText text={message} routeDistance={7} actions={actions} />)
            fireEvent.click(screen.getByRole('button', { name: 'Close' }))
            expect(screen.queryByText(message)).toBeNull()

            rerender(<InfoText text={message} routeDistance={8} actions={actions} />)

            expect(screen.queryByText(message)).not.toBeNull()
        })
    })
})
