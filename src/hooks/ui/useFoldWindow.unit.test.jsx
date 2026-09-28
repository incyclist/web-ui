import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Dynamic } from '../../components/atoms/Dynamic'
import { useFoldWindow, computeFoldWindow, measureColumns } from './useFoldWindow'

// jsdom has no layout: every row is ROW_HEIGHT px tall, the viewport is window.innerHeight (768px) tall
const ROW_HEIGHT = 70

const counters = { parent: 0, rows: {} }
const latest = { fold: null, div: null }

const Row = ({ id, outsideFold }) => {
    counters.rows[id] = (counters.rows[id] ?? 0) + 1
    return <div data-testid={`row-${id}`} data-outside={String(outsideFold)} />
}

const getKey = (item) => item.id

const Harness = ({ items, initialScrollTop, onScrollTop }) => {
    counters.parent++
    const fold = useFoldWindow({ items, getKey, initialScrollTop, onScrollTop })
    latest.fold = fold

    const setRef = (el) => {
        if (el && !el.__geometry) {
            el.__geometry = true
            // scroll height follows the current number of rows
            Object.defineProperty(el, 'scrollHeight', { configurable: true, get: () => el.children.length * ROW_HEIGHT })
            Object.defineProperty(el, 'scrollTop', { configurable: true, writable: true, value: 0 })
            el.scrollTo = vi.fn(({ top }) => { el.scrollTop = top })
            latest.div = el
        }
        fold.ref.current = el
    }

    return (
        <div ref={setRef}>
            {items.map((item, idx) => {
                const key = getKey(item, idx)
                return (
                    <Dynamic observer={fold.observer} key={key} event={fold.getFoldEvent(key)} prop='outsideFold'>
                        <Row id={item.id} outsideFold={fold.isOutsideFold(key)} />
                    </Dynamic>
                )
            })}
        </div>
    )
}

const createItems = (cnt, offset = 0) => Array.from({ length: cnt }, (_, i) => ({ id: `r${i + offset}` }))

const isOutside = (id) => screen.getByTestId(`row-${id}`).dataset.outside === 'true'
const insideIds = () => screen.getAllByTestId(/^row-/).filter(e => e.dataset.outside === 'false').map(e => e.dataset.testid.replace('row-', ''))

const scrollTo = (top) => {
    act(() => {
        latest.div.scrollTop = top
        latest.div.dispatchEvent(new Event('scroll'))
    })
}

const mouse = (type, pageY) => {
    const event = new MouseEvent(type, { bubbles: true })
    Object.defineProperty(event, 'pageX', { value: 0 })
    Object.defineProperty(event, 'pageY', { value: pageY })
    act(() => { latest.div.dispatchEvent(event) })
}

describe('computeFoldWindow', () => {

    test('list: same window as the legacy calculation (first visible row .. one viewport below)', () => {
        // legacy: inside iff topElement <= i <= topElement + innerHeight/rowHeight
        const range = computeFoldWindow({ count: 100, scrollTop: 700, scrollHeight: 7000, viewportHeight: 768 })
        expect(range).toEqual({ first: 10, last: 20 })
    })

    test('list: overscanBefore keeps rows above the first visible row', () => {
        const range = computeFoldWindow({ count: 100, scrollTop: 700, scrollHeight: 7000, viewportHeight: 768, overscanBefore: 2 })
        expect(range).toEqual({ first: 8, last: 20 })
    })

    test('never starts before the first item or ends after the last one', () => {
        expect(computeFoldWindow({ count: 5, scrollTop: 0, scrollHeight: 350, viewportHeight: 768, overscanBefore: 3 })).toEqual({ first: 0, last: 4 })
    })

    test('grid: works in whole rows, so a partially scrolled-out top row stays inside', () => {
        // 9 columns, 20 rows of 250px; scrolled halfway into row 3
        const range = computeFoldWindow({ count: 180, scrollTop: 875, scrollHeight: 5000, viewportHeight: 768, columns: 9 })
        expect(range.first).toBe(27)            // first tile of row 3
        expect(range.last).toBe(7 * 9 - 1)      // last tile of row floor(3.5+768/250)=6
    })

    test('grid: partial last row is counted as a row', () => {
        const range = computeFoldWindow({ count: 10, scrollTop: 0, scrollHeight: 500, viewportHeight: 200, columns: 4 })
        // 3 rows of 166.7px -> rows 0..1 inside
        expect(range).toEqual({ first: 0, last: 7 })
    })

    test('returns null while the geometry is unknown', () => {
        expect(computeFoldWindow({ count: 10, scrollTop: 0, scrollHeight: 0, viewportHeight: 768 })).toBeNull()
        expect(computeFoldWindow({ count: 0, scrollTop: 0, scrollHeight: 100, viewportHeight: 768 })).toBeNull()
    })
})

describe('measureColumns', () => {
    const element = (tops, height = 10) => ({
        children: tops.map(offsetTop => ({ offsetTop, offsetHeight: height }))
    })

    test('counts the items in the first row', () => {
        expect(measureColumns(element([0, 0, 0, 100, 100, 100]))).toBe(3)
    })

    test('list layout has one column', () => {
        expect(measureColumns(element([0, 70, 140]))).toBe(1)
    })

    test('defaults to one column without children or layout', () => {
        expect(measureColumns(null)).toBe(1)
        expect(measureColumns(element([]))).toBe(1)
        expect(measureColumns(element([0, 0, 0], 0))).toBe(1)
    })
})

