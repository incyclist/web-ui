import React from 'react'
import { EventEmitter } from 'events'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, act } from '@testing-library/react'

import { AutoConvertVideo, DEFAULT_STREAM_MIME } from './AutoConvertVideo'

class FakeSourceBuffer extends EventEmitter {
    appendBuffer = vi.fn()
    addEventListener(ev, cb) { this.on(ev, cb) }
}

class FakeMediaSource extends EventEmitter {
    static instances = []
    static isTypeSupported = vi.fn(() => true)
    readyState = 'closed'
    constructor() { super(); FakeMediaSource.instances.push(this) }
    addEventListener(ev, cb) { this.on(ev, cb) }
    addSourceBuffer = vi.fn(() => new FakeSourceBuffer())
    open() { this.readyState = 'open'; this.emit('sourceopen') }
}

const createConversion = () => {
    const observer = new EventEmitter()
    return {
        observer,
        getObserver: () => observer,
        convert: vi.fn(),
        getNextSegment: vi.fn(() => new Promise(() => {})),
        stop: vi.fn(),
    }
}

describe('AutoConvertVideo', () => {
    let conversion

    beforeEach(() => {
        FakeMediaSource.instances = []
        vi.stubGlobal('MediaSource', FakeMediaSource)
        URL.createObjectURL = vi.fn(() => 'blob:test')
        vi.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
        conversion = createConversion()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
        vi.restoreAllMocks()
    })

    const mediaSource = () => FakeMediaSource.instances.at(-1)

    // whether audio is requested and whether the video is muted is decided by services
    // (VideoConversion / RLVDisplayService) - the component only starts the conversion and follows `muted`

    test('starts the conversion without own options', () => {
        render(<AutoConvertVideo src={conversion} muted={false} />)

        expect(conversion.convert).toHaveBeenCalledWith()
    })

    test('creates the source buffer with the MIME type reported by the stream', () => {
        render(<AutoConvertVideo src={conversion} muted={false} />)
        const mime = 'video/mp4; codecs="avc1.64001F, mp4a.40.2"'

        act(() => { mediaSource().open() })
        expect(mediaSource().addSourceBuffer).not.toHaveBeenCalled()   // stream not started yet

        act(() => { conversion.observer.emit('convert-start', { mime }) })
        expect(mediaSource().addSourceBuffer).toHaveBeenCalledWith(mime)
    })

    test('also works when the stream starts before the MediaSource is open', () => {
        render(<AutoConvertVideo src={conversion} muted={false} />)
        const mime = 'video/mp4; codecs="avc1.64001F"'

        act(() => { conversion.observer.emit('convert-start', { mime }) })
        act(() => { mediaSource().open() })

        expect(mediaSource().addSourceBuffer).toHaveBeenCalledWith(mime)
    })

    test('uses the video-only MIME type when the platform does not report one (older desktop)', () => {
        render(<AutoConvertVideo src={conversion} muted={false} />)

        act(() => { mediaSource().open() })
        act(() => { conversion.observer.emit('convert-start') })

        expect(mediaSource().addSourceBuffer).toHaveBeenCalledWith(DEFAULT_STREAM_MIME)
    })

    test('follows the muted prop', () => {
        const { container, rerender } = render(<AutoConvertVideo src={conversion} muted={false} />)
        expect(container.querySelector('video').muted).toBe(false)

        rerender(<AutoConvertVideo src={conversion} muted={true} />)
        expect(container.querySelector('video').muted).toBe(true)
    })
})
