import React from 'react';
import styled from 'styled-components';
import AppTheme from '../../../../theme';
import { ContainerTitle } from '../../../atoms/Title';

const style  = AppTheme.get().devices;

const Container = styled.div`
    display: flex;
    position:relative;
    flex-direction: column;
    background: ${style.searching.background}; 
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
        box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 1)
    }
`
const Status = styled.div`
    position: absolute;
    height: 20%;
    min-heigt: 20%
    display: flex;
    flex-direction: row;
    font-size: 2vh;
    justify-content: center;
    align-items: center;
    text-align: center;

    width: 100%;
    top: 80%;
    left:0;
    color: white;
`



export const SearchingDevice = ( {title, capability, onClick }) => {
   
    const onContainerClicked = () =>{
        if (onClick)
            onClick(capability)
    }
    
    
    return (
        <Container onClick={ onContainerClicked}>
            <ContainerTitle size='2.5vh' bold={true}>{title ?? capability} </ContainerTitle>
            
            <Status>Click To Search</Status>
        </Container>
    )
}

