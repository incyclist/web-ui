/* eslint-disable react-hooks/exhaustive-deps */
import  { useEffect,useCallback } from 'react';

const MIN_DRAG =5;

export const useMouseSwipe = (expected,callback,props)=> {

    let dragging = false;
    let x,y;
    

    const handleSwipeEvent = (event => {

        const matchKey = (expected) => {
       
            if (Array.isArray(expected)) {
                expected.forEach( e=> { matchKey(e)})
                return;
            }

            if (expected==='swipe-up' && event.deltaY<0) {                    
                callback('swipe-up', Math.abs(event.deltaY),event)
            }
            else if (expected==='swipe-down' && event.deltaY>0) {                                    
                callback('swipe-down', Math.abs(event.deltaY),event)
            }

            if (expected==='swipe-left' && event.deltaX<0) {                    
                callback('swipe-left', Math.abs(event.deltaX),event)
            }
            else if (expected==='swipe-right' && event.deltaX>0) {                    
                callback('swipe-right', Math.abs(event.deltaX),event)
            }

        }

        matchKey(expected)


    });



    const handleUp = useCallback( (e)=> {
        const {propagate=true} = props||{}

        if (!propagate)
            e.stopPropagation()

        dragging = false;

        if (props.onSwipeEnd) {
            const deltaXO = e.pageX-x;
            const deltaYO = e.pageY-y;

            const deltaX =  Math.abs(deltaXO)>MIN_DRAG ? deltaXO : 0
            const deltaY = Math.abs(deltaYO)>MIN_DRAG ? deltaYO : 0

            if (deltaX||deltaY)
                props.onSwipeEnd({deltaX,deltaY})
        }
    },[])

    const handleDown = useCallback(  (e)=> {
        const {propagate=true} = props||{}

        if (!propagate)
            e.stopPropagation()

        x= e.pageX;
        y= e.pageY; 
        dragging = true;
    },[])

    const handleMove = useCallback( (e)=> {
        if (dragging) {
            const deltaXO = e.pageX-x;
            const deltaYO = e.pageY-y;

            const deltaX =  Math.abs(deltaXO)>MIN_DRAG ? deltaXO : 0
            const deltaY = Math.abs(deltaYO)>MIN_DRAG ? deltaYO : 0

            if (deltaX||deltaY)
                handleSwipeEvent({...e,deltaX,deltaY})
            
                
        }
    },[])

    const enable = ()=> {
        const element = props.div || window
        element.addEventListener("mousedown", handleDown,false)
        element.addEventListener("mouseup", handleUp,false)
        element.addEventListener("mousemove", handleMove,false)
    }

    const disable = ()=> {
        const element = props.div || window
        element.removeEventListener("mousedown", handleDown,false)
        element.removeEventListener("mouseup", handleUp,false)
        element.removeEventListener("mousemove", handleMove,false);
    }

    useEffect(() => {
        enable()       
        return () => {
            disable()
        };
    });

    return [enable,disable]
}