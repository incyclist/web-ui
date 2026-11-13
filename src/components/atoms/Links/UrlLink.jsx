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
        if (logger)
            logger.logEvent({message:'external link clicked',url,eventSource:'user'})

        if (onClick && typeof(onClick)==='function') {
            e.preventDefault();
            return onClick(url)
        }

        if ( hasFeature('shell.openExternal')) {
            e.preventDefault();
            api.shell.openExternal(url)
            if (onOpened)
                onOpened()
        }
    }

    return <AppThemeProvider>    
        <Anchor onClick={ (e)=> { onOpen(e) } } href={url} target='_blank' rel='noopener noreferrer'>{text||url}</Anchor>
    </AppThemeProvider>
}
