import React, { useRef, useState } from 'react'
import styled from "styled-components"
import { Button, Row, Text, View } from "../../../../atoms"
import { ArrowLeftIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../../theme'
import { OperationsSelector } from '../../../../molecules/Apps/OperationsSelector'
import { DialogLauncher, KomootLoginDialog } from '../../../../molecules'
import { useAppsService } from 'incyclist-services'
import { useUnmountEffect } from '../../../../../hooks'

const SERVICE = 'komoot'

export const KomootSettings = ({onBack})=> {

    const [connecting,setConnecting] = useState(false)
    const service = useAppsService()
    const dialogLauncher = useRef(null)
    const initialSettingsRef = useRef(service.openAppSettings(SERVICE))
    const [settings,setSettings] = useState(initialSettingsRef.current )
    

    const openDialog = ( Dialog,props)=> {
        dialogLauncher.current.openDialog(Dialog,props)
    }
    const closeDialog = ( )=> {
        dialogLauncher.current.closeDialog()
    }

    const onConnect = async ()=>{        
        openDialog(KomootLoginDialog,{onCancel:onLoginCancel,onOK:onLoginOK})
        setConnecting(true)
    }

    const onLoginOK = (credentials,cb)=> {

        service.connect('komoot',credentials)
            .then( connected => {
                if (connected) {
                    closeDialog()
                    setConnecting(false)
                    setSettings(service.openAppSettings(SERVICE))
                }
                else {                   
                    cb( 'Invalid credentials')
                }
            })
            .catch(err => {
                cb(err.message)
            })

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
       
        const operations = service.enableOperation(SERVICE,operation,enabled)
        
        setSettings( current=> ({...current,operations} ))
    }

    useUnmountEffect( ()=>{

        const prev = initialSettingsRef.current
        const current = settings

        if (prev.isConnected && !current.isConnected) {
            const {operations} = prev
            operations.forEach( op=> {  service.enableOperation(SERVICE,op.operation,false,true)})
        }
        else if (!prev.isConnected && current.isConnected) {
            const {operations} = current
            operations.forEach( op=> {  
                if (op.enabled)
                    service.enableOperation(SERVICE,op.operation,true,true
                )})
        }
        else {
            const {operations} = current
            operations.forEach( (op,idx)=> {  
                const prevOp = prev.operations[idx]
                if (op.enabled!==prevOp.enabled)
                    service.enableOperation(SERVICE,op.operation,op.enabled,true
                )})

        }
        

    })

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
                Komoot Settings
            </Title>

            <Row className='buttons'>
                {isConnected ?  
                    <div>
                        <Button primary={true} text={'Disconnect from Komoot'} onClick={onDisconnect}></Button> 
                    </div>
                : 
                    <div>
                        <Button primary={true} text='Connect With Komoot' disabled={isConnecting}  padding={0}                            
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