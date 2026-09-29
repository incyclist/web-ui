import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { Tooltip } from './index'

describe('Tooltip', () => {

    let innerWidthDescriptor

    beforeEach(() => {
        innerWidthDescriptor = Object.getOwnPropertyDescriptor(window, 'innerWidth')
    })

    afterEach(() => {
        if (innerWidthDescriptor)
            Object.defineProperty(window, 'innerWidth', innerWidthDescriptor)
        vi.restoreAllMocks()
    })

    // stubs the wrapper's and bubble's geometry, so the clamping math can be tested without a
    // real layout engine (jsdom lays nothing out - every rect/offsetWidth is 0 by default)
    const setGeometry = ({ windowWidth, wrapperLeft, wrapperWidth, wrapperBottom = 0, bubbleWidth }) => {
        Object.defineProperty(window, 'innerWidth', { configurable: true, value: windowWidth })
        vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
            { left: wrapperLeft, width: wrapperWidth, right: wrapperLeft + wrapperWidth, top: 0, bottom: wrapperBottom, height: wrapperBottom }
        )
        Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: bubbleWidth })
    }

    const hover = () => fireEvent.mouseEnter(screen.getByText(/Trigger|Free Ride/).closest('span'))

    test('renders its trigger and the tooltip text', () => {
        render(<Tooltip text="Explains the button"><button>Trigger</button></Tooltip>)

        expect(screen.getByText('Trigger')).toBeInTheDocument()
        expect(screen.getByText('Explains the button')).toBeInTheDocument()
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveTextContent('Explains the button')
    })

    test('is rendered through a portal into document.body, not nested under the trigger', () => {
        const { container } = render(<Tooltip text="x"><button>Trigger</button></Tooltip>)

        const bubble = screen.getByRole('tooltip', { hidden: true })
        expect(container.contains(bubble)).toBe(false)
        expect(document.body.contains(bubble)).toBe(true)
    })

    test('the bubble is hidden until hover/focus (not shown, not read by AT eagerly)', () => {
        render(<Tooltip text="Explains the button"><button>Trigger</button></Tooltip>)

        const bubble = screen.getByRole('tooltip', { hidden: true })
        expect(bubble).toHaveStyle({ opacity: 0, visibility: 'hidden' })
    })

    test('a custom width is applied to the bubble', () => {
        render(<Tooltip text="x" width="150px"><button>Trigger</button></Tooltip>)

        expect(screen.getByRole('tooltip', { hidden: true })).toHaveStyle({ width: '150px' })
    })

    test('shows on hover and hides on mouse leave', () => {
        render(<Tooltip text="x"><button>Trigger</button></Tooltip>)
        const bubble = screen.getByRole('tooltip', { hidden: true })

        hover()
        expect(bubble).toHaveStyle({ opacity: 1, visibility: 'visible' })

        fireEvent.mouseLeave(screen.getByText('Trigger').closest('span'))
        expect(bubble).toHaveStyle({ opacity: 0, visibility: 'hidden' })
    })

    test('shows on keyboard focus and hides on blur', () => {
        render(<Tooltip text="x"><button>Trigger</button></Tooltip>)
        const bubble = screen.getByRole('tooltip', { hidden: true })

        fireEvent.focus(screen.getByText('Trigger'))
        expect(bubble).toHaveStyle({ opacity: 1, visibility: 'visible' })

        fireEvent.blur(screen.getByText('Trigger'))
        expect(bubble).toHaveStyle({ opacity: 0, visibility: 'hidden' })
    })

    test('positions itself in fixed viewport coordinates: centered under the trigger, below it', () => {
        setGeometry({ windowWidth: 1024, wrapperLeft: 400, wrapperWidth: 100, wrapperBottom: 60, bubbleWidth: 250 })
        render(<Tooltip text="x" width="250px"><button>Trigger</button></Tooltip>)

        hover()

        // centered: wrapperLeft(400) + wrapperWidth/2(50) - bubbleWidth/2(125) = 325; top: wrapperBottom(60) + 8px gap
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveStyle({ left: '325px', top: '68px' })
    })

    test('a trigger hard against the left edge shifts the tooltip right so it stays on screen', () => {
        // the Free Ride button next to the nav sidebar at a narrow window width (regression:
        // still clipped after the first fix, because it was nested under an ancestor with its
        // own overflow:hidden - see the portal in index.jsx)
        setGeometry({ windowWidth: 800, wrapperLeft: 4, wrapperWidth: 120, bubbleWidth: 250 })
        render(<Tooltip text="Pick any spot on the map and ride the real roads from there"><button>Free Ride</button></Tooltip>)

        hover()

        // clamped to the 8px edge margin
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveStyle({ left: '8px' })
    })

    test('a trigger hard against the right edge shifts the tooltip left so it stays on screen', () => {
        setGeometry({ windowWidth: 800, wrapperLeft: 700, wrapperWidth: 90, bubbleWidth: 250 })
        render(<Tooltip text="x"><button>Trigger</button></Tooltip>)

        hover()

        // clamped to 800 - 8(margin) - 250(bubble width)
        expect(screen.getByRole('tooltip', { hidden: true })).toHaveStyle({ left: '542px' })
    })

    test('is not clipped by an ancestor that hides overflow', () => {
        setGeometry({ windowWidth: 800, wrapperLeft: 4, wrapperWidth: 120, bubbleWidth: 250 })
        render(
            <div style={{ overflow: 'hidden', width: '10px' }} data-testid="clipping-ancestor">
                <Tooltip text="x"><button>Free Ride</button></Tooltip>
            </div>
        )

        hover()

        const bubble = screen.getByRole('tooltip', { hidden: true })
        expect(screen.getByTestId('clipping-ancestor').contains(bubble)).toBe(false)
    })
})
