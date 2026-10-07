import React, { useEffect, useRef, useState } from 'react';
import MainPage from '../../components/molecules/MainPage';
import {PageTitle} from '../../components/atoms/Title';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { SearchingDevice, SelectedDevice } from '../../components/modules/PairingInfo';
import {InterfaceInfo}  from '../../components/modules/PairingInfo/InterfaceSettings/interface-info';
import { Button } from '../../components/atoms/Buttons/Button';
import { useAppState, getCapabilityHelpText, getEmptyTileFooterText, getPairingGuidanceText, getPairingRowLabelId, getPairingStatusDisplay, toPairingInterfaceStates } from 'incyclist-services';

const StatusLine = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 2vh;
    color: white;
    text-align: center;
    margin-top: 1vh;
`

const StatusDot = styled.span`
    display: inline-block;
    width: 1.2vh;
    height: 1.2vh;
    border-radius: 50%;
    margin-right: 0.8vw;
    background: ${props => props.$color};
`

const statusDotColors = { red: '#e74c3c', green: '#2ecc71', amber: '#f5a623' }

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

export const PairingScreen = ( {onOK,onSkip,onSimulate, onCapabilityClick,onCapabilityUnselect,onInterfaceClick,capabilities,interfaces,connectRetry, readyToStart,initialized,rideMode=false,showSimulate=false, title, labelOK, labelSkip}) => {

    const ref = useRef(null);
    const logger = new EventLogger('PairingPage') 

    const [,setWidth] = useState()
    const [,setHeight] = useState()
    const appState = useAppState()

    const top = []
    const bottom = []

    useEffect(() => {
        const div = ref.current;
        if (div) {
            window.addEventListener("resize", onResize);
        }
        onResize()
    })

    const TILES = [
        { title:'Resistance', key:'control',    row:'top',    role:'required' },
        { title:'Power',      key:'power',      row:'top',    role:'required' },
        { title:'Speed',      key:'speed',      row:'top',    role:'required' },
        { title:'Heartrate',  key:'heartrate',  row:'bottom', role:'optional' },
        { title:'Cadence',    key:'cadence',    row:'bottom', role:'optional' },
        { title:'Controller', key:'app_control', row:'bottom', role:'optional' },
    ]

    const status = getPairingStatusDisplay({
        platform: 'desktop',
        interfaces: toPairingInterfaceStates(interfaces ?? []),
        capabilities: capabilities ?? [],
        canStartRide: readyToStart,
        loading: !initialized,
        rideMode,
    })
    const noSearch = status.id === 'S1'

    const initCapability = ( target, tile)=> {
        const info = capabilities?.find( c=> c.capability.toLowerCase()===tile.key)
        const props = {
            title: tile.title,
            capability: tile.key,
            waiting: tile.role==='required' && !readyToStart && !noSearch,
            helpText: getCapabilityHelpText(tile.key, 'full'),
            emptyFooter: noSearch ? 'Not searching' : getEmptyTileFooterText(tile.role),
        }
        target.push( info ? {...info, ...props} : props)
    }

    const initCapabilites = () => {
        TILES.filter( t=>t.row==='top').forEach( t=>initCapability(top,t))
        TILES.filter( t=>t.row==='bottom').forEach( t=>initCapability(bottom,t))
    }

    const trainerSelected = Boolean(capabilities?.find( c=>c.capability.toLowerCase()==='control')?.deviceName)
    const topLabel = getPairingGuidanceText(getPairingRowLabelId(trainerSelected))
    const bottomLabel = getPairingGuidanceText('row-optional')

    const onCapabilityClicked = (capability) =>{
        logger.logEvent( {message:'capability clicked',capability, eventSource:'user'})

        if (onCapabilityClick)
            onCapabilityClick(capability)

    }

    const onUnselect = (capability) => {
        logger.logEvent( {message:'capability unselect clicked',capability, eventSource:'user'})
        if (onCapabilityUnselect)
            onCapabilityUnselect(capability)


    }

    const onOKClicked = ()=>{
        if (onOK)
            onOK()
    }

    const onSkipClicked = ()=>{
        if (onSkip)
            onSkip()
    }

    const onSimulateClicked = ()=>{
        if (onSimulate)
            onSimulate()
    }

    const onInterfaceClicked = (name)=>{
        logger.logEvent( {message:'interface clicked',interface:name, eventSource:'user'})

        if (onInterfaceClick)
            onInterfaceClick(name)
    }

    const onResize = () =>  {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
        
    }

    const showButtons = (readyToStart) => { 
        if (readyToStart) {
            const ok  = labelOK ?? 'OK'
            return (
            <Buttons>
                <Button height={'6vh'} width={'8vw'} primary={true} text={ok} onClick={onOKClicked} />                
            </Buttons>
        )}

        const skip  = labelSkip ?? 'Skip'
        const isSkipPrimary = showSimulate ? false : true
        return (
            <Buttons>
                {showSimulate ? <Button height={'6vh'} width={'8vw'} primary={true} text='Simulate' onClick={onSimulateClicked} /> : null}
                <Button height={'6vh'} width={'8vw'} primary={isSkipPrimary} text={skip} onClick={onSkipClicked} />
            </Buttons>
        )

    }

    initCapabilites()

    return (
        <MainPage className='main'>
            <PageTitle>{title??'Paired Devices'}</PageTitle>
            <StatusLine>
                <StatusDot $color={statusDotColors[status.dot]} />
                <span>{status.text}</span>
            </StatusLine>
            <TopRow className='top'>
                <RowLabel>
                    <div>{topLabel.text}</div>
                    {topLabel.subtext ? <div>{topLabel.subtext}</div> : null}
                </RowLabel>
                {top.map( (c,idx) => c.deviceName?
                    <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit}  onClick={ onCapabilityClicked } onUnselect={onUnselect} /> :
                    <SearchingDevice key={idx} title={c.title} capability={c.capability} waiting={c.waiting} helpText={c.helpText} footer={c.emptyFooter}  onClick={ onCapabilityClicked } />
                    )}
            </TopRow>
            <BottomRow className='bottom'>
                <RowLabel>
                    <div>{bottomLabel.text}</div>
                    {bottomLabel.subtext ? <div>{bottomLabel.subtext}</div> : null}
                </RowLabel>
                {bottom.map( (c,idx) => c.deviceName?
                    <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit}  onClick={ onCapabilityClicked } onUnselect={onUnselect} /> :
                    <SearchingDevice key={idx} title={c.title} capability={c.capability} waiting={c.waiting} helpText={c.helpText} footer={c.emptyFooter}  onClick={ onCapabilityClicked } />
                        )}
            </BottomRow>
            {showButtons(readyToStart)}
            {interfaces?
                <Interfaces>
                    { interfaces.map( (info,idx)=> 
                        <InterfaceInfo 
                            name={info.name} connectRetry={connectRetry} isScanning={info.isScanning} enabled={info.enabled} protocol={info.protocol} ifState={info.state} key={idx} size='5vh' 
                                        onClick={()=>onInterfaceClicked(info.name)}
                                    />
                                )}
                </Interfaces>
                :null}

        </MainPage>    
    )

}

