import React, { useEffect, useState } from 'react'
import WorkoutDashboard from './component';
import { useWorkoutRide, useUserSettings } from 'incyclist-services';
import { copyPropsExcluding } from '../../../../utils/props'
import { playTone, STEP_COUNTDOWN_TICK_TONE, STEP_CHANGE_TONE } from '../../../../utils/stepChangeTone';


export const DynamicWorkoutDashboard = ({visible, showSlope,zIndex, scheme='light'})=> {

    const [state,setState] = useState(null)    
    const [initialized,setInitialized] = useState(false)
    const service = useWorkoutRide()
    const userSettings = useUserSettings()
    //const logError = useErrorLogging('DynamicWorkoutDashboard')
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
                .on('step-countdown', tick => {
                    // Precisely scheduled by WorkoutRide via wall-clock timers - independent of
                    // this loop's own event timing, so it isn't subject to poll/event-loop jitter.
                    // secondsRemaining:0 is the step-change instant itself (transition tone/flash);
                    // 4/3/2/1 are the lead-in ticks. Both audio and visual pulse are driven from
                    // this single event now, not from 'step-changed'.
                    try {
                        if (!tick)
                            return;
                        const isChangeTone = tick.secondsRemaining===0
                        const audioEnabled = userSettings.getValue('preferences.workouts.stepChangeAudioSignal', true)
                        if (audioEnabled)
                            playTone(isChangeTone ? STEP_CHANGE_TONE : STEP_COUNTDOWN_TICK_TONE)
                        setState( prev=> ({...prev,stepPulse:{type:isChangeTone ? 'flash' : 'tick',ts:Date.now()}}) )
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



    },[initialized, service,observer, userSettings])


    if (!initialized || !state?.observer || !state?.workout || !visible)
        return null

    const numDataColumns = showSlope ? 4 :3;
    const childProps = copyPropsExcluding(state,['observer'])

    return (
        <WorkoutDashboard 
            className='workout-dashboard'
            numDataColumns={numDataColumns}
            {...childProps}
            
            scheme = {scheme}
            zIndex = {zIndex}
        />
    )
    
}