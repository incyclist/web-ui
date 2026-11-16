import React, { useCallback, useEffect, useState } from "react"
import { getWorkoutListPageService } from "incyclist-services"
import { WorkoutDetailsDialogView } from "./WorkoutDetailsDialogView"

/**
 * Details dialog of a workout. Reads everything from the workout list page service and reports all
 * user actions back to it - no domain service access.
 *
 * @param id  id of the workout (or scheduled entry) to be shown
 */
export const WorkoutDetailsDialog = ({ id }) => {

    const service = getWorkoutListPageService()
    const [details, setDetails] = useState(() => service.getWorkoutDetailsProps(id))

    const refresh = useCallback(() => {
        setDetails(service.getWorkoutDetailsProps(id))
    }, [service, id])

    useEffect(() => {
        refresh()
        const observer = service.getPageObserver?.()
        observer?.on('page-update', refresh)
        return () => { observer?.off?.('page-update', refresh) }
    }, [service, refresh])

    const onDelete = async () => {
        const deleted = await service.onDelete(id)
        if (deleted)
            service.onCloseDetails()
    }

    if (!details)
        return null

    return <WorkoutDetailsDialogView
        {...details}
        onStart={() => service.onStartFromDetails(id)}
        onCancel={() => service.onCloseDetails()}
        onDelete={onDelete}
        onAddRoute={() => service.onAddRoute(id)}
        onClearRoute={() => service.onClearRouteSelection()}
        onFtpChange={(ftp) => service.onSetFtp(ftp)}
        onErgModeChange={(enabled) => service.onSetErgMode(enabled)}
        onStepChangeAudioSignalChange={(enabled) => service.onSetStepChangeAudioSignal(enabled)}
        onGroupChange={(group) => service.onChangeGroup(id, group)}
    />
}
