import React from 'react';
import styled from 'styled-components';
import AppTheme from '../../../../theme';
import { ContainerTitle } from '../../../atoms/Title';
import { ConnectionStatus } from '../ConnectionStatus';

const style  = AppTheme.get().devices;

const Container = styled.div`
    display: flex;
    position:relative;
    flex-direction: column;
    background: ${props => props.background}; 
    width: 20vw;
    min-width: 20vw;
    max-width: 20vw;
    height: 25vh;
    min-height: 25vh;
    max-height: 25vh;

    top:0;
    left:0;
    bottom:0;
    right:0;
    padding: 0;
    margin: 0;
    overflow: none;
    transition: all 0.2s;
    &:hover {
        border-style: solid;
        border-width: 5px;
        border-color: white;

        box-shadow: 0px 15px 10px 0px rgba(0, 0, 0, 1)
    }

`
const DeviceName = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 3vh;
    
    width: 100%;
    height: 60%;
    top: 0;
    left:0;
    color: white;
`

const Info = styled.div`
    position: absolute;
    height: 33%;
    min-heigt: 33%
    display: flex;
    flex-direction: row;
    font-size: 3vh;
    justify-content: center;
    align-items: center;
    text-align: center;

    width: 100%;
    top: 47%;
    left:0;
    color: white;
`

const Unit = styled.div`
    font-size: 2vh;
    color: white;
    margin-left: 0.5vw;
`

const Value = styled.div`
    font-size: 3vh;
    color: white;
`


export const SelectedDevice = ( {title, capability, value, unit, deviceName, imageUrl, connectState, onClick,onUnselect }) => {
   
    const onContainerClicked = (e) =>{
        if (onClick)
            onClick(capability)
    }

    const onUnselectClicked = (e) =>{
        if (onUnselect)
            onUnselect(capability)
    }

    
    const failed = connectState==='failed'
    const background = failed ? style.failed.background : style.selected.background
    
    return (
        <Container background={background} onClick={ onContainerClicked}>
            <ContainerTitle size='2.5vh'  bold={true}>{title??capability} </ContainerTitle>
            <DeviceName>{deviceName}</DeviceName>
            {value!==undefined && value!==null && !isNaN(value)? 
            <Info>
                <Value>{value}</Value>
                <Unit>{unit}</Unit>
            </Info>
            : null}
            
            
            <ConnectionStatus state={connectState} onUnselect={onUnselectClicked} />
        </Container>
    )
}
