import React, { useEffect, useRef, useState } from 'react';
import MainPage from '../../components/molecules/MainPage';
import {PageTitle} from '../../components/atoms/Title';
import styled, { css } from 'styled-components';
import { PairingHelperPanel, PairingStatusLine, SearchingDevice, SelectedDevice } from '../../components/modules/PairingInfo';
import {InterfaceInfo}  from '../../components/modules/PairingInfo/InterfaceSettings/interface-info';
import { Button } from '../../components/atoms/Buttons/Button';
import { getStatusLinkHandler, isHelperShown } from './utils';

// the helper panel's width: about a third of the page, never narrower than its text needs
const PANEL_WIDTH = 'max(320px, 28vw)'

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

// while the helper is open the row only has the space left of the panel: the tiles start right
// of the row label and share the rest, instead of keeping their fixed width
const compactRow = css`
    box-sizing: border-box;
    padding-left: 11.5vw;
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

// Purely a renderer of the page service's display props: tile order/role, row labels, status, helper
// and button layout all come from the props - nothing is derived here beyond what depends on the
// page's own size (the resize listener and the narrower layout while the helper panel is shown).
// Tile, interface, link and helper clicks call each item's own bound handler (the service already
// logs them), the same way a selected tile's onUnselect/onUse come straight from its own props.
export const PairingScreen = ( {capabilities,interfaces,connectRetry,status, buttons, helper}) => {

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
    const helperShown = isHelperShown(helper)
    const onStatusLink = getStatusLinkHandler(status, helper)

    const onResize = () =>  {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)

    }

    const renderTile = (c,idx) => {
        return c.deviceName ?
            <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit} disabled={c.disabled}
                footer={c.emptyFooter} footerText={c.footerText?.full} stateText={c.stateText} roleLabel={c.roleLabel} trainerRole={c.trainerRole} awaited={c.awaited} compact={helperShown}
                onClick={c.onClick} onUnselect={c.onUnselect} onUse={c.onUse} /> :
            <SearchingDevice key={idx} title={c.title} capability={c.capability} awaited={c.awaited} helpText={c.helpText?.full} footer={c.footerText?.full ?? c.emptyFooter} compact={helperShown} onClick={c.onClick} />
    }

    return (
        <MainPage className='main'>
            <PageTitle>Devices</PageTitle>
            <Body>
                <Main>
                    <PairingStatusLine status={status} onLinkClick={onStatusLink} />
                    <TopRow className='top' $compact={helperShown}>
                        <RowLabel>
                            <div>{rowLabels?.top?.text}</div>
                            {rowLabels?.top?.subtext ? <div>{rowLabels.top.subtext}</div> : null}
                        </RowLabel>
                        {top.map(renderTile)}
                    </TopRow>
                    <BottomRow className='bottom' $compact={helperShown}>
                        <RowLabel>
                            <div>{rowLabels?.bottom?.text}</div>
                            {rowLabels?.bottom?.subtext ? <div>{rowLabels.bottom.subtext}</div> : null}
                        </RowLabel>
                        {bottom.map(renderTile)}
                    </BottomRow>
                    {buttons?.length ?
                        <Buttons>
                            {buttons.map( (b,idx)=> <Button key={idx} height={'6vh'} width={'auto'} minWidth={'8vw'} padding={'0 1.5vw'} primary={b.primary} text={b.label} onClick={b.onClick} />)}
                        </Buttons>
                    : null}
                </Main>
                {helperShown ?
                    <HelperSlot>
                        <PairingHelperPanel helper={helper} />
                    </HelperSlot>
                : null}
            </Body>
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