describe('useFoldWindow', () => {

    beforeEach(() => {
        counters.parent = 0
        counters.rows = {}
        latest.fold = null
        latest.div = null
    })

    test('initially only rows inside the fold are rendered as inside', () => {
        render(<Harness items={createItems(50)} />)

        // 768/70 = 10.97 -> rows 0..10
        expect(insideIds()).toEqual(createItems(11).map(i => i.id))
        expect(isOutside('r11')).toBe(true)
        expect(isOutside('r49')).toBe(true)
    })

    test('the list is rendered once more after mount to apply the initial fold, not while scrolling', () => {
        render(<Harness items={createItems(50)} />)
        const afterMount = counters.parent

        scrollTo(20 * ROW_HEIGHT)
        scrollTo(0)

        expect(afterMount).toBe(2)
        expect(counters.parent).toBe(afterMount)
    })

    test('rows leaving the fold go back outside (two-way), rows entering it come inside', () => {
        render(<Harness items={createItems(50)} />)

        scrollTo(20 * ROW_HEIGHT)
        // first visible row is 20, one row overscan above, one viewport below
        expect(insideIds()).toEqual(createItems(12, 19).map(i => i.id))
        expect(isOutside('r0')).toBe(true)
        expect(isOutside('r10')).toBe(true)

        scrollTo(0)
        expect(insideIds()).toEqual(createItems(11).map(i => i.id))
        expect(isOutside('r20')).toBe(true)
    })

    test('only rows whose fold state changes are re-rendered', () => {
        render(<Harness items={createItems(50)} />)
        const before = { ...counters.rows }

        scrollTo(ROW_HEIGHT)   // row 11 enters; row 0 stays inside because of the overscan above

        expect(counters.rows.r11).toBe(before.r11 + 1)
        expect(counters.rows.r0).toBe(before.r0)
        expect(counters.rows.r5).toBe(before.r5)
        expect(counters.rows.r40).toBe(before.r40)
    })

    test('restores the initial scroll position and calculates the fold there', () => {
        render(<Harness items={createItems(50)} initialScrollTop={30 * ROW_HEIGHT} />)

        expect(latest.div.scrollTop).toBe(30 * ROW_HEIGHT)
        expect(isOutside('r0')).toBe(true)
        expect(isOutside('r28')).toBe(true)
        expect(isOutside('r29')).toBe(false)
        expect(isOutside('r40')).toBe(false)
    })

    test('reports the scroll position on every scroll', () => {
        const onScrollTop = vi.fn()
        render(<Harness items={createItems(50)} onScrollTop={onScrollTop} />)

        scrollTo(123)
        scrollTo(456)

        expect(onScrollTop).toHaveBeenNthCalledWith(1, 123)
        expect(onScrollTop).toHaveBeenNthCalledWith(2, 456)
    })

    test('follows rows by key when the item list changes without a remount', () => {
        const items = createItems(50)
        const { rerender } = render(<Harness items={items} />)
        expect(isOutside('r30')).toBe(true)

        // r30 moves to the top of the list
        const reordered = [items[30], ...items.filter((_, i) => i !== 30)]
        rerender(<Harness items={reordered} />)

        expect(isOutside('r30')).toBe(false)
        expect(isOutside('r10')).toBe(true)    // pushed to index 11
        expect(isOutside('r9')).toBe(false)    // index 10
    })

    test('new rows are folded in, removed rows are forgotten', () => {
        const { rerender } = render(<Harness items={createItems(50)} />)

        rerender(<Harness items={[...createItems(3, 100), ...createItems(47)]} />)
        expect(isOutside('r100')).toBe(false)
        expect(isOutside('r7')).toBe(false)
        expect(isOutside('r8')).toBe(true)

        expect(latest.fold.isOutsideFold('r49')).toBe(true)
    })

    test('mouse swipe scrolls from the current scroll position and suppresses the click that ends it', () => {
        render(<Harness items={createItems(50)} />)

        // scrolled by other means (wheel/scrollbar) before the swipe
        scrollTo(700)

        expect(latest.fold.swipedRecently()).toBe(false)

        mouse('mousedown', 500)
        mouse('mousemove', 400)
        expect(latest.div.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: 'instant' })

        mouse('mousemove', 300)
        expect(latest.div.scrollTo).toHaveBeenLastCalledWith({ top: 900, behavior: 'instant' })

        mouse('mouseup', 300)
        expect(latest.fold.swipedRecently()).toBe(true)

        // next swipe continues from where the last one ended
        mouse('mousedown', 300)
        mouse('mousemove', 400)
        expect(latest.div.scrollTo).toHaveBeenLastCalledWith({ top: 800, behavior: 'instant' })
    })

    test('swipe never scrolls above the top', () => {
        render(<Harness items={createItems(50)} />)

        mouse('mousedown', 100)
        mouse('mousemove', 400)
        expect(latest.div.scrollTo).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' })
    })

    test('stops listening to scroll events on unmount', () => {
        const onScrollTop = vi.fn()
        const { unmount } = render(<Harness items={createItems(50)} onScrollTop={onScrollTop} />)
        const div = latest.div

        unmount()
        div.dispatchEvent(new Event('scroll'))

        expect(onScrollTop).not.toHaveBeenCalled()
    })
})
