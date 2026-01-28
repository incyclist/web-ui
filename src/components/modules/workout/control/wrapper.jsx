import React, { useCallback, useEffect, useMemo, useState } from "react";
import { WorkoutControl as WorkoutControlComponent } from "./component";
import { useWorkoutList, useWorkoutRide } from "incyclist-services";
import {AutoHide, ErrorBoundary} from "../../../atoms";


export const WorkoutControl =  ({visible,onToggleMode})=> {

    const service = useWorkoutRide()
    const workoutList = useWorkoutList()


    const [showHotkeys,setShowHotkeys] = useState(true)
    const [state,setState] = useState( {} )    
    const [initialized,setInitialized] = useState(false)
    const [pinned,setPinned] = useState(false)
    
    const observer = service.getObserver()

    useEffect( ()=>{
        if (initialized)
            return;
        
        const props = service.getDashboardDisplayProperties()

        if (props?.workout && observer) {
            setInitialized(true)

            setState( { observer, ...props})
            
            observer
                .on('update', update => {
                    try {
                        if (!update) 
                            return;
                        setState( prev=> ({...prev,...update,forceStepButtons:false}) ) 
                    }
                    catch(err) {
                        console.log('~~~ ERROR',err)
                        //logError(err,'onUpdate')
                    }
                })
                .on('step-changed', update => {
                    try {
                        if (!update) 
                            return;
                        setState( prev=> ({...prev,...update,forceStepButtons:true}) ) 
                    }
                    catch(err) {
                        console.log('~~~ ERROR',err)
                        //logError(err,'onUpdate')
                    }
                })
                .on('stopped', ()=> {
                    setState({}) 
                    setInitialized(false)
                })

                .on('completed', ()=> {
                    setState({}) 
                    setInitialized(false)
                })
        }



    },[initialized, service,observer])


    const onPin = () => {
        setPinned(true)
    }
    const onUnpin = () => {
        setPinned(false)
    }

    const onBackward = useCallback(() => {
        service.backward()
    },[service])

    const onForward = useCallback(() => {
        service.forward()
    },[service])

    const onStop = useCallback(() => {
        service.stop()
        workoutList.unselect()
    },[service, workoutList])

    const onPowerDown = useCallback((val) => {
        service.powerDown(val)
    },[service])
    const onPowerUp = useCallback((val) => {
        service.powerUp(val)
    },[service])

    const onToggleModeHandler = useCallback(() => {
        service.toggleCyclingMode()
        if (onToggleMode && typeof(onToggleMode)==='function')
            onToggleMode()
    },[onToggleMode, service])
  

    const memo =  useMemo(()=>
        
        <ErrorBoundary hideonError={true} >
            <AutoHide style={{display:'flex'}} delay={5000} pinned={pinned} onChangeVisible={ (v)=>{if (!v) setShowHotkeys(false)}}>
                <div className='autohide'>

                <WorkoutControlComponent
                showHotkeys={showHotkeys}
                pinned={pinned}
                mode={state.mode}

                onBackward={ onBackward }
                onForward={ onForward }
                onStop={ onStop }
                onPowerDown={ onPowerDown }
                onPowerUp={ onPowerUp }
                onToggleMode={ onToggleModeHandler }
                onPin={onPin}
                onUnpin={onUnpin}

                />
                </div>
            </AutoHide >
        </ErrorBoundary>,
        [pinned, showHotkeys, state.mode, onBackward, onForward, onStop, onPowerDown, onPowerUp, onToggleModeHandler])

    if (!initialized || !state?.observer || !state?.workout || !visible)
        return null


    return memo
    

}