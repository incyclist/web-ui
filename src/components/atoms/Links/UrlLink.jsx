import React  from 'react';
import styled from 'styled-components';
import { hasFeature,api } from '../../../utils/electron/integration';
import { EventLogger } from 'gd-eventlog';
import {AppThemeProvider} from '../../../theme'

const Anchor = styled.a`
    color: ${props => props.color || props.theme.url.color || 'blue'};
    fontSize: ${props => props.fontSize || '1.2vh'};
` 

export const UrlLink = (props) => {
    const {text,url,onClick,onOpened,logger = new EventLogger('Incyclist')} = props;

    const onOpen = (e) => {
        e.preventDefault(); 
        if (logger)
            logger.logEvent({message:'external link clicked',url,eventSource:'user'})

        if (onClick && typeof(onClick)==='function')
            return onClick(url)

        if ( hasFeature('shell.openExternal')) {
            api.shell.openExternal(url)
            if (onOpened)
                onOpened()
        }
    }

    return <AppThemeProvider>    
        <Anchor onClick={ (e)=> { onOpen(e) } } href='#' target='_blank'>{text||url}</Anchor>
    </AppThemeProvider>
}
