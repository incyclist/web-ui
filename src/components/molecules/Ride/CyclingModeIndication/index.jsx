import React, { useEffect, useRef, useState } from "react"
import { Center,Overlay } from "../../../atoms"


export const CyclingModeIndication = ({mode,delay,onHidden,targetPower}) => {

    const [visible,setVisible] = useState(true)
    const timeoutRef = useRef(null)

    useEffect( ()=>{
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null;
        }
        
        timeoutRef.current = setTimeout( ()=>{
            setVisible(false)
            if (onHidden && typeof(onHidden)==='function')
                onHidden()
        },delay)

    },[mode,delay,onHidden,])

    if (!visible)
        return null;

    const targetPowerText = targetPower ? ` (${targetPower}W)` : ''
    const text = `Switching to ${mode} mode${targetPowerText}`

    return <Overlay width='20vw' height='10vh' left='40vw' top='45vh' padding={0} background='rgba(0,0,0,0.8)'>
        <Center>{text}</Center>
    </Overlay>
}