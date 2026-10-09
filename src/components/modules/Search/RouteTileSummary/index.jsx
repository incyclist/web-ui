import React, { useEffect, useState } from 'react'
import { useRouteList } from 'incyclist-services'
import { RouteTileSummaryView } from './component'

// The view receives only props, so Stories can render every card state without services.
export const RouteTileSummary = (props) => {
    const service = useRouteList()
    const [details, setDetails] = useState({})
    const hasShape = Array.isArray(props.shape) && props.shape.length > 0

    useEffect(() => {
        setDetails({})
        if (hasShape || props.loaded || !props.visible) return
        setDetails({ loading: true })
        let active = true
        const cancel = service.requestRouteDetails(props.id, data => {
            if (active) setDetails({ loading: false, points: data?.points })
        })
        return () => { active = false; cancel?.() }
    }, [props.id, hasShape, props.loaded, props.visible, service])

    return <RouteTileSummaryView {...props} details={details} />
}

export { RouteTileSummaryView, RouteProfile } from './component'
