import React, { useEffect, useRef, useState } from 'react';
import MainPage from '../../components/molecules/MainPage';
import {PageTitle} from '../../components/atoms/Title';
import styled, { css } from 'styled-components';
import { ConflictStepDialog, PairingHelperPanel, PairingStatusLine, SearchingDevice, SelectedDevice } from '../../components/modules/PairingInfo';
import {InterfaceInfo}  from '../../components/modules/PairingInfo/InterfaceSettings/interface-info';
import { Button } from '../../components/atoms/Buttons/Button';
import { getStatusLinkHandler, isHelperShown } from './utils';

// the helper panel's width: about a third of the page, never narrower than its text needs
const PANEL_WIDTH = 'max(280px, 28vw)'

// a conflict found by the search can pop up while the rider is about to click something else: its
// buttons ignore clicks for this long after it appears (Esc and a click outside never wait)
const CONFLICT_ARM_DELAY = 500

// while the helper is closed, the label is a column left of the row's tiles
const RowLabel = styled.div`
    position: absolute;
    left: 0.5vw;
    top: 0;
    bottom: 0;
    width: 10vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: right;
    color: white;
    pointer-events: none;
    >div:first-child {
        font-size: 2.2vh;
        font-weight: bold;
    }
    >div:last-child {
        font-size: 1.8vh;
    }
`

// while the helper is open, the label is one line above the tiles, inside the row's top padding.
// The bold part is never cut; only the sub-label gives way (with an ellipsis) if the line is too long
const CompactRowLabel = styled.div`
    position: absolute;
    top: 1vh;
    left: 1vw;
    right: 1vw;
    display: flex;
    flex-direction: row;
    align-items: baseline;
    white-space: nowrap;
    overflow: hidden;
    color: white;
    font-size: max(12px, 1.8vh);
    pointer-events: none;
`

const CompactRowLabelText = styled.span`
    flex-shrink: 0;
    font-weight: bold;
`

const CompactRowLabelSubtext = styled.span`
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-left: 0.5vw;
`

const renderRowLabel = (label, compact) => {
    if (compact) {
        return (
            <CompactRowLabel>
                <CompactRowLabelText>{label?.text}</CompactRowLabelText>
                {label?.subtext ? <CompactRowLabelSubtext>{label.subtext}</CompactRowLabelSubtext> : null}
            </CompactRowLabel>
        )
    }
    return (
        <RowLabel>
            <div>{label?.text}</div>
            {label?.subtext ? <div>{label.subtext}</div> : null}
        </RowLabel>
    )
}

// while the helper is open the row only has the space left of the panel: the label moves above
// the tiles, and the tiles share the row's width instead of keeping their fixed width
const compactRow = css`
    box-sizing: border-box;
    padding-left: 1vw;
    padding-right: 1vw;
    >* {
        margin-right: 1.5vw;
    }
`

const BottomRow = styled.div`
    min-height: 26vh;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding-top: 6vh;
    padding-bottom: 4vh;
    >* {
        margin-right: 5vw;
    }
    ${props => props.$compact ? compactRow : ''}
    ${props => props.$compact ? 'min-height: 22vh; padding-top: 4vh; padding-bottom: 3vh;' : ''}
`

const TopRow = styled.div`
    min-height: 26vh;
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding-top: 7vh;
    padding-bottom: 4vh;
    >* {
        margin-right: 4vw;
    }
    ${props => props.$compact ? compactRow : ''}
    ${props => props.$compact ? 'min-height: 22vh; padding-top: 5vh; padding-bottom: 3vh;' : ''}
`

// the title stays on top; below it, the status line, rows and buttons share the width with the helper
const Body = styled.div`
    position: relative;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: row;
`

const Main = styled.div`
    position: relative;
    flex: 1;
    min-width: 0;
`

// from under the status line to above the button bar
const HelperSlot = styled.div`
    flex: none;
    width: ${PANEL_WIDTH};
    margin-top: 5vh;
    margin-bottom: 11vh;
`

