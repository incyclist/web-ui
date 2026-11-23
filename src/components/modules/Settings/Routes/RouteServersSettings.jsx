import React from 'react'
import { AppThemeProvider } from '../../../../theme'
import { useRouteServersSettings } from '../../../../hooks/routes/useRouteServersSettings'
import { RouteServersList } from './RouteServersList'
import { RouteServersAdd } from './RouteServersAdd'
import { RemoveServerDialog } from './RemoveServerDialog'

/**
 * Route Servers panel of the Routes tab of the Settings dialog.
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
    view, servers, isEmpty, emptyState, known, knownNote, manual, trustNote, removeDialog, actions = {}
}) => {
    return <AppThemeProvider>
        <>
            {view === 'list' ?
                <RouteServersList servers={servers} isEmpty={isEmpty} emptyState={emptyState} onAdd={actions.showAdd} onRemove={actions.requestRemove} /> :
                <RouteServersAdd known={known} knownNote={knownNote} manual={manual} trustNote={trustNote} actions={actions} />
            }
            <RemoveServerDialog dialog={removeDialog}
                onKeepChange={actions.setRemoveRoutes} onConfirm={actions.confirmRemove} onCancel={actions.cancelRemove} />
        </>
    </AppThemeProvider>
}
