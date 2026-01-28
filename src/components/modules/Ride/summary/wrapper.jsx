import React, { useEffect, useRef, useState } from 'react'
import { useActivityRide } from 'incyclist-services';
import { ActivitySummaryView } from './ActivitySummary';
import { EventLogger } from 'gd-eventlog';

export const DynamicActivitySummary = ({onExit,onNew,onContinue})=> {

    const service = useActivityRide()
    const [isSaving,setIsSaving] = useState(false)
    const [initialized,setInitialized] = useState(false)

    const propsRef = useRef({})

    useEffect( ()=>{
        const onSave = async () => {

            try {
                const observer = service.save()
                getDisplayProperties();
                setIsSaving(true);

                await observer.wait()

                getDisplayProperties();
            }
            catch(err) {
                const logger = new EventLogger('ActivitySummary')
                logger.logEvent({message:'error in component', component:'ActivitySummary', error:err.message, stack:err.stack})
            }                
                setIsSaving(false);                
        };

        const onChangeTitle = (newTitle) =>{
            service.changeTitle(newTitle)
            getDisplayProperties();
        }
    
        const getDisplayProperties = ()=>{
            propsRef.current = service.getActivitySummaryDisplayProperties()
    
            propsRef.current.onSave = onSave
            propsRef.current.onExit = onExit
            propsRef.current.onNew = onNew
            propsRef.current.onContinue = onContinue
            propsRef.current.onTitleChange = onChangeTitle

            if (propsRef.current.showDonate) {
                propsRef.current.onDonateClicked = () => {
                    service.onDonateClicked()
                }
            }
        }
    
        if (initialized)
            return
            
        getDisplayProperties()
        setInitialized(true)
    },[initialized, service, onExit, onContinue, onNew])

    
    return <ActivitySummaryView {...propsRef.current} isSaving={isSaving} />
}