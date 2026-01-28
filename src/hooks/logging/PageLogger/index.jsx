import { EventLogger } from 'gd-eventlog';
import { useEffect, useRef } from 'react';

export function usePageLogger( info,openState) {

    let pageName, pageProps={}
    if (typeof info==='string') {
        pageName = info
    }
    else if ( typeof info==='object') {
        pageName = info.page
        pageProps = {...info}
        delete pageProps.page
    }

    const state = useRef(null);
    const logger = new EventLogger('Incyclist')

    useEffect(() => {
        if (openState===null)
            return
        if (!state.current || state.current!==openState) {

            const message = openState==='open'||openState==='opened' ? 'page shown': 'page closed'

            logger.logEvent({message,page:pageName,...pageProps })
            state.current = openState
            
            
            if(openState==='open' || openState==='opened')
                logger.set({page:pageName})
            else 
                logger.set({page:null})
            
        }

    
    },[pageName, pageProps, openState, state, logger]);

    const close = ()=> {
        if (state.current==='closed' || state.current==='close')
            return;

        logger.logEvent({message:'page closed',page:pageName,...pageProps })
        state.current = 'closed'
        logger.set({page:null})
    }

    return [new EventLogger(pageName),close]
}