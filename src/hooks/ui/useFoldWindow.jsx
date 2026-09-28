import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Observer } from 'incyclist-services'
import { EventLogger } from 'gd-eventlog'
import { useMouseSwipe } from './useMouseSwipe'

const SWIPE_CLICK_GUARD_MS = 300

/**
 * Computes which item indices are inside the fold (i.e. should be fully rendered).
 *
 * The container is assumed to contain `count` equally sized items, laid out in rows of `columns`
 * items. The window starts at the first (partially) visible row - minus `overscanBefore` rows -
 * and extends one viewport height below it, which gives the overscan below the visible list area.
 *
 * Working in whole rows matters for grids: a partially scrolled-out top row stays inside the fold
 * as a whole, rather than only its right-hand part.
 *
 * @returns {{first:number,last:number}|null} inclusive index range, or null if the geometry is unknown
 */
export const computeFoldWindow = ({count, scrollTop=0, scrollHeight, viewportHeight, columns=1, overscanBefore=0}) => {
    if (!count || !scrollHeight || !viewportHeight)
        return null

    const cols = Math.max(1, Math.floor(columns) || 1)
    const rows = Math.ceil(count/cols)
    const rowHeight = scrollHeight/rows

    const topRow = Math.floor(Math.max(0,scrollTop)/rowHeight)
    const visibleRows = viewportHeight/rowHeight

    const firstRow = Math.max(0, topRow-overscanBefore)
    const lastRow = Math.floor(topRow+visibleRows)

    return {
        first: firstRow*cols,
        last: Math.min(count-1, (lastRow+1)*cols-1)
    }
}

/**
 * Number of items in the first rendered row of the container (1 for a list).
 * Only reads the leading children until the first line break, so it stays cheap for long lists.
 */
export const measureColumns = (element) => {
    const children = element?.children
    if (!children?.length)
        return 1

    const first = children[0]
    if (!first.offsetHeight)    // not laid out (yet)
        return 1

    const top = first.offsetTop
    let columns = 0
    for (const child of children) {
        if (child.offsetTop!==top)
            break
        columns++
    }
    return Math.max(columns,1)
}

/**
 * Shared fold ("windowing") logic for long scrollable lists and grids whose rows are wrapped in `Dynamic`.
 *
 * Items outside the fold are rendered as cheap placeholders of the same size, items inside are rendered
 * fully. The transition is two-way: items scrolling out of the fold go back to the placeholder state and
 * release their heavy content.
 *
 * Fold changes are pushed per item through `observer` (event: `getFoldEvent(key)`, value: outsideFold),
 * so only the affected item re-renders - the list component itself is not re-rendered while scrolling.
 *
 * Also owns the mouse/touch swipe scrolling of the container.
 *
 * @param {object} props
 * @param {Array} props.items                     items rendered in the container, in render order
 * @param {(item,idx)=>string|number} props.getKey  must return the same key as used for the item's `Dynamic`
 * @param {number} [props.initialScrollTop]       scroll position to restore on mount
 * @param {(top:number)=>void} [props.onScrollTop] called with the current scroll position on every scroll
 * @param {number} [props.overscanBefore=1]      rows kept inside the fold above the first visible row
 *
 * @returns {{ref, observer, initialized:boolean, isOutsideFold:(key)=>boolean, getFoldEvent:(key)=>string, swipedRecently:()=>boolean}}
 */
