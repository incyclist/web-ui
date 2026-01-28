import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ShiftingControl as ShiftingControlComponent } from "./component";
import { useRideDisplay  } from "incyclist-services";
import {AutoHide, ErrorBoundary} from "../../../atoms";


export const ShiftingControl =  ({visible,justify})=> {

    const service = useRideDisplay()


    const [showHotkeys,setShowHotkeys] = useState(true)
    const [initialized,setInitialized] = useState(false)
    const [pinned,setPinned] = useState(false)
    

    useEffect( ()=>{
        if (initialized)
            return;        
        setInitialized(true)
    },[initialized])


    const onPin = () => {
        setPinned(true)
    }
    const onUnpin = () => {
        setPinned(false)
    }

    const onPowerDown = useCallback((val) => {
        service.adjustPower(false, val>1)
    },[service])
    const onPowerUp = useCallback((val) => {
        service.adjustPower(true,val>1)
    },[service])

  

    const memo =  useMemo(()=> {
        if (!initialized || !visible)
            return null

        return (
        <ErrorBoundary hideonError={true} >
            <AutoHide  id='shifting' delay={5000} pinned={pinned} onChangeVisible={ (v)=>{if (!v) setShowHotkeys(false)}}>
                <div className='autohide' justify={justify}>

                <ShiftingControlComponent
                showHotkeys={showHotkeys}
                pinned={pinned}
                justify={justify}
                onPowerDown={ onPowerDown }
                onPowerUp={ onPowerUp }
                onPin={onPin}
                onUnpin={onUnpin}

                />
                </div>
            </AutoHide >
        </ErrorBoundary>)
        }
        ,[initialized, justify, onPowerDown, onPowerUp, pinned, showHotkeys, visible])
    return memo
    

}