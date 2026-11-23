import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { AlertIcon, DeviceDesktopIcon, InfoIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../theme'
import { Button, CheckBox, EditText, LinkButton } from '../../../atoms'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import { ConnectWindow } from './ConnectWindow'
import { Panel, PanelHeader, Row, Dot, Identity, SubLine, StatusText, RemoveArea, BodyLine, ListLabel, GREEN, GREY } from '../Routes/Panel'
import * as copy from './copy'
import { clipName, formatDay, formatLastUsed, logError } from './utils'

const TITLE_ID = 'route-sharing-title'

const Text = styled.div`
    font-size: 1.8vh;
    padding: 0.5vh 1vw;
`
const NameRow = styled(Row)`
    flex-wrap: wrap;
    gap: 0.6vw;
`
const EditorLabelRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    font-size: 2vh;
    & > div { padding-bottom: 0; }
`
const Counter = styled.span`
    font-size: 1.6vh;
    opacity: 0.7;
    padding-left: 0.6vw;
`
const Help = styled.details`
    padding: 1vh 1vw;
    font-size: 1.8vh;
    & > summary { cursor: pointer; opacity: 0.8; padding: 0.5vh 0; }
    & li { padding: 0.3vh 0; }
`

const NameEditor = ({ computerName, onSave }) => {
    const [length, setLength] = useState(computerName?.length ?? 0)

    const checkInput = (value) => {
        try {
            const clipped = clipName(value)
            setLength(clipped.length)
            return clipped
        }
        catch (err) {
            logError('RouteSharingSettingsView', 'checkInput', err)
            return value
        }
    }

    // Enter saves like leaving the field does
    const onKeyDown = (e) => {
        try {
            if (e.key === 'Enter' && e.target?.tagName === 'INPUT')
                e.target.blur()
        }
        catch (err) {
            logError('RouteSharingSettingsView', 'onKeyDown', err)
        }
    }

    return <div onKeyDown={onKeyDown}>
        <Row>
            <EditorLabelRow>
                <EditText label={copy.NAME_LABEL} labelPosition='before' value={computerName} maxLength={copy.NAME_MAX_LENGTH}
                    autoFocus={true} checkInput={checkInput} onValueChange={onSave} />
                <Counter>{`${length}/${copy.NAME_MAX_LENGTH}`}</Counter>
            </EditorLabelRow>
        </Row>
        <BodyLine>
            <AlertIcon size={16} aria-hidden='true' />
            <span>{copy.NAME_WARNING}</span>
        </BodyLine>
    </div>
}

/**
 * "Everyone on the same network will see this computer as <Name>. Change". The editor and its full warning appear
 * only after Change; saving (Enter or leaving the field) closes it again and returns the focus to Change.
 */
const NameSection = ({ computerName, connected, showChangedNote, onNameChange }) => {
    const [editing, setEditing] = useState(false)
    const wasEditing = useRef(false)
    const lineRef = useRef(null)

    useEffect(() => {
        try {
            if (wasEditing.current && !editing)
                lineRef.current?.querySelector('button')?.focus()
            wasEditing.current = editing
        }
        catch (err) {
            logError('RouteSharingSettingsView', 'restoreFocus', err)
        }
    }, [editing])

    const save = (name) => {
        try {
            setEditing(false)
            onNameChange?.(name)
        }
        catch (err) {
            logError('RouteSharingSettingsView', 'save', err)
        }
    }

    return <>
        {editing ?
            <NameEditor computerName={computerName} onSave={save} /> :
            <BodyLine ref={lineRef}>
                <span>{copy.nameLine(computerName, connected)}</span>
                <LinkButton label={copy.CHANGE_LABEL} onClick={() => setEditing(true)} />
            </BodyLine>
        }
        {showChangedNote ? <BodyLine role='status'>{copy.NAME_CHANGED_NOTE}</BodyLine> : null}
    </>
}

const FirewallLine = ({ platform }) => {
    const text = copy.FIREWALL_LINE[platform]
    if (!text)
        return null
    return <BodyLine>
        <InfoIcon size={16} aria-hidden='true' />
        <span>{text}</span>
    </BodyLine>
}

const HelpSection = ({ platform }) => <Help>
    <summary>{copy.HELP_TITLE}</summary>
    <ul>{copy.helpItems(platform).map(item => <li key={item}>{item}</li>)}</ul>
</Help>

const DeviceRow = ({ device, onRemove }) => {
    const status = device.active ? 'Active now' : (device.lastSeenAt ? formatLastUsed(device.lastSeenAt) : '')

    return <Row data-testid={`device-${device.id}`}>
        <Dot role='img' aria-label={status || 'Not active'} $color={device.active ? GREEN : GREY} />
        <Identity>
            <span>{device.name}</span>
            <SubLine>{`Connected ${formatDay(device.connectedAt)}`}</SubLine>
        </Identity>
        <StatusText>{status}</StatusText>
        <RemoveArea>
            <LinkButton label={copy.REMOVE_LABEL} ariaLabel={`Remove ${device.name}`} onClick={() => onRemove?.(device.id)} />
        </RemoveArea>
    </Row>
}

// one row: switch, what it means right now, and the status
const SwitchRow = ({ state, routeCount, onChange }) => {
    const on = state !== 'off'
    return <Row>
        <Identity>
            <CheckBox label={copy.SWITCH_LABEL} value={on} onValueChange={onChange} />
            <SubLine>{on ? copy.SWITCH_NOTE_ON : copy.SWITCH_NOTE_OFF}</SubLine>
        </Identity>
        <StatusText role='status'>{on ? copy.statusOn(routeCount) : copy.STATUS_OFF}</StatusText>
    </Row>
}

const StartErrorRow = ({ onRetry }) => <Row role='alert'>
    <AlertIcon size={20} aria-hidden='true' />
    <Identity>{copy.START_ERROR}</Identity>
    <Button text={copy.TRY_AGAIN} secondary={true} onClick={onRetry} />
</Row>

const RemoveDialog = ({ device, isLast, onConfirm, onCancel }) => {
    if (!device)
        return null
    return <MessageBox id='RemoveLinkDevice' title={copy.removeTitle(device.name)} yes='Remove' no='Cancel' defaultButton='Cancel'
        height='24vh' width='40vw' onYes={onConfirm} onNo={onCancel}>
        <Text>{copy.removeText(device.name, isLast)}</Text>
    </MessageBox>
}

/**
 * Pure view of the "Route Sharing" panel of the Routes tab: renders the display props of the link service.
 *
 * `actions`: connect, setEnabled(on), setName(name), requestRemove(id), confirmRemove, cancelRemove, retry,
 * denyPairing, closePairing. `removeTarget` is the device awaiting confirmation, `nameChanged` shows the rename note.
 */
export const RouteSharingSettingsView = ({
    state, computerName, suffix, platform, routeCount = 0, devices = [], connectWindow, removeTarget, nameChanged, actions = {}
}) => {
    const neverConnected = state === 'never-connected'
    const failed = state === 'error'
    const showError = failed && !connectWindow
    const hasDevices = devices.length > 0

    const connectLabel = neverConnected || !hasDevices ? copy.CONNECT_BUTTON : copy.CONNECT_ANOTHER_BUTTON

    return <AppThemeProvider>
        <Panel titleId={TITLE_ID}>
            <PanelHeader id={TITLE_ID} icon={<DeviceDesktopIcon size={24} />} title={copy.PANEL_TITLE} description={copy.PANEL_DESCRIPTION}
                action={<Button text={connectLabel} secondary={true} onClick={() => actions.connect?.()} />} />

            {showError ? <StartErrorRow onRetry={actions.retry} /> : null}
            {neverConnected && !showError ? <>
                <BodyLine>{copy.REASSURANCE}</BodyLine>
                <FirewallLine platform={platform} />
            </> : null}
            {!neverConnected && !failed ? <SwitchRow state={state} routeCount={routeCount} onChange={(on) => actions.setEnabled?.(on)} /> : null}

            {hasDevices ? <>
                <ListLabel>{copy.DEVICES_TITLE}</ListLabel>
                {devices.map(device => <DeviceRow key={device.id} device={device} onRemove={actions.requestRemove} />)}
            </> : null}

            <NameSection computerName={computerName} connected={!neverConnected} showChangedNote={nameChanged && hasDevices}
                onNameChange={actions.setName} />

            <HelpSection platform={platform} />

            <RemoveDialog device={removeTarget} isLast={devices.length === 1}
                onConfirm={actions.confirmRemove} onCancel={actions.cancelRemove} />
            <ConnectWindow connectWindow={connectWindow} computerName={computerName} suffix={suffix} platform={platform}
                onDeny={actions.denyPairing} onClose={actions.closePairing} onRetry={actions.connect} />
        </Panel>
    </AppThemeProvider>
}
