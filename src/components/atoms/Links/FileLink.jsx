import React  from 'react';
import styled from 'styled-components';
import { EventLogger } from 'gd-eventlog';
import { hasFeature,api } from '../../../utils/electron/integration';
import { AppThemeProvider } from '../../../theme';

const Anchor = styled.a`
    color: ${props => props.color || props.theme.url.color || 'blue'};
    fontSize: ${props => props.fontSize || '1.2vh'};
` 

export const FileLink = (props) => {
    const {src,text,onClick,logger = new EventLogger('Incyclist')} = props;

    const onOpen = (e) => {
        e.preventDefault(); 
        if (logger)
            logger.logEvent({message:'file link clicked',src,eventSource:'user'})

        if (onClick && typeof(onClick)==='function')
            return onClick(src)

        if ( hasFeature('shell.showItemInFolder')) {
            api.showItemInFolder(src)
        }
    }


    return <AppThemeProvider>
            <Anchor onClick={ (e)=> { onOpen(e) } } href='#'>{text||src}/</Anchor>
        </AppThemeProvider>
}


