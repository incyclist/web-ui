import  { useEffect,useCallback, useRef } from 'react';

export const useKey = (expected,callback,properties)=> {

    

    const handleUserKeyPress = useCallback(event => {

        if (!isEnabledRef.current)
            return;

        if ( window.activeDialog && !properties?.enableDialog)
            return; 

        if (window.activeDialog && properties?.dialog && properties?.dialog!==window.activeDialog)
            return


        const {propagate=true,debug=false, logger} = properties??{}
        if (!propagate)
            event.stopPropagation()
       
        const {keyCode,key,code,ctrlKey,altKey,metaKey,shiftKey} = event;

        const matchKey = (expected,idx) => {

            const cb = (props) => {
                if (typeof (logger?.logEvent) === 'function') {
                    logger.logEvent({ message: 'key pressed', key: { value: key, code, shiftKey, altKey, metaKey, ctrlKey }, eventSource: 'user' })                    
                }

                if (idx!==undefined && Array.isArray(callback)) {
                    callback[idx]({keyCode,key,code,ctrlKey,altKey,metaKey,shiftKey},idx,props)
                }
                else {
                    callback({keyCode,key,code,ctrlKey,altKey,metaKey,shiftKey},idx,props)
                }
                
            }

            if (Array.isArray(expected)) {
                expected.forEach( (e,i)=> { matchKey(e,i)})
                return;
            }

            if (typeof expected==='number' && event.keyCode===expected) {                    
                cb({keyCode,key,code,ctrlKey,altKey,metaKey,shiftKey})
            }
            else if (typeof expected==='string' && event.key===expected) {                    
                cb({keyCode,key,code,ctrlKey,altKey,metaKey,shiftKey})
            }
            else if (typeof expected==='object') {          
                let match = true;
                match = match && (expected.keyCode===undefined || keyCode===expected.keyCode)
                match = match && (expected.key===undefined || key===expected.key)
                match = match && (expected.code===undefined || code===expected.code)
                match = match && (ctrlKey===(expected.ctrlKey||false))
                match = match && (altKey===(expected.altKey||false))
                match = match && (metaKey===(expected.metaKey||false))
                match = match && (shiftKey===(expected.shiftKey||false))
    
                if (match) 
                    cb({keyCode,key: expected,code,ctrlKey,altKey,metaKey,shiftKey})
                
            }
        
        }

        matchKey(expected)



        if (debug) {
            console.log('~~~ DEBUG:key event',event)
        }

    },[callback, expected, properties]);

    const isEnabledRef = useRef(false)

    const enable = ()=>{
        isEnabledRef.current = true
        window.addEventListener("keyup", handleUserKeyPress,false)
    }
    const disable = ()=>{
        isEnabledRef.current = false
        window.removeEventListener("keyup", handleUserKeyPress,false)
    }

    useEffect(() => {
        enable()
        
        return () => {
            disable()
        };

        
    });

    return [enable,disable]
}