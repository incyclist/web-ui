import React, { useState } from 'react'
import styled from 'styled-components'
import { AppThemeProvider } from '../../../../theme'
import { Button, CheckBox, EditText, LinkButton } from '../../../atoms'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import { ContentArea } from '../Apps/AppsSettings'
import { ConnectWindow } from './ConnectWindow'
import * as copy from './copy'
import { clipName, formatDay, formatLastUsed } from './utils'

const Intro = styled.div`
    font-size: 2vh;
    padding: 0.5vh 1vw 1.5vh 1vw;
`
const PanelTitle = styled.div`
    font-size: 2.6vh;
    font-weight: 500;
    padding: 0 1vw;
`
const PanelDescription = styled.div`
    font-size: 1.8vh;
    opacity: 0.8;
    padding: 0.5vh 1vw 1.5vh 1vw;
`
const Title = styled.div`
    font-size: 2.4vh;
    font-weight: 500;
    padding: 1vh 1vw 0.5vh 1vw;
`
const Text = styled.div`
    font-size: 1.8vh;
    padding: 0.5vh 1vw;
    opacity: ${props => props.$dim ? 0.8 : 1};
`
const Warning = styled(Text)`
    display: flex;
    flex-direction: row;
    gap: 0.5vw;
`
const Note = styled.div`
    margin: 1vh 1vw;
    padding: 1vh 1vw;
    border: 1px solid rgba(128, 128, 128, 0.6);
    border-radius: 4px;
    font-size: 1.8vh;
`
const Row = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1vw;
    padding: 1.2vh 1vw;
    border-bottom: 1px solid rgba(128, 128, 128, 0.4);
    font-size: 2vh;
`
const Grow = styled.div`
    flex: 1;
    min-width: 0;
`
const Center = styled.div`
    display: flex;
    justify-content: center;
    padding: 1vh 0;
`
const Counter = styled.span`
    font-size: 1.6vh;
    opacity: 0.7;
    padding-left: 0.6vw;
`
const Help = styled.details`
    padding: 1vh 1vw;
    font-size: 1.8vh;
    & > summary { cursor: pointer; padding: 0.5vh 0; }
    & li { padding: 0.3vh 0; }
`

const NameField = ({ computerName, showChangedNote, onNameChange }) => {
    const [length, setLength] = useState(computerName?.length ?? 0)

    const checkInput = (value) => {
        const clipped = clipName(value)
        setLength(clipped.length)
        return clipped
    }

    return <>
        <Row>
            <EditText label={copy.NAME_LABEL} labelPosition='before' value={computerName} maxLength={copy.NAME_MAX_LENGTH}
                checkInput={checkInput} onValueChange={onNameChange} />
            <Counter>{`${length}/${copy.NAME_MAX_LENGTH}`}</Counter>
        </Row>
        <Warning><span aria-hidden='true'>⚠</span><span>{copy.NAME_WARNING}</span></Warning>
        {showChangedNote ? <Text $dim role='status'>{copy.NAME_CHANGED_NOTE}</Text> : null}
    </>
}

const FirewallNote = ({ platform }) => {
    const text = copy.FIREWALL_NOTE[platform]
    if (!text)
        return null
    return <Note><strong>{`ⓘ ${copy.FIREWALL_NOTE_TITLE}`}</strong><div>{text}</div></Note>
}

const HelpSection = ({ platform }) => <Help>
    <summary>{copy.HELP_TITLE}</summary>
    <ul>{copy.helpItems(platform).map(item => <li key={item}>{item}</li>)}</ul>
</Help>

const DeviceRow = ({ device, onRemove }) => <Row data-testid={`device-${device.id}`}>
    <Grow>
        <div>{device.name}</div>
        <Text $dim>{[
            `Connected ${formatDay(device.connectedAt)}`,
            device.active ? 'Active now' : (device.lastSeenAt ? formatLastUsed(device.lastSeenAt) : null)
        ].filter(Boolean).join(' · ')}</Text>
    </Grow>
    <LinkButton label={copy.REMOVE_LABEL} ariaLabel={`Remove ${device.name}`} onClick={() => onRemove?.(device.id)} />
</Row>

const StartError = ({ onRetry }) => <Note role='alert'>
    <div>{copy.START_ERROR}</div>
    <Center><Button text={copy.TRY_AGAIN} primary={true} onClick={onRetry} /></Center>
</Note>

const Connected = ({ state, routeCount, devices, actions }) => <>
    <Row>
        <CheckBox label={copy.SWITCH_LABEL} value={state !== 'off'}
            onValueChange={(on) => actions.setEnabled?.(on)} />
    </Row>
    {state === 'error' ? null : <Text role='status'>{state === 'off' ? copy.STATUS_OFF : copy.statusOn(routeCount)}</Text>}
    {state === 'on' ? <Text $dim>{copy.ANY_NETWORK_NOTE}</Text> : null}
    <Title>{copy.DEVICES_TITLE}</Title>
    {devices.map(device => <DeviceRow key={device.id} device={device} onRemove={actions.requestRemove} />)}
    <Center><Button text={copy.CONNECT_ANOTHER_BUTTON} secondary={true} onClick={() => actions.connect?.()} /></Center>
</>

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
    const showError = state === 'error' && !connectWindow

    return <AppThemeProvider>
        <ContentArea>
            <PanelTitle>{copy.PANEL_TITLE}</PanelTitle>
            <PanelDescription>{copy.PANEL_DESCRIPTION}</PanelDescription>
            {neverConnected ? <Intro>{copy.INTRO}</Intro> : null}
            {neverConnected ? null : <Connected state={state} routeCount={routeCount} devices={devices} actions={actions} />}
            {showError ? <StartError onRetry={actions.retry} /> : null}

            <NameField key={computerName} computerName={computerName} showChangedNote={nameChanged && devices.length > 0}
                onNameChange={actions.setName} />

            {neverConnected ? <>
                <FirewallNote platform={platform} />
                <Center><Button text={copy.CONNECT_BUTTON} primary={true} onClick={() => actions.connect?.()} /></Center>
            </> : null}

            <HelpSection platform={platform} />

            <RemoveDialog device={removeTarget} isLast={devices.length === 1}
                onConfirm={actions.confirmRemove} onCancel={actions.cancelRemove} />
            <ConnectWindow connectWindow={connectWindow} computerName={computerName} suffix={suffix} platform={platform}
                onDeny={actions.denyPairing} onClose={actions.closePairing} onRetry={actions.connect} />
        </ContentArea>
    </AppThemeProvider>
}
