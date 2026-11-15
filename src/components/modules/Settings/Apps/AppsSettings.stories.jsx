import React, { useState } from 'react'
import styled from "styled-components"
import { Row } from "../../../atoms"
import { AppSettingsView } from "../../../molecules/Apps/AppSettingsView"
import { AppsSettingsView } from "./AppsSettings"

const View = styled(Row)`
    width: 800px;
    height: 600px;
    overflow-y: hidden;
`

export default {
    component: AppsSettingsView,
    title: 'Modules/Settings/AppsSettings',
    argTypes: {
        onToggle: { action: 'toggle' },
    },
}

const apps = [
    { name: 'Strava', key: 'strava', isConnected: true },
    { name: 'Komoot', key: 'komoot', isConnected: false },
    { name: 'Intervals.icu', key: 'intervals', isConnected: false },
]

const operations = [
    { operation: 'ActivityUpload', enabled: true },
    { operation: 'RouteDownload', enabled: false },
]

const renderApp = (app) => <AppSettingsView name={app.name} isConnected={app.isConnected} operations={operations} />

const Template = args => {
    const [expandedKey, setExpandedKey] = useState(args.expandedKey)
    const onToggle = (key) => setExpandedKey(current => current === key ? null : key)

    return <View className='TEST'>
        <AppsSettingsView {...args} expandedKey={expandedKey} onToggle={onToggle} renderApp={renderApp} />
    </View>
}

export const Collapsed = Template.bind({})
Collapsed.args = { apps }

export const ConnectedExpanded = Template.bind({})
ConnectedExpanded.args = { apps, expandedKey: 'strava' }

export const NotConnectedExpanded = Template.bind({})
NotConnectedExpanded.args = { apps, expandedKey: 'intervals' }

export const NoApps = Template.bind({})
NoApps.args = { apps: [] }
