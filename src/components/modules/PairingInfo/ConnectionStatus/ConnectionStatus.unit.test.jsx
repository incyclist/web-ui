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
