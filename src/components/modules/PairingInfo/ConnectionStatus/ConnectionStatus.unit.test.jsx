import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import { ConnectionStatus } from './index'

describe('ConnectionStatus use toggle', ()=> {

    test('clicking the toggle reports that the device is no longer used', ()=> {
        const onUnselect = vi.fn()
        const { getByRole } = render(<ConnectionStatus state="connected" onUnselect={onUnselect} />)

        fireEvent.click(getByRole('switch'))

        expect(onUnselect).toHaveBeenCalledTimes(1)
    })

    test('clicking the toggle does not reach the tile, so the device list stays closed', ()=> {
        const onTileClicked = vi.fn()
        const { getByRole } = render(
            <div onClick={onTileClicked}>
                <ConnectionStatus state="connected" onUnselect={vi.fn()} />
            </div>
        )

        fireEvent.click(getByRole('switch'))

        expect(onTileClicked).not.toHaveBeenCalled()
    })
})

describe('ConnectionStatus status icon', ()=> {

    const icon = (container) => container.querySelector('svg.octicon-check, svg.octicon-x-circle-fill')

    test('a connected tile with no footer copy shows the connect-state icon', ()=> {
        const { container } = render(<ConnectionStatus state="connected" onUnselect={vi.fn()} />)

        expect(icon(container)).not.toBeNull()
    })

    test('a tile with the page service\'s footer copy shows no icon next to it', ()=> {
        const { container, getByText } = render(
            <ConnectionStatus state="failed" footerText="Waiting for trainer" onUnselect={vi.fn()} />
        )

        expect(getByText('Waiting for trainer')).toBeTruthy()
        expect(icon(container)).toBeNull()
    })

    test('a compact tile (helper open) shows no icon, only the state text', ()=> {
        const { container, getByText } = render(
            <ConnectionStatus state="connected" compact={true} onUnselect={vi.fn()} />
        )

        expect(getByText('connected')).toBeTruthy()
        expect(icon(container)).toBeNull()
    })
})

describe('ConnectionStatus footer strip layout', ()=> {

    test('the footer text stays on one line and may only be cut with an ellipsis', ()=> {
        const { getByText } = render(
            <ConnectionStatus state="failed" footerText="Waiting for trainer" onUnselect={vi.fn()} />
        )

        const text = getComputedStyle(getByText('Waiting for trainer'))
        expect(text.whiteSpace).toBe('nowrap')
        expect(text.overflow).toBe('hidden')
        expect(text.textOverflow).toBe('ellipsis')
        expect(text.minWidth).toMatch(/^0(px)?$/)
    })

    test('the strip keeps the toggle\'s width, its right offset and a small gap clear on the right', ()=> {
        const { getByText } = render(
            <ConnectionStatus state="failed" footerText="Waiting for trainer" onUnselect={vi.fn()} />
        )

        const strip = getComputedStyle(getByText('Waiting for trainer').parentElement)
        expect(strip.paddingRight).toBe('calc(3.9vh + 1.5vw)')
        expect(strip.overflow).toBe('hidden')
    })
})

describe('ConnectionStatus T16 (switched off, device remembered)', ()=> {

    test('shows the footer text instead of the connect state, and the toggle in the off position', ()=> {
        const { getByText, queryByText, getByRole } = render(
            <ConnectionStatus state="connected" disabled={true} footer="Not used" onUse={vi.fn()} />
        )

        expect(getByText('Not used')).toBeTruthy()
        expect(queryByText('connected')).toBeNull()
        expect(getByRole('switch').getAttribute('aria-checked')).toBe('false')
    })

    test('clicking the toggle restores the device (onUse), not onUnselect', ()=> {
        const onUse = vi.fn()
        const onUnselect = vi.fn()
        const { getByRole } = render(
            <ConnectionStatus state="connected" disabled={true} footer="Not used" onUse={onUse} onUnselect={onUnselect} />
        )

        fireEvent.click(getByRole('switch'))

        expect(onUse).toHaveBeenCalledTimes(1)
        expect(onUnselect).not.toHaveBeenCalled()
    })
})
