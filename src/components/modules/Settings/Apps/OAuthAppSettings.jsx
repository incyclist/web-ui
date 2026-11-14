import React, { useRef, useState } from 'react'
import { EventLogger } from 'gd-eventlog'
import { useAppsService } from 'incyclist-services'
import { hasFeature } from '../../../../utils/electron/integration'
import { OAuthBinding } from '../../../../bindings'
import { AppSettingsView } from '../../../molecules/Apps/AppSettingsView'

/**
 * Settings of an app that is connected through the OAuth flow of the auth-server (Strava, Intervals.icu, ...)
 */
export const OAuthAppSettings = ({ appKey, name, connectImage }) => {

    const logger = useRef(new EventLogger('OAuthAppSettings')).current
    const service = useAppsService()

    const [connecting, setConnecting] = useState(false)
    const [settings, setSettings] = useState(() => service.openAppSettings(appKey))

    const onConnect = async () => {
        if (!hasFeature('oauth'))
            return

        try {
            logger.logEvent({ message: 'connect', app: appKey })
            setConnecting(true)

            const res = await OAuthBinding.getInstance().authorize(appKey)

            if (res.success) {
                logger.logEvent({ message: 'connect success', app: appKey })
                await service.connect(appKey, res.user?.auth?.[appKey])
                setSettings(current => ({ ...current, ...service.openAppSettings(appKey) }))
            }
            else {
                logger.logEvent({ message: 'connect failed', app: appKey, reason: res.reason })
            }
        }
        catch (err) {
            logger.logEvent({ message: 'error', fn: 'onConnect', app: appKey, error: err.message, stack: err.stack })
        }
        finally {
            setConnecting(false)
        }
    }

    const onDisconnect = () => {
        service.disconnect(appKey)
        setSettings({ isConnected: false })
    }

    const onOperationsChanged = (operation, enabled) => {
        const operations = service.enableOperation(appKey, operation, enabled, true)
        setSettings(current => ({ ...current, operations }))
    }

    return <AppSettingsView {...settings} name={name} connectImage={connectImage} isConnecting={connecting}
        onConnect={onConnect} onDisconnect={onDisconnect} onOperationsChanged={onOperationsChanged} />
}
