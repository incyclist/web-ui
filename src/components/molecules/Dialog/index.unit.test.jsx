import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import { Dialog } from './index'

const pressEsc = () => fireEvent.keyUp(window, { key: 'Escape', keyCode: 27 })

describe('Dialog', () => {
    beforeEach(() => { delete window.activeDialog })

    test('ESC and outside click are reported', () => {
        const onESC = vi.fn(), onOutsideClicked = vi.fn()
        render(<Dialog id="A" onESC={onESC} onOutsideClicked={onOutsideClicked} />)
        pressEsc()
        expect(onESC).toHaveBeenCalledTimes(1)
        fireEvent.click(document.querySelector('.dialog').parentElement)
        expect(onOutsideClicked).toHaveBeenCalledTimes(1)
    })

    test('active dialog key stays stable across re-renders', () => {
        const { rerender } = render(<Dialog id="A" onESC={vi.fn()} />)
        const first = window.activeDialog
        rerender(<Dialog id="A" onESC={vi.fn()} />)
        expect(window.activeDialog).toBe(first)
    })

    test('active dialog is cleared when the last dialog unmounts', () => {
        const { unmount } = render(<Dialog id="A" onESC={vi.fn()} />)
        expect(window.activeDialog).toBeTruthy()
        unmount()
        expect(window.activeDialog).toBeUndefined()
    })

    // regression: a lower dialog re-rendering on its own while an upper dialog is open, and the upper one
    // then closing, used to leave window.activeDialog on a stale key - ESC was ignored by the lower dialog
    test('ESC still reaches the lower dialog after it re-rendered while an upper dialog was open', () => {
        const escA = vi.fn(), escB = vi.fn()
        let bumpA
        const A = () => {
            const [n, setN] = React.useState(0)
            bumpA = () => setN(v => v + 1)
            return <Dialog id="A" onESC={escA} data-n={n} />
        }
        const ui = (showB) => (
            <>
                <A />
                {showB ? <Dialog id="B" level={12} onESC={escB} /> : null}
            </>
        )
        const { rerender } = render(ui(false))
        rerender(ui(true))
        pressEsc()
        expect(escB).toHaveBeenCalledTimes(1)
        expect(escA).not.toHaveBeenCalled()

        act(() => bumpA())   // A re-renders on its own while B is open
        pressEsc()
        expect(escB).toHaveBeenCalledTimes(2)
        expect(escA).not.toHaveBeenCalled()

        rerender(ui(false))  // B closes
        pressEsc()
        expect(escA).toHaveBeenCalledTimes(1)
    })
})
