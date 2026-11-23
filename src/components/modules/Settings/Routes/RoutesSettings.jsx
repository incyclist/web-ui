import React from 'react'
import { useLocalLink } from 'incyclist-services'
import { RouteServersSettings } from './RouteServersSettings'
import { RouteSharingSettings } from '../RouteSharing'

/**
 * "Routes" tab of the Settings dialog: the Route Servers panel, followed by the Route Sharing panel
 * when route sharing is available on this installation.
 */
export const RoutesSettings = () => {
    const showRouteSharing = useLocalLink().isAvailable()

    return <RoutesSettingsView showRouteSharing={showRouteSharing} />
}

export const RoutesSettingsView = ({ showRouteSharing }) => <>
    <RouteServersSettings />
    {showRouteSharing ? <RouteSharingSettings /> : null}
</>
