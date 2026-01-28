import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { AppThemeProvider } from '../../../theme';
import { useKey } from '../../../hooks';
import { EventLogger } from 'gd-eventlog';
import { useUnmountEffect } from '../../../hooks';

const Container = styled.div`
    position: fixed;
    z-index: ${props => props.$zIndex};
    top:0;
    bottom:0;
    left:0;
    right:0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background:none;
`

const ModalDialog = styled.div`
    text-align: left;
    padding: 0;
    margin: 0;
    height: ${props=> props.height};
    min-height:${props=> props.height};
    max-height:${props=> props.height};

    width: ${props=> props.width};
    min-width: ${props=> props.width};
    max-width: ${props=> props.width};
    border: ${props => props.theme.dialog.border || 'rgb(0,0,0) 1px solid'};
    border-radius: ${props => props.theme.dialog?.borderRadius} ;
    
    box-shadow: 5px 5px 15px 5px #000000;
    background: ${props => props.theme.dialog.background};
    color: ${props => props.theme.dialog.text};
`;

export const TitleBar = styled.div`
    text-align: center ;
    text-transform: uppercase;
    font-family: "Roboto", "Arial", sans-serif, bold;
    font-size:  3vh;
    width: 100%;
    height: 6.66vh;     // 1/12 of 80%
    background-color: ${props => props.theme.title.background};
    color: ${props=>props.theme.title.text};
    display: inline-table;
`;

const ContainerArea = styled.div`
    width: 100%;
    height: ${props => props.$fullsize ? '100%' : 'calc(100% - 6.66vh);'};
    padding:0;
`;

const Text = styled.span`
    margin: 0;
    position: relative;
    top: 1.83vh;
`;

export function Title(props) {
    return <TitleBar><Text>{props.title}</Text></TitleBar>
} 

const ESC=27

export const Dialog = (props) => {

    const logger = new EventLogger('Incyclist')

    const key = `${props.id??props.title}${Date.now()}`
    const mounted = useRef(false)

    const onOutsideClicked = () => {
        const {onOutsideClicked} = props
        if (onOutsideClicked)            
            onOutsideClicked()
    }

    const onEscapePressed = () => {
        const {onESC} = props
        
        if (!onESC)
            return;

        logger.logEvent({message:'key pressed', key:'Escape', eventSource: 'user' })

        return onESC()
    }


    useEffect( ()=>{

        if (!mounted.current) {
            let dialog = props.id??props.title
            const additionalLogs = props.log || {}
        
            if (dialog) {
                logger.logEvent({message:'Dialog shown',dialog, ...additionalLogs})
                logger.set({dialog})
            }
        }

        mounted.current = true
    })

    useEffect( ()=>{
        const prev = window.activeDialog
        window.activeDialog = key
        return ()=> {
            window.activeDialog = prev
        }
    })

    useUnmountEffect( ()=>{

        let dialog = props.id??props.title
        const additionalLogs = props.log || {}
        if (dialog) {
            logger.logEvent({message:'Dialog closed',dialog, ...additionalLogs})
            logger.set({dialog:null})
        }
    },[])

    useKey(ESC,onEscapePressed,{propagate:false,enableDialog:props.onESC!==undefined, dialog:key})

    const zIndex = props.level!==undefined ?  (props.level+1)*10: props.zIndex || 10;
    const level = (props.level || zIndex/10)-1;       
    const height = props.height || `${80-4*level}%`;
    const width = props.width ||  `${80-4*level}%`

    if ( !props.flex) {
        return (
            <AppThemeProvider>
                <Container $zIndex={zIndex} onClick={onOutsideClicked}>
                <ModalDialog className='dialog'  onClick={(e)=>e.stopPropagation()}
                    width={width} height={height} >
    
                    {props.title && <TitleBar  className='title-bar'><Text>{props.title}</Text></TitleBar>}
                    
                    <ContainerArea $fullsize={props.fullsize || !props.title} className='dialog-content'>
                        {props.children}
                    </ContainerArea>
                </ModalDialog>
                </Container>
            </AppThemeProvider>
        )    
    }
    else {
        return ( 
            <AppThemeProvider>
                <Container $zIndex={zIndex} onClick={onOutsideClicked}>
                <ModalDialog  className='dialog flex' onClick={(e)=>e.stopPropagation()}
                    width={width} height={height}>
                
                    <ContainerArea  $fullsize={!props.title} className='dialog-content'>
                        {props.title && <TitleBar><Text>{props.title}</Text></TitleBar>}
                        {props.children}
                    </ContainerArea>
                </ModalDialog>                
                </Container>
            </AppThemeProvider>
        )
    }

}

