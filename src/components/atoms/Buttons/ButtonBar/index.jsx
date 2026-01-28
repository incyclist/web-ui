import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import AppTheme from '../../../../theme';

export const ButtonBarC = styled.div`
    position:relative;
    display: flex;
    flex-direction: row;
    justify-content: ${props => props.justify||'start'};    
    align-items: ${props => props.align || 'center'};
    margin:auto;
    display: flex;
    padding:0;
    top:0;
    left:0;
    height: ${props => props.height|| '7.7vh'};
    width: ${props => props.width|| '100%'};
    background: ${props => props.theme?.buttonbar?.background || 'lightgrey'};
`;

export const ButtonBar = (props) => <ThemeProvider theme={AppTheme.get()}><ButtonBarC {...props}/></ThemeProvider>
