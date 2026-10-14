import { describe, test, expect } from 'vitest'

import { VideoRideView } from './VideoRideView'

describe('VideoRideView.shouldComponentUpdate', () => {

    const props = { src: 'video:///local/route.mp4', hidden: false, muted: true }

    test('re-renders when muted changes', () => {
        const view = new VideoRideView(props)

        expect(view.shouldComponentUpdate({ ...props, muted: false })).toBe(true)
    })

    test('does not re-render when only other props change', () => {
        const view = new VideoRideView(props)

        expect(view.shouldComponentUpdate({ ...props, startTime: 10 })).toBe(false)
    })
})
