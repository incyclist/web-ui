import React, { useEffect, useRef, useState } from "react"
import { WorkoutDetails } from "./component"
import { useWorkoutList } from "incyclist-services"
import { copyPropsExcluding } from "../../../../../utils/props"

export const WorkoutDetailsDialog = (props) => {
    const {onStart,onSelect,onCancel, card} = props
    const service = useWorkoutList()

    const [initialized,setInitialized] = useState(false)
    const [workout,setWorkout] = useState(card.getData())
    const [settings,setSettings] = useState({})
    const propsRef = useRef()

    useEffect( ()=>{
        if(initialized)
            return;

        const props = propsRef.current = card.openSettings()
        const settingsFromService = props.settings

        setInitialized(true)        
        setSettings(settingsFromService)


    },[card, initialized])


    const onStartHandler = (data) => {
        const settings = {...data}        
        card.select(settings)
        setInitialized(false)
        setWorkout(null)
        if (onStart)
            onStart(card,data)        

    }

    const onSelectHandler = (data) => {
        const settings = {...data}
        card.select(settings)
        setInitialized(false)
        setWorkout(null)
        if (onSelect)
            onSelect(card,data)        

    }

    const onCancelHandler = (data) =>  {
        setInitialized(false)
        setWorkout(null)
        if (onCancel)
            onCancel()        
    }

    const onCategorySelectedHandler = (category, create) => {

        
        if (create) {
            service.addList(category)
        }
        card.move(category)
    }

    const childProps = copyPropsExcluding(propsRef.current??{},[])
    const args = {workout, ...settings,...childProps}

    if(!initialized || !workout)
        return null;


    return <WorkoutDetails {...args} 
    onStart={ onStartHandler} onCancel={onCancelHandler} onSelect={onSelectHandler} onCategorySelected={onCategorySelectedHandler}
    />


}