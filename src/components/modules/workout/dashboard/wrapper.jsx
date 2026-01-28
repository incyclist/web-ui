import React, { useEffect, useState } from 'react'
import WorkoutDashboard from './component';
import { useWorkoutRide } from 'incyclist-services';
import { copyPropsExcluding } from '../../../../utils/props';


export const DynamicWorkoutDashboard = ({visible, showSlope,zIndex, scheme='light'})=> {

    const [state,setState] = useState(null)    
    const [initialized,setInitialized] = useState(false)
    const service = useWorkoutRide()
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