import React from 'react'
import { EventEmitter } from 'events'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

const { hasFeatureMock } = vi.hoisted(() => ({ hasFeatureMock: vi.fn() }))

vi.mock('../../../utils/electron/integration', () => ({
    hasFeature: hasFeatureMock
}))

import { Video } from './Video'

describe('Video legacy local-url workaround', () => {

    beforeEach(() => {
        hasFeatureMock.mockReturnValue(false) // old desktop by default, matches most real installs today
    })

    test('adds a compensating slash to a well-formed local video:/// url on old desktop', () => {
        const { container } = render(<Video src="video:///local/route.mp4" />)

        expect(container.querySelector('video').src).toBe('video:////local/route.mp4')
    })

    test('leaves the url unchanged on desktop with the fix', () => {
        hasFeatureMock.mockReturnValue(true)
        const { container } = render(<Video src="video:///local/route.mp4" />)

        expect(container.querySelector('video').src).toBe('video:///local/route.mp4')
    })

    test('leaves a remote http url unchanged', () => {
        const { container } = render(<Video src="https://example.com/route.mp4" />)

        expect(container.querySelector('video').src).toBe('https://example.com/route.mp4')
    })
})

describe('Video audio', () => {

    const createObserver = () => {
        const observer = new EventEmitter()
        observer.stop = vi.fn()
        return observer
    }

    beforeEach(() => {
        hasFeatureMock.mockReturnValue(true)
        vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    test('is muted by default', () => {
        const { container } = render(<Video src="video:///local/route.mp4" />)

        expect(container.querySelector('video').muted).toBe(true)
    })

    test('follows changes of the muted prop', () => {
        const { container, rerender } = render(<Video src="video:///local/route.mp4" muted={true} />)

        rerender(<Video src="video:///local/route.mp4" muted={false} />)
        expect(container.querySelector('video').muted).toBe(false)

        rerender(<Video src="video:///local/route.mp4" muted={true} />)
        expect(container.querySelector('video').muted).toBe(true)
    })

    test('the playback rate does not change the muted state (decided by services)', () => {
        const observer = createObserver()
        const { container } = render(<Video src="video:///local/route.mp4" observer={observer} muted={false} />)
        const video = container.querySelector('video')

        act(() => { observer.emit('rate-update', 2.5) })

        expect(video.muted).toBe(false)
    })

    test('stays muted at normal rates when sound is switched off', () => {
        const observer = createObserver()
        const { container } = render(<Video src="video:///local/route.mp4" observer={observer} muted={true} />)

        act(() => { observer.emit('rate-update', 1.0) })

        expect(container.querySelector('video').muted).toBe(true)
    })

    test('keeps the audio pitch when the playback rate changes', () => {
        const observer = createObserver()
        const { container } = render(<Video src="video:///local/route.mp4" observer={observer} muted={false} />)
        const video = container.querySelector('video')

        act(() => { observer.emit('rate-update', 1.5) })

        expect(video.playbackRate).toBe(1.5)
        expect(video.preservesPitch).toBe(true)
    })
})
