import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ConflictStepDialog } from './index'
import { conflictFromDetection, conflictFromPick } from './ConflictStepDialog.mock'

const conflict = (options, overrides = {}) => ({
    ...conflictFromDetection(options),
    onChoice: vi.fn(),
    onDone: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
})

// the Dialog's full-page layer around the dialog box: a click on it is a click outside the dialog
const outside = () => document.querySelector('.dialog').parentElement
const pressEsc = () => fireEvent.keyUp(window, { key: 'Escape', keyCode: 27 })
// the dismiss handler runs on the next tick, after the click/key event is done
const nextTick = () => act(() => new Promise(done => process.nextTick(done)))

const done = () => screen.getByRole('button', { name: 'Done' })
const replaceOf = (idx = 0) => screen.getAllByRole('radio', { name: 'Use Wahoo KICKR' })[idx]

describe('ConflictStepDialog', () => {

    afterEach(() => {
        vi.useRealTimers()
    })

    test('renders nothing without a conflict', () => {
        const { container } = render(<ConflictStepDialog />)

        expect(container.textContent).toBe('')
        expect(document.querySelector('.dialog')).toBeNull()
    })

    test('shows the title, the full subline and one row per slot in conflict', () => {
        const c = conflict()
        render(<ConflictStepDialog conflict={c} />)

        expect(screen.getByRole('dialog', { name: c.title })).toBeTruthy()
        expect(screen.getByText(c.title)).toBeTruthy()
        expect(screen.getByText(c.subline.full)).toBeTruthy()
        expect(screen.queryByText(c.subline.short)).toBeNull()
        expect(screen.getByText('Power')).toBeTruthy()
        expect(screen.getByText('Speed')).toBeTruthy()
        expect(screen.getAllByRole('radiogroup')).toHaveLength(2)
    })

    test('shows a single row when only one slot is in conflict', () => {
        render(<ConflictStepDialog conflict={conflict({ single: true })} />)

        expect(screen.getAllByRole('radiogroup')).toHaveLength(1)
        expect(screen.queryByText('Speed')).toBeNull()
    })

    test('shows how many more conflicts wait next to the title, only when the service says so', () => {
        const { rerender } = render(<ConflictStepDialog conflict={conflict({ queued: 2 })} />)
        expect(screen.getByText('2 more')).toBeTruthy()

        rerender(<ConflictStepDialog conflict={conflict()} />)
        expect(screen.queryByText(/^\d+ more$/)).toBeNull()
    })

    test('each row shows the choice the service hands over - keep, unless it says otherwise', () => {
        const { rerender } = render(<ConflictStepDialog conflict={conflict()} />)

        expect(screen.getByRole('radio', { name: 'Keep Assioma Duo' }).getAttribute('aria-checked')).toBe('true')
        expect(replaceOf(0).getAttribute('aria-checked')).toBe('false')

        rerender(<ConflictStepDialog conflict={conflict({ choice: 'replace' })} />)

        expect(screen.getByRole('radio', { name: 'Keep Assioma Duo' }).getAttribute('aria-checked')).toBe('false')
        expect(replaceOf(0).getAttribute('aria-checked')).toBe('true')
    })

    test('a choice in a row is reported with the row\'s capability', () => {
        const c = conflict()
        render(<ConflictStepDialog conflict={c} />)

        fireEvent.click(replaceOf(1))

        expect(c.onChoice).toHaveBeenCalledWith('speed', 'replace')
    })

    test('Done applies the choices', () => {
        const c = conflict()
        render(<ConflictStepDialog conflict={c} />)

        fireEvent.click(done())

        expect(c.onDone).toHaveBeenCalledTimes(1)
        expect(c.onDismiss).not.toHaveBeenCalled()
    })

    test('Esc calls the conflict\'s onDismiss, not Done', async () => {
        const c = conflict()
        render(<ConflictStepDialog conflict={c} />)

        pressEsc()
        await nextTick()

        expect(c.onDismiss).toHaveBeenCalledTimes(1)
        expect(c.onDone).not.toHaveBeenCalled()
    })

    test('a click outside the dialog calls the conflict\'s onDismiss, not Done', async () => {
        const c = conflict()
        render(<ConflictStepDialog conflict={c} />)

        fireEvent.click(outside())
        await nextTick()

        expect(c.onDismiss).toHaveBeenCalledTimes(1)
        expect(c.onDone).not.toHaveBeenCalled()
    })

    test('a click inside the dialog is not a click outside', async () => {
        const c = conflict()
        render(<ConflictStepDialog conflict={c} />)

        fireEvent.click(screen.getByText(c.subline.full))
        await nextTick()

        expect(c.onDismiss).not.toHaveBeenCalled()
    })

    test('has no close button: Done is its only button', () => {
        render(<ConflictStepDialog conflict={conflict()} />)

        expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
        expect(screen.queryByText('✕')).toBeNull()
        expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['Done'])
    })

    test('offers no "try again"', () => {
        render(<ConflictStepDialog conflict={conflict({ queued: 1 })} armDelay={500} />)

        const labels = screen.getAllByRole('button').map(b => b.textContent)
        expect(labels.filter(l => /try\s*again|retry/i.test(l))).toEqual([])
    })

    test('without an arming delay, the buttons work right away', () => {
        const c = { ...conflictFromPick(), onChoice: vi.fn(), onDone: vi.fn(), onDismiss: vi.fn() }
        render(<ConflictStepDialog conflict={c} />)

        fireEvent.click(screen.getByRole('radio', { name: 'Use Tacx Neo 2T' }))
        fireEvent.click(done())

        expect(c.onChoice).toHaveBeenCalledWith('power', 'replace')
        expect(c.onDone).toHaveBeenCalledTimes(1)
    })

    describe('with an arming delay', () => {

        test('Keep, Use and Done do nothing until the delay has passed, then work as usual', () => {
            vi.useFakeTimers()
            const c = conflict()
            render(<ConflictStepDialog conflict={{ ...c, rows: c.rows.map(r => r.capability === 'speed' ? { ...r, choice: 'replace' } : r) }} armDelay={500} />)

            fireEvent.click(replaceOf(0))
            fireEvent.click(screen.getByRole('radio', { name: 'Keep Garmin Speed' }))
            fireEvent.click(done())
            act(() => { vi.advanceTimersByTime(499) })
            fireEvent.click(done())

            expect(c.onChoice).not.toHaveBeenCalled()
            expect(c.onDone).not.toHaveBeenCalled()

            act(() => { vi.advanceTimersByTime(1) })

            fireEvent.click(replaceOf(0))
            fireEvent.click(screen.getByRole('radio', { name: 'Keep Garmin Speed' }))
            fireEvent.click(done())

            expect(c.onChoice).toHaveBeenNthCalledWith(1, 'power', 'replace')
            expect(c.onChoice).toHaveBeenNthCalledWith(2, 'speed', 'keep')
            expect(c.onDone).toHaveBeenCalledTimes(1)
        })

        test('Esc is never held back', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const c = conflict()
            render(<ConflictStepDialog conflict={c} armDelay={500} />)

            pressEsc()
            await nextTick()

            expect(c.onDismiss).toHaveBeenCalledTimes(1)
        })

        test('a click outside is never held back', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const c = conflict()
            render(<ConflictStepDialog conflict={c} armDelay={500} />)

            fireEvent.click(outside())
            await nextTick()

            expect(c.onDismiss).toHaveBeenCalledTimes(1)
        })

        test('the next conflict, taking the place of the one just answered, waits out the delay again', () => {
            vi.useFakeTimers()
            const first = conflict({ id: 'detection-1', queued: 1 })
            const { rerender } = render(<ConflictStepDialog conflict={first} armDelay={500} />)
            act(() => { vi.advanceTimersByTime(500) })
            fireEvent.click(done())
            expect(first.onDone).toHaveBeenCalledTimes(1)

            const next = conflict({ id: 'detection-2' })
            rerender(<ConflictStepDialog conflict={next} armDelay={500} />)
            fireEvent.click(done())
            expect(next.onDone).not.toHaveBeenCalled()

            act(() => { vi.advanceTimersByTime(500) })
            fireEvent.click(done())
            expect(next.onDone).toHaveBeenCalledTimes(1)
        })

        test('an update of the same conflict (e.g. a choice handed back) doesn\'t start the delay again', () => {
            vi.useFakeTimers()
            const c = conflict()
            const { rerender } = render(<ConflictStepDialog conflict={c} armDelay={500} />)
            act(() => { vi.advanceTimersByTime(500) })

            rerender(<ConflictStepDialog conflict={{ ...c, rows: c.rows.map(r => ({ ...r, choice: 'replace' })) }} armDelay={500} />)
            fireEvent.click(done())

            expect(c.onDone).toHaveBeenCalledTimes(1)
        })
    })
})
