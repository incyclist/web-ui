import React, { useEffect, useState } from 'react'
import { useLocalLink } from 'incyclist-services'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import * as copy from './copy'

/** Pure view of the one-off notice shown after an update (Windows), next to the OS firewall question. */
export const FirewallUpdateNoticeView = ({ onOK }) =>
    <MessageBox id='FirewallUpdateNotice' title={copy.FIREWALL_UPDATE_TITLE} text={copy.FIREWALL_UPDATE_TEXT}
        yes='OK' defaultButton='OK' noNo center height='30vh' width='40vw' onYes={onOK} onNo={onOK} />

/** Shows the notice while the link service asks for it; OK dismisses it for good. */
export const FirewallUpdateNotice = () => {
    const service = useLocalLink()
    const [show, setShow] = useState(() => service.getDisplayProps()?.showUpdateFirewallNotice === true)

    useEffect(() => {
        const onUpdate = (props) => setShow((props ?? service.getDisplayProps())?.showUpdateFirewallNotice === true)
        service.on('state-changed', onUpdate)
        onUpdate()
        return () => { service.off('state-changed', onUpdate) }
    }, [service])

    if (!show)
        return null

    return <FirewallUpdateNoticeView onOK={() => service.dismissFirewallNotice()} />
}
