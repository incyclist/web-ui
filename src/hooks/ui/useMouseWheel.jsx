import  { useEffect,useCallback } from 'react';

export const useMouseWheel = (expected,callback,props)=> {

    const handleWheelEvent = useCallback(event => {
        const {propagate=true,debug} = props||{}

        if (!propagate)
            event.stopPropagation()

       
        if (Array.isArray(expected)) {
            expected.forEach( e=> { handleWheelEvent(e,callback,{debug:false})})
            return;
        }

        if (expected==='up' && event.deltaY<0) {                    
            callback('up', Math.abs(event.deltaY))
        }
        else if (expected==='down' && event.deltaY>0) {                    
            callback('down', Math.abs(event.deltaY))
        }

        if (debug) {
            console.log('~~~ DEBUG: wheel event',event)
        }

    },[callback, expected, props]);

    const enable = ()=>window.addEventListener("wheel", handleWheelEvent,false)
    const disable = ()=>window.removeEventListener("wheel", handleWheelEvent,false);

    useEffect(() => {

        enable()

        
        return () => {
            disable()
        };

        
    });

    return [enable,disable]
}