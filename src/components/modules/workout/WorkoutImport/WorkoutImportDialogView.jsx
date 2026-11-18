import React, { useCallback } from 'react'
import styled from 'styled-components'
import { Button, ButtonBar, ErrorText, ImportIcon, Loader } from '../../../atoms'
import { Dialog, Dropzone, WorkoutGraph } from '../../../molecules'
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
    result: 'Import Successful',
    error: 'Import Failed',
}

const TileArea = styled.div`
    display: flex;
    align-items: stretch;
    justify-content: center;
    width: 100%;
    height: calc(100% - 7.7vh);
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

const SUCCESS_COLOR = '#4CAF50'
const ERROR_COLOR = '#D32F2F'
const DEFAULT_GROUP = 'My Workouts'

// centred panel (importing, error, result without graph)
const Body = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100% - 7.7vh);
    text-align: center;
    padding: 2vh 2vw;
    box-sizing: border-box;
    gap: 2vh;
    font-size: 2vh;
`

// result with graph: header, category, graph
const ResultBody = styled.div`
    display: flex;
    flex-direction: column;
    height: calc(100% - 7.7vh);
    padding: 2vh 2vw;
    box-sizing: border-box;
    font-size: 2vh;
`

const HeaderRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5vw;
    margin-bottom: 1.5vh;
    font-size: 2vh;
    color: white;
`

const CategoryRow = styled.div`
    align-self: ${props => props.$center ? 'center' : 'flex-start'};
    margin-bottom: 1vh;
    text-align: left;

    /* keep the selected value readable regardless of the colour inherited from the dialog */
    select, option {
        color: #000;
        background-color: #fff;
    }
`

const GraphArea = styled.div`
    flex: 1;
    width: 100%;
    min-height: 20vh;
`

const StatusCircle = styled.div`
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: ${props => props.$large ? '12vh' : '2.8vh'};
    height: ${props => props.$large ? '12vh' : '2.8vh'};
    border: ${props => props.$large ? '0.6vh' : '0.2vh'} solid ${props => props.$color};
    border-radius: 50%;
    color: ${props => props.$color};
    font-weight: bold;
    font-size: ${props => props.$large ? '7vh' : '1.6vh'};
    line-height: 1;
`

const StatusText = styled.div`
    font-size: 2vh;
    color: white;
`

const SuccessCircle = ({ large }) => (
    <StatusCircle $large={large} $color={SUCCESS_COLOR} data-testid="status-success">
        <ImportIcon size={large ? '7vh' : '1.6vh'} />
    </StatusCircle>
)

const ErrorCircle = () => (
    <StatusCircle $large $color={ERROR_COLOR} data-testid="status-error">!</StatusCircle>
)

const Landing = ({ onFiles, onCancel }) => {
    const onDrop = useCallback((dropInfo) => {
        const files = (Array.isArray(dropInfo) ? dropInfo : [dropInfo]).filter(Boolean)
        if (files.length > 0)
            onFiles?.(files)
    }, [onFiles])

    return (
        <>
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
        <ButtonBar justify="center">
            <Button text="Cancel" onClick={onCancel} />
        </ButtonBar>
        </>
    )
}

const Importing = ({ fileName, onCancel }) => (
    <>
        <Body>
            <Loader />
            <StatusText>{`Importing ${fileName ?? ''}…`}</StatusText>
        </Body>
        <ButtonBar justify="center">
            <Button text="Cancel" onClick={onCancel} />
        </ButtonBar>
    </>
)

const hasSteps = (workout) => Array.isArray(workout?.steps) && workout.steps.length > 0

const Result = ({ result, knownGroups, onSetGroup, onPickAnother, onDone }) => {
    const message = `"${result?.workoutName ?? ''}" has been added to your library`
    const category = (
        <WorkoutCategorySelect
            value={result?.group ?? DEFAULT_GROUP}
            groups={knownGroups}
            onChange={onSetGroup}
            labelWidth="12ch"
            labelPosition="before"
        />
    )
    const buttons = (
        <ButtonBar justify="center">
            <Button text="Import more" primary={false} onClick={onPickAnother} />
            <Button text="Done" primary onClick={onDone} />
        </ButtonBar>
    )

    if (!hasSteps(result?.workout)) {
        return (
            <>
                <Body>
                    <SuccessCircle large />
                    <StatusText>{message}</StatusText>
                    <CategoryRow $center>{category}</CategoryRow>
                </Body>
                {buttons}
            </>
        )
    }

    return (
        <>
            <ResultBody>
                <HeaderRow>
                    <SuccessCircle />
                    <div>{message}</div>
                </HeaderRow>
                <CategoryRow>{category}</CategoryRow>
                <GraphArea>
                    <WorkoutGraph workout={result.workout} ftp={result.ftp ?? 200} />
                </GraphArea>
            </ResultBody>
            {buttons}
        </>
    )
}

const Failed = ({ error, onPickAnother, onClose }) => (
    <>
        <Body>
            <ErrorCircle />
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
            content = <Result result={result} knownGroups={knownGroups} onSetGroup={onSetGroup} onPickAnother={onPickAnother} onDone={close('done')} />
            break
        case 'error':
            content = <Failed error={error} onPickAnother={onPickAnother} onClose={close('close')} />
            break
        default:
            content = <Landing onFiles={onFiles} onCancel={close('cancel')} />
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
