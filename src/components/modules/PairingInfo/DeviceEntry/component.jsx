import React from 'react'
import styled from 'styled-components'
import { LaunchStatusIcon } from '../ConnectionStatus'
import { Row } from '../../../atoms'
import { copyPropsExcluding } from '../../../../utils'

const Record = styled.div`
    height: 100%;
    margin-left: 0.2vw;
    display: flex;
    flex-direction: row;
    justify-content: left;
`


const NameDiv = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: ${props => `calc(100% - ${props.minspace??9}ch)`}; 
`;

const Name = (props) => {
    const childProps = copyPropsExcluding(props,['hasValue'])
    const maxWidth =  props?.hasValue?12:9

    return <NameDiv {...childProps} minspace={maxWidth} />
}

const Value = styled.div`
    position: absolute;
    right: 7ch;
`

const InterfaceIcon = styled.div`
    position: absolute;
    right: 3ch;
`

const IconContainer = styled(Row) `
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    height:100%;
`

const Icons = {
    ant: 'images/ant.svg',
    serial: 'images/usb.svg',
    tcpip: 'images/tcpip.svg',
    wifi: 'images/wifi.svg',
    ble: 'images/ble.svg'
}

const ImgWhite = styled.img`
    max-width:100%;
    fill: ${props => props.fill || 'white'};
    max-height:100%;
    filter: brightness(0) invert(1);
    x:invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%);
`;

export const DeviceEntry = ( { device})=> {

    const ifName = device?.interface?.toLowerCase()
    const {connectState, name, value} = device??{}
    

    return <DeviceEntryView ifName={ifName}
            connectStatus={connectState}
            name={name}
            value = {value} />
        
    
}


export const DeviceEntryView = ( { ifName, connectState, name, value})=> {

    const Icon  = () => {
        if (!ifName) return null
        
        return <IconContainer width='2vw'><ImgWhite src={Icons[ifName]}/></IconContainer>

    }

    const hasValue = value!==undefined && value!==null

    return <Record>
            <LaunchStatusIcon status={connectState}/>
            <Name hasvalue={hasValue}>{name}</Name>
            <Value>{value}</Value>
            <InterfaceIcon><Icon/></InterfaceIcon>
        </Record>

}