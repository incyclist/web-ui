import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Button, ButtonBar, CheckBox, Column, Divider, EditNumber, Row, Text } from "../../../../atoms"
import { AttachmentChip, Dialog, MessageBox, WorkoutGraph } from "../../../../molecules"
import { WorkoutCategorySelect } from "../WorkoutCategorySelect"

const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
    width: calc(100% - 0.8vw);
    padding-left:0.4vw;
    padding-right:0.4vw;
`

const styling = { labelWidth: '12ch', labelPosition: 'before' }

/**
 * Pure view of the workout details dialog. All data comes in via props, all user actions are
 * reported through callbacks - no service access.
 */
export const WorkoutDetailsDialogView = ({
    title, workout, description, duration, stress,
    ftp, ftpRequired, useErgMode, stepChangeAudioSignal,
    group, groups, isScheduled, date,
    attachedRoute, canDelete, canAddRoute,
    onStart, onCancel, onDelete, onAddRoute, onClearRoute,
    onFtpChange, onErgModeChange, onStepChangeAudioSignalChange, onGroupChange
}) => {

    const [state, setState] = useState({ ftp, useErgMode, stepChangeAudioSignal, confirmDelete: false })

    // keep local (optimistic) values in sync when the page service pushes new values
    useEffect(() => { setState(c => ({ ...c, ftp })) }, [ftp])
    useEffect(() => { setState(c => ({ ...c, useErgMode })) }, [useErgMode])
    useEffect(() => { setState(c => ({ ...c, stepChangeAudioSignal })) }, [stepChangeAudioSignal])

    const isScheduledEntry = isScheduled ?? !!date
    const dateStr = date?.toLocaleDateString?.()

    const onFtpChanged = (value) => {
        setState(c => ({ ...c, ftp: value }))
        onFtpChange?.(value)
    }
    const onErgModeChanged = (value) => {
        setState(c => ({ ...c, useErgMode: value }))
        onErgModeChange?.(value)
    }
    const onAudioChanged = (value) => {
        setState(c => ({ ...c, stepChangeAudioSignal: value }))
        onStepChangeAudioSignalChange?.(value)
    }
    const onDeleteClicked = () => setState(c => ({ ...c, confirmDelete: true }))
    const onDeleteNo = () => setState(c => ({ ...c, confirmDelete: false }))
    const onDeleteYes = () => {
        setState(c => ({ ...c, confirmDelete: false }))
        onDelete?.()
    }

    return (
        <>
            <Dialog id='WorkoutDetails' log={{ title: workout?.name }} title={title || workout?.name || 'Workout Details'}
                width="80vw" height="80vh" zIndex={100} onESC={onCancel}>
                <ContentArea>
                    {attachedRoute ?
                        <AttachmentChip label='Route' name={attachedRoute.title} margin='0.4vw' onClear={onClearRoute} />
                        : null}
                    <Row margin='0.5vh 0 0.5vh 0'>{description ?? workout?.description}</Row>
                    <Divider width='95%' />
                    <Text margin='0.5vh 0 0 0 ' {...styling} label='Duration' text={duration || 'unknown'} />
                    {stress !== undefined ? <Text {...styling} label='Stress' text={stress || 'unknown'} /> : null}
                    {ftpRequired ? <EditNumber {...styling} label='FTP' value={state.ftp ?? 200} digits={0} min={0} max={999} onValueChange={onFtpChanged} /> : null}

                    {isScheduledEntry ? <Text {...styling} label='Date' text={dateStr} /> :
                        <WorkoutCategorySelect {...styling} value={group} groups={groups} onChange={onGroupChange} />
                    }

                    <CheckBox {...styling} label='Use ERG Mode' value={state.useErgMode} onValueChange={onErgModeChanged} />
                    <CheckBox {...styling} label='Audio Step-Change Signal' value={state.stepChangeAudioSignal} onValueChange={onAudioChanged} />

                    <Row height='100%' width='100%' className="graph">
                        <WorkoutGraph workout={workout} ftp={state.ftp ?? 200} />
                    </Row>
                </ContentArea>
                <ButtonBar justify='center'>
                    <Button text='Cancel' primary={false} onClick={onCancel} />
                    {canDelete ? <Button text='Delete' primary={false} onClick={onDeleteClicked} /> : null}
                    {canAddRoute ? <Button text='Add Route' primary={false} onClick={onAddRoute} /> : null}
                    <Button text='Start' primary={true} onClick={onStart} />
                </ButtonBar>
            </Dialog>

            {state.confirmDelete ?
                <MessageBox title='Delete Workout' id='DeleteWorkout' defaultButton='No'
                    text='This will permanently delete this workout. Are you sure?'
                    onYes={onDeleteYes} onNo={onDeleteNo} />
                : null}
        </>
    )
}
