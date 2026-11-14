import React from 'react'
import styled from 'styled-components'
import { Button, Text } from '../../../atoms'
import AppTheme, { AppThemeProvider } from '../../../../theme'
import { OperationsSelector } from '../OperationsSelector'

const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1.6vh;
`

const ConnectArea = styled.div`
    display: flex;
    align-items: center;
    min-height: 4.4vh;
`

/**
 * Connect/disconnect and operation settings of a single app, shown inside the expanded
 * entry of the Apps list.
 *
 * @param {string} name display name of the app
 * @param {string} [connectImage] optional brand image (e.g. "Connect with Strava") that is used as connect button
 */
export const AppSettingsView = ({ name, isConnected, isConnecting, operations, connectImage, onConnect, onDisconnect, onOperationsChanged }) => {

    const renderConnect = () => {
        if (isConnecting)
            return <Text text='Connecting...' />

        if (isConnected)
            return <Button text='Disconnect' margin='0' background={AppTheme.get().colors?.error} onClick={onDisconnect} />

        if (connectImage)
            return <Button id={`Connect With ${name}`} primary={true} padding={0} noBorder margin='0' height='auto' onClick={onConnect}>
                <img src={connectImage} alt={`Connect With ${name}`} />
            </Button>

        return <Button text={`Connect with ${name}`} primary={true} margin='0' padding='0 1vw' onClick={onConnect} />
    }

    return <AppThemeProvider>
        <Content>
            <ConnectArea>{renderConnect()}</ConnectArea>
            {isConnected ? <OperationsSelector operations={operations} onChanged={onOperationsChanged} /> : null}
        </Content>
    </AppThemeProvider>
}
