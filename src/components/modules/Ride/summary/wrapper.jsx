import React, { useEffect, useRef, useState } from 'react'
import { useActivityRide } from 'incyclist-services';
import { ActivitySummaryView } from './ActivitySummary';
import { EventLogger } from 'gd-eventlog';

export const DynamicActivitySummary = ({onExit,onNew,onContinue})=> {

    const service = useActivityRide()
    const [isSaving,setIsSaving] = useState(false)
    const [showDeleteConfirm,setShowDeleteConfirm] = useState(false)
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

        const onDelete = () => {
            setShowDeleteConfirm(true)
        };

        const onDeleteConfirm = async () => {
            setShowDeleteConfirm(false)
            try {
                await service.delete()
                // same as "New Ride": leaves the ride and navigates on - there's nothing left to
                // save/continue once the activity has been deleted
                onNew()
            }
            catch(err) {
                const logger = new EventLogger('ActivitySummary')
                logger.logEvent({message:'error in component', component:'ActivitySummary', error:err.message, stack:err.stack})
            }
        };

        const onDeleteCancel = () => {
            setShowDeleteConfirm(false)
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
            propsRef.current.onDelete = onDelete
            propsRef.current.onDeleteConfirm = onDeleteConfirm
            propsRef.current.onDeleteCancel = onDeleteCancel
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


    return <ActivitySummaryView {...propsRef.current} isSaving={isSaving} showDeleteConfirm={showDeleteConfirm} />
}