const Buttons = styled.div`
    position: absolute;
    width:100%;
    height: 10vh;
    bottom: 0px;
    min-height: 10vh;
    max-height: 10vh;
    display: flex;
    flex-direction: row;
    justify-content: center;
`

const Interfaces = styled.div`
    position: absolute;
    bottom:1vh;
    left:1vw;

`

// Purely a renderer of the page service's display props: tile order/role, row labels, status, helper,
// conflict and button layout all come from the props - nothing is derived here beyond what depends on
// the page's own size (the resize listener and the narrower layout while the helper is shown).
// Tile, interface, link, helper and conflict clicks call each item's own bound handler (the service
// already logs them), the same way a selected tile's onUnselect/onUse come straight from its own props.
//
// The panel beside the tiles only ever holds the helper. A conflict found by the search is shown in
// the same modal dialog a pick in the Resistance list uses for its conflicts, whenever the service
// hands one over - the service already holds it back while the helper or a device list is open.
export const PairingScreen = ( {capabilities,interfaces,connectRetry,status, buttons, helper, pendingConflict}) => {

    const ref = useRef(null);

    const [,setWidth] = useState()
    const [,setHeight] = useState()

    useEffect(() => {
        const div = ref.current;
        if (div) {
            window.addEventListener("resize", onResize);
        }
        onResize()
    })

    const top = capabilities?.top ?? []
    const bottom = capabilities?.bottom ?? []
    const rowLabels = capabilities?.rowLabels
    const panelShown = isHelperShown(helper)
    const onStatusLink = getStatusLinkHandler(status, helper)

    const onResize = () =>  {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)

    }

    const renderTile = (c,idx) => {
        return c.deviceName ?
            <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit} disabled={c.disabled} dimmed={c.dimmed}
                footer={c.emptyFooter} footerText={c.footerText?.full} stateText={c.stateText} roleLabel={c.roleLabel} trainerRole={c.trainerRole} awaited={c.awaited} compact={panelShown}
                onClick={c.onClick} onUnselect={c.onUnselect} onUse={c.onUse} /> :
            <SearchingDevice key={idx} title={c.title} capability={c.capability} awaited={c.awaited} helpText={c.helpText?.full} footer={c.footerText?.full ?? c.emptyFooter} compact={panelShown} onClick={c.onClick} />
    }

    return (
        <MainPage className='main'>
            <PageTitle>Devices</PageTitle>
            <Body>
                <Main>
                    <PairingStatusLine status={status} onLinkClick={onStatusLink} />
                    <TopRow className='top' $compact={panelShown}>
                        {renderRowLabel(rowLabels?.top, panelShown)}
                        {top.map(renderTile)}
                    </TopRow>
                    <BottomRow className='bottom' $compact={panelShown}>
                        {renderRowLabel(rowLabels?.bottom, panelShown)}
                        {bottom.map(renderTile)}
                    </BottomRow>
                    {buttons?.length ?
                        <Buttons>
                            {buttons.map( (b,idx)=> <Button key={idx} height={'6vh'} width={'auto'} minWidth={'8vw'} padding={'0 1.5vw'} primary={b.primary} text={b.label} onClick={b.onClick} />)}
                        </Buttons>
                    : null}
                </Main>
                {panelShown ?
                    <HelperSlot>
                        <PairingHelperPanel helper={helper} />
                    </HelperSlot>
                : null}
            </Body>
            {pendingConflict ?
                <ConflictStepDialog id='PairingConflict' conflict={pendingConflict} armDelay={CONFLICT_ARM_DELAY} />
            : null}
            {interfaces?.length ?
                <Interfaces>
                    { interfaces.map( (info,idx)=>
                        <InterfaceInfo
                            name={info.name} connectRetry={connectRetry} isScanning={info.isScanning} enabled={info.enabled} protocol={info.protocol} ifState={info.state} key={idx} size='5vh'
                                        onClick={info.onClick}
                                    />
                                )}
                </Interfaces>
                :null}

        </MainPage>
    )

}
