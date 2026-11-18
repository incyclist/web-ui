import React, { useCallback, useEffect, useMemo, useState } from "react"
import { getSupportSettingsDialogService } from "incyclist-services"
import { SupportAreaView } from "./component"
import { hasFeature, api } from "../../../../utils/electron/integration"

const openExternal = async (url) => {
    if (hasFeature('shell.openExternal'))
        await api.shell.openExternal(url)
    else
        window.open(url, '_blank', 'noopener,noreferrer')
}

const writeToClipboard = async (text) => {
    await navigator.clipboard.writeText(text)
}

export const SupportArea = () => {

    const service = useMemo(() => getSupportSettingsDialogService(), [])
    const props = useMemo(() => service.getDialogDisplayProps(), [service])

    const [copied, setCopied] = useState(false)
    const [uuidCopied, setUuidCopied] = useState(false)

    useEffect(() => {
        service.openDialog()
        return () => { service.closeDialog() }
    }, [service])

    const onOpenLink = useCallback(async (id, url) => {
        service.onLinkClicked(id)
        try {
            await openExternal(url)
        }
        catch { /* nothing to recover: the link is visible and can be opened manually */ }
    }, [service])

    const onOpenOtherLink = useCallback((link) => onOpenLink(link.id, link.url), [onOpenLink])

    const onDonate = useCallback(async (id, url) => {
        service.onDonationClicked(id)
        try {
            await openExternal(url)
        }
        catch { /* the URL is not recoverable by the app */ }
    }, [service])

    const copyDetails = useCallback(async (email, trigger) => {
        try {
            await writeToClipboard(email.copyText)
            setCopied(true)
            service.onDetailsCopied(trigger, 'success')
        }
        catch {
            setCopied(false)
            service.onDetailsCopied(trigger, 'failed')
        }
    }, [service])

    const onCopyDetails = useCallback((email) => copyDetails(email, 'button'), [copyDetails])

    const onOpenEmail = useCallback(async (link) => {
        service.onLinkClicked(link.id)
        try {
            await openExternal(link.url)
            service.onEmailOpenResult('opened')
        }
        catch (err) {
            service.onEmailOpenResult('failed', err?.message ?? String(err))
            await copyDetails(link.email, 'fallback')
        }
    }, [service, copyDetails])

    const onCopyUuid = useCallback(async () => {
        try {
            await writeToClipboard(props.appInfo.uuid)
            setUuidCopied(true)
        }
        catch { /* clipboard not available */ }
    }, [props])

    return <SupportAreaView
        {...props}
        copied={copied}
        uuidCopied={uuidCopied}
        onOpenLink={onOpenLink}
        onOpenOtherLink={onOpenOtherLink}
        onOpenEmail={onOpenEmail}
        onCopyDetails={onCopyDetails}
        onCopyUuid={onCopyUuid}
        onDonate={onDonate}
    />
}
