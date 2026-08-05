import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

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
