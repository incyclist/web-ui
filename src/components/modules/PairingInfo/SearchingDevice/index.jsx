import React from 'react';
import styled from 'styled-components';
import AppTheme from '../../../../theme';
import { ContainerTitle } from '../../../atoms/Title';
import { hoverFrame, tileOutline, tileSize } from '../tile';

const style  = AppTheme.get().devices;

const Container = styled.div`
    display: flex;
    position:relative;
    flex-direction: column;
    box-sizing: border-box;
    background: ${style.searching.background};
    ${props => tileSize(props.$compact)}
    top:0;
    left:0;
    bottom:0;
    right:0;
    padding: 0;
    margin: 0;
    overflow: none;
    transition: all 0.2s;
    &:hover {
        box-shadow: 0px 5px 10px 0px rgba(0, 0, 0, 1)
    }
    ${hoverFrame}
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
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;

    width: 100%;
    top: 80%;
    left:0;
    color: white;
`



const HelpText = styled.div`
    position: absolute;
    top: 40%;
    left: 0;
    width: 100%;
    text-align: center;
    color: white;
    font-size: 2vh;
`

export const SearchingDevice = ( {title, capability, awaited, helpText, footer, compact, onClick }) => {

    const onContainerClicked = () =>{
        if (onClick)
            onClick(capability)
    }

    return (
        <Container onClick={ onContainerClicked} $compact={compact} style={tileOutline(awaited)}>
            <ContainerTitle size='2.5vh' bold={true}>{title ?? capability} </ContainerTitle>

            <HelpText>{helpText}</HelpText>
            <Status>{footer}</Status>
        </Container>
    )
}

