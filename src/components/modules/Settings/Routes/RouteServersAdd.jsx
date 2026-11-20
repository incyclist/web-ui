import React from 'react'
import styled from 'styled-components'
import { Button, EditText } from '../../../atoms'

const Title = styled.div`
    font-size: 2.6vh;
    font-weight: 500;
    padding: 0 1vw 1.5vh 1vw;
`

const Columns = styled.div`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 2vw;
    padding: 0 1vw;
`

const Column = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
`

const Card = styled.div`
    border: 1px solid rgba(128, 128, 128, 0.5);
    border-radius: 4px;
    padding: 1vh 1vw;
`

const ColumnTitle = styled.div`
    font-size: 2vh;
    font-weight: 500;
    padding-bottom: 1vh;
`

const KnownRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1vw;
    padding: 1.2vh 0;
    border-bottom: 1px solid rgba(128, 128, 128, 0.3);
    &:last-child { border-bottom: none; }
`

const KnownInfo = styled.div`
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    font-size: 1.7vh;
`

const KnownName = styled.span`
    font-size: 2vh;
    font-weight: 500;
`

const Muted = styled.span`
    opacity: 0.75;
`

const KnownState = styled.div`
    flex: none;
    max-width: 14vw;
    text-align: right;
    font-size: 1.7vh;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`

const Note = styled.div`
    font-size: 1.5vh;
    opacity: 0.75;
    padding: 1vh 0;
`

const FieldWrapper = styled.div`
    display: flex;
    flex-direction: column;
    padding-top: 0.5vh;

    label {
        font-size: 1.7vh;
        padding-bottom: 0.4vh;
    }
    input {
        width: 100%;
        box-sizing: border-box;
        font-size: 2vh;
        padding: 0.6vh 0.5vw;
        border: 1px solid ${props => props.$error ? '#ff4d4d' : 'rgba(128, 128, 128, 0.7)'};
        border-radius: 3px;
    }
`

const FieldError = styled.div`
    color: #ff7b7b;
    font-size: 1.6vh;
    padding-bottom: 0.5vh;
`

const InfoText = styled.div`
    font-size: 1.6vh;
    padding: 0.4vh 0;
`

const Success = styled.div`
    font-size: 1.8vh;
    font-weight: 500;
    padding: 0.6vh 0;
`

const Actions = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-top: 1vh;
`

const BackBar = styled.div`
    display: flex;
    flex-direction: row;
    padding-top: 1.5vh;
`

const KnownEntry = ({ entry, onAdd, onRetry }) => {
    const { name, description, operator, state, routeCount, error } = entry
    let status = null

    if (state === 'available')
        status = <Button text='Add' size='small' onClick={() => onAdd?.(entry.id)} />
    else if (state === 'checking')
        status = <span role='status'>Checking…</span>
    else if (state === 'added')
        status = <span>{routeCount ? `Added ✓ · ${routeCount} ${routeCount === 1 ? 'route' : 'routes'}` : 'Added ✓'}</span>
    else if (state === 'error')
        status = <>
            <span role='alert' style={{ color: '#ff7b7b' }}>{error}</span>
            <Button text='Try again' size='small' onClick={() => onRetry?.(entry.id)} />
        </>

    return <KnownRow data-testid={`known-${entry.id}`}>
        <KnownInfo>
            <KnownName>{name}</KnownName>
            <span>{description}</span>
            {operator ? <Muted>by {operator}</Muted> : null}
        </KnownInfo>
        <KnownState>{status}</KnownState>
    </KnownRow>
}

const ManualEntry = ({ manual, trustNote, actions }) => {
    const { url, name, state, urlError, nameError, message, resolvedUrl, localNote, canSubmit } = manual
    const busy = state === 'checking' || state === 'success'
    const checked = state === 'checked'
    const confirmEmpty = state === 'confirm-empty'
    const readOnly = busy || checked || confirmEmpty

    // the fields report their value when the user stops typing or leaves the field. Unchanged values must not be
    // reported: a name that was only tabbed through would otherwise count as typed by the user
    const onUrl = (value) => { if ((value ?? '') !== url) actions.setManualUrl(value) }
    const onName = (value) => { if ((value ?? '') !== name) actions.setManualName(value) }

    const onKeyDown = (e) => {
        if (e.key !== 'Enter' || readOnly || !canSubmit)
            return
        actions.checkAndAdd()
    }

    let primary
    if (state === 'checking')
        primary = <Button text='Checking…' primary={true} disabled={true} />
    else if (checked)
        primary = <Button text='Add' primary={true} disabled={!canSubmit} onClick={() => actions.add()} />
    else
        primary = <Button text='Check and add' primary={true} disabled={!canSubmit || busy || confirmEmpty} onClick={() => actions.checkAndAdd()} />

    return <Card onKeyDown={onKeyDown}>
        <ColumnTitle>Or enter an address</ColumnTitle>

        <FieldWrapper $error={!!urlError}>
            <EditText name='route-server-address' label='Address' labelPosition='before' value={url}
                disabled={readOnly} timeout={400} onTimeout={onUrl} onValueChange={onUrl}
                style={{ flexDirection: 'column', alignItems: 'stretch' }} />
        </FieldWrapper>
        {urlError ? <FieldError role='alert'>{urlError}</FieldError> : null}
        {resolvedUrl && resolvedUrl !== url ? <InfoText>Address: {resolvedUrl}</InfoText> : null}
        {localNote ? <InfoText>{localNote}</InfoText> : null}

        <FieldWrapper $error={!!nameError}>
            <EditText name='route-server-name' label='Name (shown in your route list) *' labelPosition='before' value={name}
                disabled={busy || confirmEmpty} timeout={400} onTimeout={onName} onValueChange={onName}
                style={{ flexDirection: 'column', alignItems: 'stretch' }} />
        </FieldWrapper>
        {nameError ? <FieldError role='alert'>{nameError}</FieldError> : null}

        <Note>{trustNote}</Note>

        {message ? <Success role='status'>{state === 'confirm-empty' ? message : `✓ ${message}`}</Success> : null}

        <Actions>
            {confirmEmpty ?
                <>
                    <Button text='Add anyway' primary={true} onClick={() => actions.confirmAddEmpty()} />
                    <Button text='Cancel' onClick={() => actions.setManualUrl(url)} />
                </> : primary}
        </Actions>
    </Card>
}

/**
 * Add view of the route servers: the list of known servers (hidden if there are none) next to the form to enter
 * an address. The page service decides about states and texts, the view only lays them out.
 */
export const RouteServersAdd = ({ known = [], knownNote, manual, trustNote, actions = {} }) => {
    return <>
        <Title>Add a route server</Title>
        <Columns>
            {known.length > 0 ?
                <Column>
                    <Card>
                        <ColumnTitle>Known servers</ColumnTitle>
                        {known.map(entry => <KnownEntry key={entry.id} entry={entry} onAdd={actions.addKnown} onRetry={actions.retryKnown} />)}
                    </Card>
                    {knownNote ? <Note>{knownNote}</Note> : null}
                </Column> : null}
            <Column>
                <ManualEntry manual={manual} trustNote={trustNote} actions={actions} />
            </Column>
        </Columns>
        <BackBar>
            <Button text='Back' onClick={() => actions.back?.()} />
        </BackBar>
    </>
}
