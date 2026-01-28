import React, { useRef, useState } from 'react'
import styled from "styled-components"
import { Button, Row, Text, View } from "../../../../atoms"
import { ArrowLeftIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../../theme'
import { OperationsSelector } from '../../../../molecules/Apps/OperationsSelector'
import { DialogLauncher } from '../../../../molecules'
import { VeloLoginDialog } from '../../../VeloHero'
import { useAppsService } from 'incyclist-services'

const SERVICE = 'velohero'

export const VeloHeroSettings = ({onBack})=> {

    const [connecting,setConnecting] = useState(false)
    const service = useAppsService()
    const dialogLauncher = useRef(null)
    const [settings,setSettings] = useState( service.openAppSettings(SERVICE))
    

    const openDialog = ( Dialog,props)=> {
        dialogLauncher.current.openDialog(Dialog,props)
    }
    const closeDialog = ( )=> {
        dialogLauncher.current.closeDialog()
    }

    const onConnect = async ()=>{        
        openDialog(VeloLoginDialog,{onCancel:onLoginCancel,onOK:onLoginOK})
        setConnecting(true)
    }

    const onLoginOK = ()=> {
        closeDialog()
        setConnecting(false)
        setSettings(service.openAppSettings(SERVICE))
    }

    const onLoginCancel = ()=> {
        closeDialog()
        setConnecting(false)
    }

    const onDisconnect = ()=>{
        service.disconnect(SERVICE)
        setSettings( {isConnected:false})
    }

    const onOperationsChanged = (operation, enabled) => {
        const operations = service.enableOperation(SERVICE,operation,enabled,true)
        setSettings( current=> ({...current,operations} ))
    }

    return <>
            <DialogLauncher ref={dialogLauncher}/>
            <VeloHeroSettingsView {...settings} isConnecting={connecting} 
            onBack={onBack} 
            onConnect={onConnect} onDisconnect={onDisconnect} 
            onOperationsChanged={onOperationsChanged}
            />
        </>        



}

const Container = styled(View)`
  position: relative;
`

const BackRow = styled(Row)`
    position: absolute;
    top: 0;
    right: 0;
    padding: 1vw

    color: ${props => props.theme.list.normal.text};
    background: ${props => props.theme.list.normal.background};

    &:hover {
        color: ${props => props.theme.list.hover.text};
        background: ${props => props.theme.list.hover.background};
        border-style: solid;
        border-width: 1px;
        border-color: white;
    }

`

const Icon = styled(ArrowLeftIcon)`
`

const Title = styled(Row)`
    height: 32px;
    font-size: 2.2vh;
    padding: 1vw;
    text-transform: uppercase;
    
    user-select: none;
    pointer-events: none;
    color: ${props => props.theme.title.text};
    background: ${props => props.theme.title.background};
    
`

export const VeloHeroSettingsView = ( {isConnected, isConnecting, operations, onBack, onConnect, onDisconnect,onOperationsChanged}) => {

    return <AppThemeProvider>
        <Container>
            <Title className='title' align='center' justify='center'>
                VeloHero Settings
            </Title>

            <Row className='buttons'>
                {isConnected ?  
                    <div>
                        <Button primary={true} text={'Disconnect from VeloHero'} onClick={onDisconnect}></Button> 
                    </div>
                : 
                    <div>
                        <Button primary={true} text='Connect With VeloHero' disabled={isConnecting}  padding={0}                            
                            onClick={onConnect}/>
                    </div>        
                }
            </Row>

            {isConnected ? <Row className='options'>
                <OperationsSelector operations={operations} onChanged={onOperationsChanged}/>

            </Row>:null}

            <BackRow className='back' onClick={onBack}>
                <Icon size={32} /> 
                <Text text='Apps' height='32px' align='center' />
            </BackRow>

        </Container>
    </AppThemeProvider>

}