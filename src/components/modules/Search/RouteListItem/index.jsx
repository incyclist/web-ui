import React, { useEffect, useState } from 'react'
import { useAppsService, useRouteList } from 'incyclist-services'
import { RouteListItemSkeleton, RouteListItemView } from './component'

// Service subscriptions and detail loading stay here; the row view is driven by props.
export const RouteListItem = ({ outsideFold, ...props }) => {
    const service = useRouteList()
    const apps = useAppsService()
    const [updates, setUpdates] = useState({})
    const [details, setDetails] = useState({})
    const { id, observer } = props
    const route = { ...props, ...updates }
    const hasShape = Array.isArray(route.shape) && route.shape.length > 0
    const hasPoints = Array.isArray(route.points) && route.points.length > 0
    let sourceLabel
    try { if (route.source) sourceLabel = apps.getName(route.source) }
    catch { sourceLabel = route.source }

    useEffect(() => {
        if (!observer) return
        const onUpdate = next => setUpdates(previous => ({ ...previous, ...next }))
        observer.on('update', onUpdate)
        observer.on('redraw', onUpdate)
        return () => { observer.off('update', onUpdate); observer.off('redraw', onUpdate) }
    }, [observer])

    useEffect(() => {
        setDetails({})
        if (outsideFold || hasShape || (route.loaded && hasPoints) || id === undefined) return
        setDetails({ loading: true })
        let active = true
        let cancel
        try {
            cancel = service.requestRouteDetails(id, data => {
                if (active) setDetails({ loading: false, points: data?.points })
            })
        } catch { if (active) setDetails({ loading: false }) }
        return () => { active = false; cancel?.() }
    }, [outsideFold, hasShape, route.loaded, hasPoints, id, service])

    if (outsideFold || route.ready === false) return <RouteListItemSkeleton />

    return <RouteListItemView {...route} sourceLabel={sourceLabel} details={details} />
}

export { RouteListItemView, RouteListItemSkeleton } from './component'
