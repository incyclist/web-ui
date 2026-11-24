import React, { useCallback, useEffect, useRef, useState } from 'react'
import { copyPropsExcluding } from '../../../../../utils/props'
import { useUnmountEffect } from '../../../../../hooks'

const EXCLUDED_PROPS = ['observer', 'width', 'height', 'padding', 'Summary', 'Details', 'layout', 'category']

export const Card = (props) => {
    const { observer, Summary, layout, category, width, height } = props

    const [state, setState] = useState(() => copyPropsExcluding(props, EXCLUDED_PROPS))
    const prevPropsRef = useRef(null)
    if (prevPropsRef.current === null) {
        prevPropsRef.current = copyPropsExcluding(props, EXCLUDED_PROPS)
    }
    const refMounted = useRef(true)

    const handleUpdate = useCallback((updatedProps) => {
        if (!refMounted.current)
            return
        // selection is no longer part of the card UI, and the observer must not leak into the display state
        // eslint-disable-next-line no-unused-vars
        const { selected, observer: _observer, ...content } = updatedProps ?? {}
        setState(current => ({ ...current, ...content }))
    }, [])

    useEffect(() => {
        const next = copyPropsExcluding(props, EXCLUDED_PROPS)
        const prev = prevPropsRef.current ?? {}
        const changed = {}
        let hasChanges = false

        const keys = new Set([...Object.keys(prev), ...Object.keys(next)])
        for (const key of keys) {
            if (prev[key] !== next[key]) {
                changed[key] = next[key]
                hasChanges = true
            }
        }

        prevPropsRef.current = next

        if (hasChanges) {
            setState(current => ({ ...current, ...changed }))
        }
    }, [props])

    useEffect(() => {
        refMounted.current = true
        if (!observer)
            return
        observer.on('update', handleUpdate)
        return () => {
            observer.off('update', handleUpdate)
        }
    }, [handleUpdate, observer])

    useUnmountEffect(() => {
        refMounted.current = false
    })

    if (!Summary)
        return null

    const stateProps = state || {}
    const isList = layout === 'list'

    return (
        <Summary
            {...stateProps}
            layout={layout}
            category={category}
            width={isList ? undefined : width}
            height={isList ? undefined : height}
        />
    )
}
