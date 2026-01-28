import React,{ useEffect, useState } from "react"
import { WorkoutSettingsView } from "./WorkoutSettingsView"
import { useUserSettings, useWorkoutList, useWorkoutRide } from "incyclist-services"

export const WorkoutSettings = (props) => {

    const [state,setState] = useState({})
    const [initialized, setInitialized] = useState(false)
    const service = useWorkoutList()
    const rideService = useWorkoutRide()
    const userSettings = useUserSettings()

    const newUi = false  

    useEffect( ()=>{
        if (initialized)
            return;
        setInitialized(true)

        const workout = service.getSelected()
        const settings = service.getStartSettings()
        const user = userSettings.getValue('user',{})
        setState({workout,settings,user})

    },[service, userSettings,initialized])

    const onDelete = ()=>{
        try {
            rideService.stop()
            service.unselect()

            if (newUi) {
                const {observer,workouts} = service.openSettings()

                setState( current=> ({...current, workout:null,workouts,observer}))
            }
            else {
                setState( current=> ({...current, workout:null}))
            }
        }
        catch(err) {
            console.log('~~~ ERROR',err)
        }
    }

    const onDrop = async (dropInfo) => {

        if (dropInfo?.length>1) {
            return {cntErrors:1, errors: [new Error('Please only drop a single file')]}
        }

        try {

            const workouts = await service.import(dropInfo[0],{showImportCards:false})
            const workout = workouts?.[0]?.getData()

            service.select(workout)
            setState( current=> ({...current, workout}))

            if (props.onWorkoutChanged)
                props.onWorkoutChanged(workout)

            return {cntErrors:0}
        }
        catch(err) {
            console.log('# ERROR',err)
            return {cntErrors:1, errors:[err]}
        }

    }

    const onChangeErgMode = (enabled) => {
        const settings = service.getStartSettings()
        settings.useErgMode = enabled
        service.setStartSettings(settings)

        setState( current => ({...current,settings}))
    }

    const {onOK} = props

    return <WorkoutSettingsView {...state} {...props}
                 onDelete={onDelete} onDrop={onDrop} onChangeErgMode={onChangeErgMode} onOK={onOK} />

}