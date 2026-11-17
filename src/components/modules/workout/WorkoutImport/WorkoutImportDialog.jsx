import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getWorkoutListPageService } from 'incyclist-services'
import { EventLogger } from 'gd-eventlog'
import { ErrorBoundary } from '../../../atoms'
import { WorkoutImportDialogView } from './WorkoutImportDialogView'

const logger = new EventLogger('WorkoutImportDialog')

/**
 * Smart import dialog. The phase and its data come from the workout list page service
 * (`getImportDisplayProps()`, refreshed on every 'import-update'), the dialog only reports user actions.
 *
 * The parent owns the open/closed state: it mounts this component to open the dialog and
 * unmounts it from `onClose`. Every way out (Done, Close, Cancel, Esc, outside click, unmount)
 * ends the import flow in the service exactly once.
 *
 * props: `source` ('button' | 'page-drop', used for logging only), `onClose`
 */
export const WorkoutImportDialog = ({ source, onClose }) => {
    const service = getWorkoutListPageService()
    const [displayProps, setDisplayProps] = useState(() => service.getImportDisplayProps())

    const refPhase = useRef(displayProps?.phase)
    const refClosed = useRef(false)
    refPhase.current = displayProps?.phase

    useEffect(() => {
        logger.logEvent({ message: 'dialog opened', source, phase: refPhase.current })
    }, [source])

    useEffect(() => {
        const observer = service.getPageObserver()
        const onUpdate = () => { setDisplayProps(service.getImportDisplayProps()) }

        observer?.on('import-update', onUpdate)
        return () => { observer?.off('import-update', onUpdate) }
    }, [service])

    const finish = useCallback((action) => {
        if (refClosed.current)
            return false
        refClosed.current = true
        logger.logEvent({ message: 'dialog closed', phase: refPhase.current, action })
        service.onImportClose()
        return true
    }, [service])

    // unmounted by the parent without a close action (e.g. navigation)
    useEffect(() => () => { finish('unmount') }, [finish])

    const handleClose = useCallback((action) => {
        if (finish(action))
            onClose?.()
    }, [finish, onClose])

    const onFiles = useCallback((files) => { service.onImportFiles(files, 'dialog') }, [service])
    const onPickAnother = useCallback(() => { service.onImportOpen() }, [service])
    const onSetGroup = useCallback((group) => {
        const result = service.getImportDisplayProps()?.result ?? displayProps?.result
        if (!result)
            return
        const isNew = !(displayProps?.knownGroups ?? []).includes(group)
        logger.logEvent({ message: 'import group changed', group, isNew, eventSource: 'user' })
        service.onImportSetGroup(result.id, group)
    }, [service, displayProps])

    return (
        <ErrorBoundary>
            <WorkoutImportDialogView
                displayProps={displayProps}
                onClose={handleClose}
                onFiles={onFiles}
                onPickAnother={onPickAnother}
                onSetGroup={onSetGroup}
            />
        </ErrorBoundary>
    )
}
