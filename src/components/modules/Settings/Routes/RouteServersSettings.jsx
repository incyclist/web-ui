import React from 'react'
import { AppThemeProvider } from '../../../../theme'
import { useRouteServersSettings } from '../../../../hooks/routes/useRouteServersSettings'
import { ContentArea } from '../Apps/AppsSettings'
import { RouteServersList } from './RouteServersList'
import { RouteServersAdd } from './RouteServersAdd'
import { RemoveServerDialog } from './RemoveServerDialog'

/**
 * "Routes" tab of the Settings dialog. Route Servers is the only panel for now.
 */
export const RouteServersSettings = () => {
    const { props, actions } = useRouteServersSettings('settings')

    if (!props)
        return null

    return <RouteServersSettingsView {...props} actions={actions} />
}

/**
 * Pure view: renders the display props of the route servers dialog service. The add view replaces the list in place.
 */
export const RouteServersSettingsView = ({
    view, servers, isEmpty, emptyState, known, knownNote, manual, trustNote, removeDialog, highlightKey, actions = {}
}) => {
    return <AppThemeProvider>
        <ContentArea>
            {view === 'list' ?
                <RouteServersList servers={servers} isEmpty={isEmpty} emptyState={emptyState} highlightKey={highlightKey}
                    onAdd={actions.showAdd} onRemove={actions.requestRemove} /> :
                <RouteServersAdd known={known} knownNote={knownNote} manual={manual} trustNote={trustNote} actions={actions} />
            }
            <RemoveServerDialog dialog={removeDialog}
                onKeepChange={actions.setRemoveRoutes} onConfirm={actions.confirmRemove} onCancel={actions.cancelRemove} />
        </ContentArea>
    </AppThemeProvider>
}
