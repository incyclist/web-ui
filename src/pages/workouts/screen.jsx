import React, { useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import MainPage from "../../components/molecules/MainPage"
import { PageTitle, Loader, Center, Button, Text } from "../../components/atoms"
import { ImportIcon } from "../../components/atoms/Icons/ImportIcon"
import { Dropzone } from "../../components/molecules"
import { DisplayTypeSelection } from "../../components/molecules/Lists/DisplayTypeSelection"
import { WORKOUT_IMPORT_FILTERS } from "../../components/modules/workout/WorkoutImport/WorkoutImportDialogView"
import { Column, Row } from "../../components/atoms/layout/View"
import { useKey } from "../../hooks/ui/useKey"
import { AppThemeProvider } from "../../theme"
import { scrollbar } from "../../utils/scrollbar"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { WorkoutCard } from "../../components/modules/workout/selection/WorkoutCard"
import { WorkoutCreateCard } from "../../components/modules/workout/selection/CreateCard"
import { ScheduledWorkoutCard } from "../../components/modules/workout/selection/ScheduledWorkoutCard"
import { TILE_WIDTH, TILE_HEIGHT } from "../../components/modules/workout/selection/base/atoms"

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const PAGE_UP = 'PageUp'
const PAGE_DOWN = 'PageDown'

const ROW_STEP_VH = { list: 9, tiles: 32 }

const View = styled(Row)`
    width: 100%;
    height: 100%;
    overflow-y: hidden;
`

const ContentArea = styled(Column)`
    width: 100%;
    min-width: 0;
    user-select: none;
    height: 100%;
    padding-left: 40px;
    padding-right: 40px;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
    @media (max-width: 650px) {
        padding-left: 16px;
        padding-right: 16px;
    }
`

// page-level drop overlay, only rendered while a file is dragged over the page
const DropOverlay = styled(Dropzone)`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    margin: 0;
    z-index: 20;
    background-color: rgba(0,0,0,0.6);
    border-width: 3px;
    border-color: #dd9933;
    border-radius: 8px;
    color: white;
`

const DropOverlayTitle = styled.div`
    font-size: 2.4vh;
    font-weight: bold;
`

// title stays centred, the Import button sits on the right
const HeaderLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    row-gap: 1vh;
    width: 100%;
    @media (max-width: 650px) {
        grid-template-columns: 1fr;
        justify-items: center;
    }
`

const TitleCell = styled.div`
    grid-column: 2;
    white-space: nowrap;
    @media (max-width: 650px) {
        grid-column: 1;
        width: 100%;
    }
`

const ImportSlot = styled.div`
    grid-column: 3;
    justify-self: end;
    display: flex;
    @media (max-width: 650px) {
        grid-column: 1;
        justify-self: end;
    }
`

const HeaderButtonContent = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    flex-shrink: 0;
`

const Toolbar = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
    padding: 0.5vh 0 1vh 0;
    color: white;
`

export const WORKOUT_DROP_OVERLAY_TITLE = 'Drop a workout file (ZWO or JSON)'

const ImportWorkoutButton = ({ onClick }) => (
    <Button id='importWorkout' outline no3D margin='0' onClick={onClick}>
        <HeaderButtonContent><ImportIcon />Import Workout</HeaderButtonContent>
    </Button>
)

export const ListContainer = styled.div`
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding-bottom: 2vh;
    box-sizing: border-box;
    ${scrollbar}
`

const Section = styled.section`
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    width: 100%;
    margin-bottom: 2.5vh;
`

const SectionTitle = styled.h2`
    margin: 0 0 1.2vh 0;
    font-size: 2.4vh;
    line-height: 1.2;
    font-weight: 650;
    color: white;
    text-align: left;
`

const TilesContainer = styled.div`
    display: flex;
    flex-flow: row wrap;
    align-content: flex-start;
    gap: 1.5vh 1vw;
    width: 100%;
`

const TileItem = styled.div`
    position: relative;
    width: ${TILE_WIDTH}px;
    max-width: 100%;
    height: ${TILE_HEIGHT}px;
    flex: none;
    z-index: 0;
    &:hover, &:focus-within { z-index: 1; }
`

const RowsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
`

const RowItem = styled.div`
    width: 100%;
`

const StateArea = styled(Column)`
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    text-align: center;
    color: white;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.65);
`

const StateTitle = styled.div`
    font-size: 3vh;
    font-weight: bold;
    color: white;
    text-align: center;
`

const StateText = styled(Text)`
    max-width: 60ch;
    margin: 1vh 0 1vh 0;
    font-size: 2vh;
    white-space: normal;
`

const CARD_COMPONENTS = {
    WorkoutCreate: WorkoutCreateCard,
    Workout: WorkoutCard,
    ScheduledWorkout: ScheduledWorkoutCard
}

const WorkoutList = ({ list, displayType, onOK, onDelete }) => {

    const [cardData, setCardData] = useState(list.cards)

    // the page service hands out a fresh cards array on every page update
    useEffect(() => { setCardData(list.cards) }, [list.cards])

    useEffect(() => {
        const observer = list.observer
        if (!observer)
            return
        const onUpdate = (cards) => { if (Array.isArray(cards)) setCardData(cards) }
        observer.on('update', onUpdate)
        return () => { observer.off('update', onUpdate) }
    }, [list.observer])

    const isList = displayType === 'list'
    const header = list.title

    const cards = useMemo(() => (cardData ?? []).map((card) => {
        const Card = CARD_COMPONENTS[card.cardType]
        if (!Card)
            return null

        const { observer, selected, ...content } = card.props ?? {}
        const ItemWrapper = isList ? RowItem : TileItem
        const itemClassName = isList ? 'item workout-row' : 'item workout-tile'

        return (
            <ItemWrapper className={itemClassName} key={card.id}>
                <Card
                    {...content}
                    observer={card.observer}
                    layout={isList ? 'list' : 'tiles'}
                    category={header}
                    onOK={onOK ? () => { onOK(card.id) } : undefined}
                    onDelete={onDelete ? () => { onDelete(card.id) } : undefined}
                />
            </ItemWrapper>
        )
    }).filter(Boolean), [cardData, header, isList, onOK, onDelete])

    const ItemsContainer = isList ? RowsContainer : TilesContainer
    const containerClass = isList ? 'workout-rows' : 'workout-tiles'

    return (
        <Section className={`list_${list.id}`}>
            {header ? <SectionTitle>{header}</SectionTitle> : null}
            <ItemsContainer className={containerClass}>
                {cards}
            </ItemsContainer>
        </Section>
    )
}

export const WorkoutsScreen = ({
    loading,
    lists,
    upcoming = null,
    displayType = 'tiles',
    onDisplayTypeSelected,
    onOK,
    closePage,
    onDelete,
    onImportWorkout,
    onDropFiles,
    dropEnabled = true
}) => {
    // upcoming (scheduled) workouts come first; keyed by list id so the section mounts/unmounts
    // cleanly (and releases its observer subscription) when it appears or disappears
    const allLists = useMemo(() => [...(upcoming ? [upcoming] : []), ...(lists ?? [])], [upcoming, lists])
    const refDiv = useRef(null)

    // --- page-level drop overlay (same mechanism as the Routes page) ---
    const dragDepth = useRef(0)
    const [dragActive, setDragActive] = useState(false)

    const onContentDragEnterCapture = (e) => {
        e.preventDefault()
        dragDepth.current += 1
        if (dragDepth.current === 1)
            setDragActive(true)
    }
    const onContentDragOverCapture = (e) => { e.preventDefault() }
    const onContentDragLeaveCapture = () => {
        dragDepth.current = Math.max(0, dragDepth.current - 1)
        if (dragDepth.current === 0)
            setDragActive(false)
    }
    const onContentDropCapture = (e) => {
        // an unhandled drop would navigate the window to the file. Hide the overlay only after the
        // event is fully dispatched, otherwise it unmounts before its own drop handler runs.
        e.preventDefault()
        setTimeout(() => {
            dragDepth.current = 0
            setDragActive(false)
        }, 0)
    }
    const onOverlayDrop = (dropInfo) => {
        if (typeof onDropFiles === 'function')
            onDropFiles(Array.isArray(dropInfo) ? dropInfo : [dropInfo])
    }

    const scroll = (direction, page) => {
        const div = refDiv.current
        if (!div)
            return

        const step = page
            ? (div.clientHeight || window.innerHeight * 0.6)
            : window.innerHeight * (ROW_STEP_VH[displayType] ?? ROW_STEP_VH.tiles) / 100
        const top = direction * step

        div.focus?.()
        if (typeof div.scrollBy === 'function')
            div.scrollBy({ left: 0, top, behavior: 'smooth' })
        else
            div.scrollTop = (div.scrollTop ?? 0) + top
    }

    const onKey = (info) => {
        switch (info.code) {
            case UP: scroll(-1, false); break
            case PAGE_UP: scroll(-1, true); break
            case DOWN: scroll(1, false); break
            case PAGE_DOWN: scroll(1, true); break
            default: return
        }
    }

    useKey([UP, DOWN, PAGE_UP, PAGE_DOWN], onKey)

    const renderContent = () => {
        if (loading)
            return <Center><Loader /></Center>

        if (allLists.length === 0) {
            return (
                <StateArea className='empty-workouts'>
                    <StateTitle>No workouts yet</StateTitle>
                    <StateText align='center' color='white' text='Import a workout file (.zwo or .json) or drop it anywhere on this page.' />
                </StateArea>
            )
        }

        return allLists.map(list => (
            <WorkoutList
                key={list.id}
                list={list}
                displayType={displayType}
                onOK={onOK}
                onDelete={onDelete}
            />
        ))
    }

    return (
        <MainPage>
            <View>
                <NavigationBar closePage={closePage} selected='workouts' />

                <ContentArea width='100%' className='workouts-page'
                    onDragEnterCapture={onContentDragEnterCapture} onDragOverCapture={onContentDragOverCapture}
                    onDragLeaveCapture={onContentDragLeaveCapture} onDropCapture={onContentDropCapture}>
                    <HeaderLayout className='workouts-header'>
                        <TitleCell><PageTitle>Workouts</PageTitle></TitleCell>
                        <ImportSlot><ImportWorkoutButton onClick={onImportWorkout} /></ImportSlot>
                    </HeaderLayout>

                    <Toolbar className='workouts-toolbar'>
                        <DisplayTypeSelection selected={displayType} onSelected={onDisplayTypeSelected} />
                    </Toolbar>

                    <AppThemeProvider>
                        <ListContainer ref={refDiv} tabIndex={-1} className='workouts-list-scroll'>
                            {renderContent()}
                        </ListContainer>
                    </AppThemeProvider>

                    {dragActive && dropEnabled ?
                        <DropOverlay className='workout-drop-overlay' width='100%' height='100%'
                            multiple filters={WORKOUT_IMPORT_FILTERS} onDrop={onOverlayDrop}
                            text={<DropOverlayTitle>{WORKOUT_DROP_OVERLAY_TITLE}</DropOverlayTitle>} />
                        : null}
                </ContentArea>
            </View>
        </MainPage>
    )
}
