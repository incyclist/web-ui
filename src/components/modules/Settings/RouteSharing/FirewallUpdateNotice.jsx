import React, { useEffect, useState } from 'react'
import { useLocalLink } from 'incyclist-services'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import * as copy from './copy'
import { logError } from './utils'

/** Pure view of the one-off notice shown after an update (Windows), next to the OS firewall question. */
export const FirewallUpdateNoticeView = ({ onOK }) =>
    <MessageBox id='FirewallUpdateNotice' title={copy.FIREWALL_UPDATE_TITLE} text={copy.FIREWALL_UPDATE_TEXT}
        yes='OK' defaultButton='OK' noNo center height='30vh' width='40vw' onYes={onOK} onNo={onOK} />

/** Shows the notice while the link service asks for it; OK dismisses it for good. */
export const FirewallUpdateNotice = () => {
    const service = useLocalLink()
    const [show, setShow] = useState(() => {
        try {
            return service.getDisplayProps()?.showUpdateFirewallNotice === true
        }
        catch (err) {
            logError('FirewallUpdateNotice', 'initialState', err)
            return false
        }
    })

    useEffect(() => {
        const onUpdate = (props) => {
            try {
                setShow((props ?? service.getDisplayProps())?.showUpdateFirewallNotice === true)
            }
            catch (err) {
                logError('FirewallUpdateNotice', 'onUpdate', err)
            }
        }

        try {
            service.on('state-changed', onUpdate)
            onUpdate()
        }
        catch (err) {
            logError('FirewallUpdateNotice', 'subscribe', err)
        }
        return () => {
            try {
                service.off('state-changed', onUpdate)
            }
            catch (err) {
                logError('FirewallUpdateNotice', 'unsubscribe', err)
            }
        }
    }, [service])

    const onOK = () => {
        try {
            service.dismissFirewallNotice()
        }
        catch (err) {
            logError('FirewallUpdateNotice', 'onOK', err)
        }
    }

    if (!show)
        return null

    return <FirewallUpdateNoticeView onOK={onOK} />
}