export const useFoldWindow = ({items, getKey, initialScrollTop, onScrollTop, overscanBefore=1}) => {

    const ref = useRef(null)
    const observerRef = useRef(null)
    if (!observerRef.current)
        observerRef.current = new Observer()

    const foldRef = useRef(new Map())       // key -> outsideFold
    const itemsRef = useRef(items)
    const getKeyRef = useRef(getKey)
    const onScrollTopRef = useRef(onScrollTop)
    const columnsRef = useRef(1)
    const initializedRef = useRef(false)
    const [initialized,setInitialized] = useState(false)

    const topRef = useRef(0)
    const swipingRef = useRef(false)
    const lastSwipeTS = useRef(null)

    itemsRef.current = items
    getKeyRef.current = getKey
    onScrollTopRef.current = onScrollTop

    const keyOf = (item,idx) => {
        const fn = getKeyRef.current
        return typeof fn === 'function' ? fn(item,idx) : idx
    }

    const getFoldEvent = useCallback( (key) => `outsideFold-${key}`, [])

    const isOutsideFold = useCallback( (key) => foldRef.current.get(key) ?? true, [])

    // recalculates the fold window; emits a fold event for every item whose state changed (in both directions)
    const updateFold = useCallback( (emit=true)=>{
        try {
            const div = ref.current
            const list = itemsRef.current ?? []
            if (!div || !list.length)
                return

            const range = computeFoldWindow( {
                count: list.length,
                scrollTop: div.scrollTop,
                scrollHeight: div.scrollHeight,
                viewportHeight: window.innerHeight,
                columns: columnsRef.current,
                overscanBefore
            })
            if (!range)
                return

            const fold = foldRef.current
            list.forEach( (item,i) => {
                const key = keyOf(item,i)
                const outsideFold = i<range.first || i>range.last
                const prev = fold.get(key) ?? true

                if (prev!==outsideFold) {
                    fold.set(key,outsideFold)
                    if (emit)
                        observerRef.current.emit( getFoldEvent(key), outsideFold)
                }
                else if (!fold.has(key)) {
                    fold.set(key,outsideFold)
                }
            })
        }
        catch(err) {
            const logger = new EventLogger('Incyclist')
            logger.logEvent({message:'error',fn:'updateFold',error:err.message, stack:err.stack})
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[getFoldEvent, overscanBefore])

    const onScrollHandler = useCallback( ()=>{
        const div = ref.current
        if (!div)
            return

        // keep the swipe start position in sync with scrolling not caused by a swipe (wheel, scrollbar, restore)
        if (!swipingRef.current)
            topRef.current = div.scrollTop

        if (typeof onScrollTopRef.current === 'function')
            onScrollTopRef.current(div.scrollTop)

        updateFold(true)
    },[updateFold])

    const onResizeHandler = useCallback( ()=>{
        columnsRef.current = measureColumns(ref.current)
        updateFold(true)
    },[updateFold])

    // mount: restore scroll position before the first paint, so there is no visible jump from 0.
    // Kept separate from the fold computation below - it is cheap and must be synchronous.
    useLayoutEffect( ()=>{
        const div = ref.current
        if (!div || initializedRef.current)
            return

        if (initialScrollTop!==undefined && initialScrollTop!==null) {
            div.scrollTop = initialScrollTop
            topRef.current = div.scrollTop
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    // mount: calculate the initial fold once the (restored) skeleton state has painted.
    // Rows receive their initial fold state via props (one re-render of the list), all later changes via events.
    // Deliberately a passive effect, not a layout effect: the rows inside the fold are expensive to mount
    // (e.g. a Leaflet map per row), and computing the fold before paint would make that mount cost block the
    // first paint instead of the cheap skeleton state being visible immediately.
    useEffect( ()=>{
        const div = ref.current
        if (!div || initializedRef.current)
            return

        columnsRef.current = measureColumns(div)
        updateFold(false)

        initializedRef.current = true
        setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect( ()=>{
        const div = ref.current
        if (!div)
            return

        div.addEventListener('scroll',onScrollHandler)
        window.addEventListener('resize',onResizeHandler)
        return ()=>{
            div.removeEventListener('scroll',onScrollHandler)
            window.removeEventListener('resize',onResizeHandler)
        }
    },[onScrollHandler, onResizeHandler])

    // item list changed without a remount: drop state of removed items, recalculate for new/moved ones.
    // Runs as passive effect, i.e. after the new items' Dynamic components have subscribed to their events
    useEffect( ()=>{
        if (!initializedRef.current)
            return

        const list = items ?? []
        const keys = new Set( list.map( (item,i)=>keyOf(item,i)))
        const fold = foldRef.current
        Array.from(fold.keys()).forEach( key => {
            if (!keys.has(key))
                fold.delete(key)
        })

        columnsRef.current = measureColumns(ref.current)
        updateFold(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[items, updateFold])


    const onSwipeEnd = useCallback( (d)=> {
        const div = ref.current
        div?.focus()

        let top = topRef.current-d.deltaY
        if (top<0) top=0
        topRef.current = top
        swipingRef.current = false

        lastSwipeTS.current = Date.now()
    },[])

    const onSwipe = useCallback( ( direction, pixels,event)=> {
        if (!event)
            return;

        if(direction==='swipe-up'|| direction==='swipe-down') {
            const {deltaY} = event
            const div = ref.current
            if (!div)
                return

            swipingRef.current = true

            let top = topRef.current-deltaY
            if (top<0) top=0

            div.focus()
            div.scrollTo({top,behavior:'instant'})
        }
    },[])

    useMouseSwipe(['swipe-up','swipe-down'], onSwipe, {div:ref.current,onSwipeEnd })

    // a click that ends a swipe must not be treated as item selection
    const swipedRecently = useCallback( ()=> {
        return lastSwipeTS.current!==null && (Date.now()-lastSwipeTS.current)<SWIPE_CLICK_GUARD_MS
    },[])

    return {
        ref,
        observer: observerRef.current,
        initialized,
        isOutsideFold,
        getFoldEvent,
        swipedRecently
    }
}
