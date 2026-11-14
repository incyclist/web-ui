import { useAppsService } from "incyclist-services"
import React, { useCallback, useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { EventLogger } from "gd-eventlog"
import { AppThemeProvider } from "../../../../theme"
import { AppsItem } from "../../../molecules/Apps/AppsItem"
import { KomootSettings } from "./Komoot/KomootSettings"
import { OAuthAppSettings } from "./OAuthAppSettings"

export const ContentArea = styled.div`
    position:relative;
    width: ${props=> props.width || 'calc(100% - 2vw)'};
    text-align: left ;
    margin:auto;
    display: flex;
    flex-direction:column;
    padding:1vw;
    top:0;
    left:0;
    background: ${props => props.background || props.theme.dialogContent.background || 'white'};
`;

const Empty = styled.div`
    padding: 1vh 1vw;
`

// Apps that are connected through an image button instead of a text button
const CONNECT_IMAGES = {
    strava: 'images/btn_strava_connectwith_orange.svg'
}

const renderApp = (app) => {
    if (app.key === 'komoot')
        return <KomootSettings />

    return <OAuthAppSettings appKey={app.key} name={app.name} connectImage={CONNECT_IMAGES[app.key]} />
}

export const AppsSettings = ( ) => {
    const service = useAppsService()
    const logger = useRef(new EventLogger('AppsSettings')).current

    const [apps, setApps] = useState(null)
    const [expandedKey, setExpandedKey] = useState(null)

    // keeps the connection status of the entries up to date, whenever an app was (dis)connected
    const refresh = useCallback( ()=>{
        setApps( service.openSettings() )
    },[service])

    useEffect( ()=>{
        refresh()
        service.on('connected', refresh)
        service.on('disconnected', refresh)

        return ()=>{
            service.off('connected', refresh)
            service.off('disconnected', refresh)
        }
    },[service, refresh])

    const onToggle = (key) => {
        const expanded = expandedKey!==key
        logger.logEvent({message:'app toggled', app:key, expanded, eventSource:'user'})
        setExpandedKey( expanded ? key : null)
    }

    if (!apps)
        return null

    return <AppsSettingsView apps={apps} expandedKey={expandedKey} onToggle={onToggle} renderApp={renderApp}/>
}

/**
 * List of all apps (same UX as in the mobile app): every entry shows the name and the connection status
 * and expands to the settings of the app. Only one entry is expanded at a time.
 */
export const AppsSettingsView = ({apps, expandedKey, onToggle, renderApp}) => {

    return (
        <AppThemeProvider>
            <ContentArea>
                { apps?.length ?
                    apps.map( (app) =>
                        <AppsItem key={app.key} name={app.name} isConnected={app.isConnected}
                            expanded={expandedKey===app.key}
                            onClick={()=>onToggle?.(app.key)}>
                            {renderApp?.(app)}
                        </AppsItem>
                    ) :
                    <Empty>No Apps available</Empty>
                }
            </ContentArea>
        </AppThemeProvider>
    )
}
