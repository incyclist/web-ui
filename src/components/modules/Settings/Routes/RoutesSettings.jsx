import React from 'react'
import { useLocalLink } from 'incyclist-services'
import { AppThemeProvider } from '../../../../theme'
import { RouteServersSettings } from './RouteServersSettings'
import { ContentArea } from '../Apps/AppsSettings'
import { RouteSharingSettings } from '../RouteSharing'

/**
 * "Routes" tab of the Settings dialog: the Route Servers panel, each as a bordered card, followed by the Route Sharing panel
 * when route sharing is available on this installation.
 */
export const RoutesSettings = () => {
    const showRouteSharing = useLocalLink().isAvailable()

    return <RoutesSettingsView showRouteSharing={showRouteSharing} />
}

export const RoutesSettingsView = ({ showRouteSharing }) => <AppThemeProvider>
    <ContentArea>
        <RouteServersSettings />
        {showRouteSharing ? <RouteSharingSettings /> : null}
    </ContentArea>
</AppThemeProvider>
