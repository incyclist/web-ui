import React, { useEffect, useRef, useState } from 'react';
import MainPage from '../../components/molecules/MainPage';
import {PageTitle} from '../../components/atoms/Title';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { SearchingDevice, SelectedDevice } from '../../components/modules/PairingInfo';
import {InterfaceInfo}  from '../../components/modules/PairingInfo/InterfaceSettings/interface-info';
import { Button } from '../../components/atoms/Buttons/Button';
import { useAppState } from 'incyclist-services';

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
    padding-top: 4vh;
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

export const PairingScreen = ( {onOK,onSkip,onSimulate, onCapabilityClick,onCapabilityUnselect,onInterfaceClick,capabilities,interfaces,connectRetry, readyToStart,showSimulate=false, title, labelOK, labelSkip}) => {

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

    const initCapability = ( target, capability,alias)=> {
        if (capabilities){
            const info = capabilities.find( c=> alias ? c.capability.toLowerCase()===alias : c.capability.toLowerCase()===capability.toLowerCase())
            if(info) {
                target.push( {...info, title:capability})
                return;
            }
        }

        target.push({capability})
    }

    const initCapabilites = () => {

        const ftController = appState.hasFeature('CONTROLLERS')

        if (ftController)
            initCapability(top,'Resistance', 'control')    
        else 
            initCapability(top,'Control')    
        initCapability(top,'Power')    
        initCapability(top,'Heartrate')        

        initCapability(bottom,'Cadence')    
        initCapability(bottom,'Speed')    
        if (ftController) {
            initCapability(bottom,'Controller','app_control')    
        }

    }

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
            <TopRow className='top'                
>
                {top.map( (c,idx) => c.deviceName?
                    <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit}  onClick={ onCapabilityClicked } onUnselect={onUnselect} /> : 
                    <SearchingDevice key={idx} title={c.title} capability={c.capability}  onClick={ onCapabilityClicked } />
                    )}
            </TopRow>
            <BottomRow className='bottom'>
                {bottom.map( (c,idx) => c.deviceName?
                    <SelectedDevice key={idx} title={c.title} capability={c.capability} deviceName={c.deviceName} connectState={c.connectState} value={c.value} unit={c.unit}  onClick={ onCapabilityClicked } onUnselect={onUnselect} /> : 
                    <SearchingDevice key={idx} title={c.title} capability={c.capability}  onClick={ onCapabilityClicked } />
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

