import React from 'react'
import { Row, Text } from '../../../atoms'
import styled from 'styled-components'
import { AppThemeProvider } from '../../../../theme'

const Container = styled(Row) `
    color: ${props => props.theme.list.normal.text};
    background: ${props => props.theme.list.normal.background};

    width: 10vw;
    height: 3vw;
    padding: 0.5vh 0.5vw 0.5vh 0.5vw;
    

    &:hover {
        color: ${props => props.theme.list.hover.text};
        background: ${props => props.theme.list.hover.background};
        border-style: solid;
        border-width: 1px;
        border-color: white;
        padding: calc(0.5vh - 1px) calc(0.5vw - 1px) calc(0.5vh - 1px) calc(0.5vw - 1px);

    }

`

export const Image = styled.img`
    width: ${props => props.width};
    height: ${props => props.height};
    
    user-select: none;
    pointer-events: none;
`



export const AppsItem = ( {name, iconUrl, isConnected,onClick}) => {

    return <AppThemeProvider>
        <Container onClick={onClick}>
            
            {iconUrl? <Image src={iconUrl} width='100%'/> :
             <Text text={name}/>}
        </Container>
    </AppThemeProvider>

}