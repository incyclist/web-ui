import { useRef, useState } from "react"
import { useUnmountEffect } from "../flow"
import { useEffect } from "react"
import { useCallback } from "react"
import { Observer } from "incyclist-services"

export const useHover = (ref)=>{
    
    
    const [isHovered,setIsHovered] = useState(false) 
    const mountedRef = useRef(false)

    const handleMouseEnter = useCallback(() => {setIsHovered(true)},[setIsHovered]);
    const handleMouseLeave = useCallback(() => {setIsHovered(false)},[setIsHovered]);
    
    useEffect( ()=>{
        const element = ref?.current
        if (!element)
            return

        if (mountedRef.current)
            return  
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);

        mountedRef.current = true
    },[handleMouseEnter, handleMouseLeave, ref])


    useUnmountEffect( ()=>{
        const element = ref?.current
        if (!element)
            return
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        mountedRef.current = false
    })

    return isHovered
}


export const useHoverObserver = (ref)=>{
    
    const observerRef = useRef( new Observer())
    const hoverStateRef = useRef({})
    const elementRef = useRef(ref.current)
    const mountedRef = useRef(false)

    const handleMouseEnter = useCallback(() => {

        if (hoverStateRef.current?.hovered===true)
            return

        if (observerRef.current)            
            observerRef.current.emit('hovered',true)

        hoverStateRef.current = {hovered:true}
    },[]);


    const handleMouseLeave = useCallback(() => {
        try {
            if (hoverStateRef.current?.hovered===false)
                return

            if (observerRef.current)
                observerRef.current.emit('hovered',false)

            hoverStateRef.current = {hovered:false}
        }
        catch(err) {
            console.error(err)
        }
    },[]);

    const initObserver = useCallback( (element)=>{     
        try {
            if (element) {
                element.addEventListener('mouseenter', handleMouseEnter);
                element.addEventListener('mouseleave', handleMouseLeave);
                elementRef.current = element
            }
            if (!observerRef.current)
                observerRef.current = new Observer()
        }
        catch(err) {
            console.error(err)
        }
    },[handleMouseEnter, handleMouseLeave])

    const stopObserver = useCallback( ()=>{        
        // if (observerRef.current)
        //     observerRef.current.stop()
        // observerRef.current = null

        const element = elementRef.current
        if (!element)
            return
        
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
    },[handleMouseEnter, handleMouseLeave])

    const update =(ref) => {
        stopObserver()
        initObserver(ref?.current)
    }

    
    useEffect( ()=>{
        if (mountedRef.current)
            return  
        initObserver(ref?.current)        
        mountedRef.current = true
    },[initObserver, ref])


    useUnmountEffect( ()=>{
        stopObserver()
    })

    return [observerRef,update]
}