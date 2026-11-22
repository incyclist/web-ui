import React, { useCallback, useEffect, useRef, useState } from "react"
import { useLocation } from "react-router"
import { getWorkoutListPageService } from "incyclist-services"
import styled from "styled-components"

import { WorkoutsScreen } from "./screen"
import { usePageLogger } from "../../hooks"
import { usePageService } from "../../hooks/pages"
import { WorkoutDetailsDialog } from "../../components/modules/workout/selection/WorkoutDetails"
import { WorkoutImportDialog } from "../../components/modules/workout/WorkoutImport"
import { ScheduledWorkoutPrompt } from "../../components/modules/workout/ScheduledWorkoutPrompt"
import { Button, CheckBox, Column, Row, Overlay } from "../../components/atoms"
import { MessageBox } from "../../components/molecules"

const PAGE_ID = 'WorkoutsList'

const List = styled.ol`
    padding: 0;
    margin: 0.5vh 0 0 0;
`

const CheckBoxRow = styled(Row)`
    bottom: 0;
`

const CreateInfoOverlay = ({ markAsSeenDefault, onClose }) => {
    const [markAsSeen, setMarkAsSeen] = useState(markAsSeenDefault ?? true)

    return <Overlay width='40vw' height='30vh' top='35vh' left='30vw'>
        <Column justify='center' position='relative'>

            <Row align='top' justify='center' height='5vh'>
                <b>These are the steps to create a workout:</b>
            </Row>
            <Row justify='center' align='center' height='18vh'>
                <Column>
                    <List type='1'>
                        <li> Click OK to open the ZwoFactory page </li>
                        <li> Within ZwoFactory, create or select a pre-defined workout</li>
                        <li> Within ZwoFactory, download the workout using the Download button </li>
                        <li> Go back to Incyclist and import the workout using the Import Workout button </li>
                    </List>
                </Column>
            </Row>
            <Row justify='center' height='7vh'>
                <Button text='OK' onClick={() => onClose(markAsSeen)} />
            </Row>

            <CheckBoxRow justify='left' height='3vh' position='absolute' align='bottom' bottom='0'>
                <CheckBox label='Do not show again' value={markAsSeen} onValueChange={(checked) => setMarkAsSeen(checked)} />
            </CheckBoxRow>

        </Column>
    </Overlay>
}

export const WorkoutsPage = () => {

    const service = getWorkoutListPageService()
    const props = usePageService(service)
    const location = useLocation()

    const [pageState, setPageState] = useState(null)
    const refAutoOpened = useRef(null)
    const [importOpen, setImportOpen] = useState(false)
    const [importSource, setImportSource] = useState(null)
    const [confirmDeleteId, setConfirmDeleteId] = useState(null)

    const [, closePageLogger] = usePageLogger(PAGE_ID, pageState)

    useEffect(() => { setPageState('open') }, [])

    // opened from outside (e.g. scheduled-workout prompt): open the details dialog once per distinct id
    const autoOpenDetailsId = location?.state?.autoOpenDetailsId
    useEffect(() => {
        if (!autoOpenDetailsId || refAutoOpened.current === autoOpenDetailsId)
            return
        refAutoOpened.current = autoOpenDetailsId
        service.onOpenDetails(autoOpenDetailsId)
    }, [autoOpenDetailsId, service])

    const closePage = useCallback(() => { closePageLogger() }, [closePageLogger])

    const onOK = useCallback((id) => { service.onCardOK(id) }, [service])
    const onDelete = useCallback((id) => { setConfirmDeleteId(id) }, [])
    const onDeleteYes = useCallback(() => {
        const id = confirmDeleteId
        setConfirmDeleteId(null)
        if (id)
            service.onDelete(id)
    }, [confirmDeleteId, service])
    const onDeleteNo = useCallback(() => { setConfirmDeleteId(null) }, [])
    const onDisplayTypeSelected = useCallback((type) => { service.onDisplayTypeSelected(type) }, [service])

    const onImportWorkout = useCallback(() => {
        service.onImportOpen()
        setImportSource('button')
        setImportOpen(true)
    }, [service])

    // the service starts the import (or reports why it was rejected) before the dialog mounts,
    // so the dialog opens directly in the importing/error phase
    const onDropFiles = useCallback((files) => {
        service.onImportFiles(files, 'page-drop')
        setImportSource('page-drop')
        setImportOpen(true)
    }, [service])

    const onImportClose = useCallback(() => { setImportOpen(false) }, [])

    const { loading = true, lists = [], upcoming = null, displayType = 'tiles', detailWorkoutId, createInfo } = props ?? {}

    return <>
        <WorkoutsScreen
            lists={lists}
            upcoming={upcoming}
            displayType={displayType}
            loading={loading}
            closePage={closePage}
            onOK={onOK}
            onDelete={onDelete}
            onDisplayTypeSelected={onDisplayTypeSelected}
            onImportWorkout={onImportWorkout}
            onDropFiles={onDropFiles}
            dropEnabled={!importOpen && !confirmDeleteId}
        />

        {detailWorkoutId ? <WorkoutDetailsDialog id={detailWorkoutId} /> : null}

        {importOpen ? <WorkoutImportDialog source={importSource} onClose={onImportClose} /> : null}

        {confirmDeleteId ? (
            <MessageBox
                title='Delete Workout'
                id='DeleteWorkout'
                defaultButton='No'
                center
                text='This will permanently delete this workout. Are you sure?'
                onYes={onDeleteYes}
                onNo={onDeleteNo}
            />
        ) : null}

        <ScheduledWorkoutPrompt />

        {createInfo ? <CreateInfoOverlay markAsSeenDefault={createInfo.markAsSeenDefault}
            onClose={(markAsSeen) => service.onCreateInfoClosed(markAsSeen)} /> : null}
    </>
}
