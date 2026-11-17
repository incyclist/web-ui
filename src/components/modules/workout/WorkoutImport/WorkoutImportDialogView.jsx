import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Button, ButtonBar, ErrorText } from '../../../atoms'
import { Dialog, Dropzone } from '../../../molecules'
import { WorkoutCategorySelect } from '../selection/WorkoutCategorySelect'

// Same fixed box as the Import Routes dialog: one box for every phase, only the content changes
export const WORKOUT_IMPORT_DIALOG_WIDTH = 'min(980px, 70vw)'
export const WORKOUT_IMPORT_DIALOG_HEIGHT = 'min(660px, 75vh)'

export const WORKOUT_IMPORT_FILTERS = [
    { name: 'Workouts', extensions: ['zwo', 'json'] },
    { name: 'Zwift Workout', extensions: ['zwo'] },
    { name: 'Incyclist Workout', extensions: ['json'] },
]

const TITLES = {
    landing: 'Import Workout',
    importing: 'Importing...',
    result: 'Import Result',
    error: 'Import Failed',
}

const TileArea = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    height: calc(100% - 5vh);
    padding: 3vh 2vw 0 2vw;
    box-sizing: border-box;
`

const TileTitle = styled.div`
    font-size: 2.2vh;
    font-weight: bold;
    color: white;
`

const TileSubline = styled.div`
    font-size: 1.5vh;
    color: white;
    opacity: 0.8;
`

const TileContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1vh;
    padding: 2vh;
    text-align: center;
`

const Body = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100% - 7.7vh);
    text-align: center;
    padding: 2vh;
    box-sizing: border-box;
    gap: 2vh;
    font-size: 2vh;
`

const SelectWrapper = styled.div`
    width: 40ch;
    max-width: 100%;
    text-align: left;
`

const Landing = ({ onFiles }) => {
    const onDrop = useCallback((dropInfo) => {
        const files = (Array.isArray(dropInfo) ? dropInfo : [dropInfo]).filter(Boolean)
        if (files.length > 0)
            onFiles?.(files)
    }, [onFiles])

    return (
        <TileArea>
            <Dropzone
                id="workout-import-tile"
                width="100%"
                height="100%"
                multiple={false}
                filters={WORKOUT_IMPORT_FILTERS}
                onDrop={onDrop}
                text={
                    <TileContent>
                        <TileTitle>Choose Workout File</TileTitle>
                        <TileSubline>ZWO or JSON</TileSubline>
                    </TileContent>
                }
            />
        </TileArea>
    )
}

const Importing = ({ fileName, onCancel }) => (
    <>
        <Body>{fileName}</Body>
        <ButtonBar justify="center">
            <Button text="Cancel" onClick={onCancel} />
        </ButtonBar>
    </>
)

const Result = ({ result, knownGroups, onSetGroup, onDone }) => (
    <>
        <Body>
            <div>{`"${result?.workoutName ?? ''}" has been added to your library`}</div>
            <SelectWrapper>
                <WorkoutCategorySelect value={result?.group} groups={knownGroups} onChange={onSetGroup} />
            </SelectWrapper>
        </Body>
        <ButtonBar justify="center">
            <Button text="Done" primary onClick={onDone} />
        </ButtonBar>
    </>
)

const Failed = ({ error, onPickAnother, onClose }) => (
    <>
        <Body>
            <ErrorText text={error} size="2vh" />
        </Body>
        <ButtonBar justify="center">
            <Button text="Pick another file" primary onClick={onPickAnother} />
            <Button text="Close" onClick={onClose} />
        </ButtonBar>
    </>
)

/**
 * Pure view of the workout import dialog. The phase and its data come in via `displayProps`
 * (`phase`: landing | importing | result | error), all user actions are reported through
 * callbacks - no service access.
 *
 * `onClose(action)` reports how the dialog was dismissed:
 * 'done' | 'close' | 'cancel' | 'esc' | 'outside'.
 */
export const WorkoutImportDialogView = ({ displayProps, onClose, onFiles, onPickAnother, onSetGroup }) => {
    const { phase = 'landing', importing, result, error, knownGroups } = displayProps ?? {}

    const close = (action) => () => onClose?.(action)

    let content
    switch (phase) {
        case 'importing':
            content = <Importing fileName={importing?.fileName} onCancel={close('cancel')} />
            break
        case 'result':
            content = <Result result={result} knownGroups={knownGroups} onSetGroup={onSetGroup} onDone={close('done')} />
            break
        case 'error':
            content = <Failed error={error} onPickAnother={onPickAnother} onClose={close('close')} />
            break
        default:
            content = <Landing onFiles={onFiles} />
    }

    return (
        <Dialog
            id="WorkoutImport"
            title={TITLES[phase] ?? TITLES.landing}
            width={WORKOUT_IMPORT_DIALOG_WIDTH}
            height={WORKOUT_IMPORT_DIALOG_HEIGHT}
            onESC={close('esc')}
            onOutsideClicked={close('outside')}
        >
            {content}
        </Dialog>
    )
}
