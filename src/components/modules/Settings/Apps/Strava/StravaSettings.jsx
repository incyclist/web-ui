import React, { useState } from 'react'
import styled from "styled-components"
import { Button, Row, Text, View } from "../../../../atoms"
import { ArrowLeftIcon } from '@primer/octicons-react'
import { AppThemeProvider } from '../../../../../theme'
import { EventLogger } from 'gd-eventlog'
import { hasFeature } from '../../../../../utils/electron/integration'
import { OAuthBinding} from '../../../../../bindings'
import { useAppsService } from 'incyclist-services'
import { OperationsSelector } from '../../../../molecules/Apps/OperationsSelector'

export const StravaSettings = ({onBack})=> {

    const logger = new EventLogger('StravaSettings')
    const [connecting,setConnecting] = useState(false)
    const service = useAppsService()

    const [settings,setSettings] = useState( service.openAppSettings('strava'))
    

    const onConnect = async ()=>{

        try {
            logger.logEvent({message:'onConnectStrava'})
            if (hasFeature('oauth')) {

                setConnecting(true)
                const res = await OAuthBinding.getInstance().authorize('strava');
            
                if (res.success) {
                    logger.logEvent({message:'onConnectStrava succes', username:res.user.name})
                    await service.connect('strava', res.user?.auth?.strava)                               
                    const settings = service.openAppSettings('strava')
                    setSettings( current=> ({...current, ...settings}) )
                
                    
                }
                else {
                    logger.logEvent({message:'onConnectStrava failed', reason:res.reason})
                }
                setConnecting(false)

            }
        }
        catch(err) {
            logger.logEvent({message:'error', fn:'onConnect', error:err.message, stack:err.stack})
        }
    }

    const onDisconnect = ()=>{
        setSettings( {isConnected:false})
    }

    const onOperationsChanged = (operation, enabled) => {
        const operations = service.enableOperation('strava',operation,enabled,true )
        setSettings( current=> ({...current,operations} ))
    }

    return <StravaSettingsView {...settings} isConnecting={connecting} 
        onBack={onBack} 
        onConnect={onConnect} onDisconnect={onDisconnect} 
        onOperationsChanged={onOperationsChanged}
        />


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

export const StravaSettingsView = ( {isConnected, isConnecting, operations, onBack, onConnect, onDisconnect,onOperationsChanged}) => {

    return <AppThemeProvider>
        <Container>
            <Title className='title' align='center' justify='center'>
                Strava Settings
            </Title>

            <Row className='buttons'>
                {isConnected ?  
                    <div>
                        <Button primary={true} text={'Disconnect from Strava'} onClick={onDisconnect}></Button> 
                    </div>
                : 
                    <div>
                        <Button disabled={isConnecting} primary={true} padding={0} noBorder onClick={onConnect}
                            id='Connect With Strava'
                            >
                            <img src='images/btn_strava_connectwith_orange.svg' alt='Connect With Strava'></img>
                        </Button> 
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