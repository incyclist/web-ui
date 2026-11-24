import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { PlusIcon } from "@primer/octicons-react"
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
import { ScheduledWorkoutCard } from "../../components/modules/workout/selection/ScheduledWorkoutCard"
import { TILE_WIDTH, TILE_HEIGHT, WorkoutCardSkeleton } from "../../components/modules/workout/selection/base/atoms"

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const PAGE_UP = 'PageUp'
const PAGE_DOWN = 'PageDown'

const ROW_STEP_VH = { list: 9, tiles: 32 }
const FOLD_ROOT_MARGIN = '400px 0px'

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
    background-color: ${p => p.theme?.card?.dropOverlayBackground};
    border-width: 3px;
    border-color: ${p => p.theme?.card?.dropOverlayBorder};
    border-radius: 8px;
    color: ${p => p.theme?.title?.text};
`

const DropOverlayTitle = styled.div`
    font-size: 2.4vh;
    font-weight: bold;
`

// Header, one row, three slots mirroring RouteListScreen: Create Workout (left) / title (center) / Import Workout (right).
const HeaderLayout = styled.div`
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-areas: "create title import";
    align-items: center;
    row-gap: 1vh;
    width: 100%;
    @media (max-width: 700px) {
        grid-template-columns: 1fr 1fr;
        grid-template-areas: "title title" "create import";
    }
`

const HeaderSlot = styled.div`
    display: flex;
    width: max-content;
    grid-area: ${p => p.$area};
    justify-self: ${p => p.$end ? 'end' : 'start'};
`

const TitleCell = styled.div`
    grid-area: title;
    white-space: nowrap;
    @media (max-width: 700px) {
        width: 100%;
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
    color: ${p => p.theme?.title?.text};
`

export const WORKOUT_DROP_OVERLAY_TITLE = 'Drop a workout file (ZWO or JSON)'

const CreateWorkoutButton = ({ onClick }) => (
    <Button id='createWorkout' outline no3D margin='0' onClick={onClick}>
        <HeaderButtonContent><PlusIcon size={16} />Create Workout</HeaderButtonContent>
    </Button>
)

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
    color: ${p => p.theme?.title?.text};
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
    color: ${p => p.theme?.title?.text};
    text-shadow: 0 2px 10px ${p => p.theme?.card?.textShadow};
`

const StateTitle = styled.div`
    font-size: 3vh;
    font-weight: bold;
    color: ${p => p.theme?.title?.text};
    text-align: center;
`

const StateText = styled(Text)`
    max-width: 60ch;
    margin: 1vh 0 1vh 0;
    font-size: 2vh;
    white-space: normal;
`

const CARD_COMPONENTS = {
    Workout: WorkoutCard,
    ScheduledWorkout: ScheduledWorkoutCard
}

/**
 * Shared two-way fold windowing for a multi-section scrollable container using a single
 * IntersectionObserver. Cards outside the viewport + overscan margin render a sized skeleton
 * instead of mounting heavy WorkoutGraph SVGs all at once.
 */
const useViewportFold = (rootEl) => {
    const callbacksRef = useRef(new Map())
    const observerRef = useRef(null)

    useEffect(() => {
        if (!rootEl || typeof IntersectionObserver === 'undefined') {
            observerRef.current = null
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const cb = callbacksRef.current.get(entry.target)
                    cb?.(entry.isIntersecting)
                })
            },
            { root: rootEl, rootMargin: FOLD_ROOT_MARGIN, threshold: 0 }
        )

        observerRef.current = observer
        callbacksRef.current.forEach((_cb, el) => observer.observe(el))

        return () => {
            observer.disconnect()
            observerRef.current = null
        }
    }, [rootEl])

    return useCallback((el, onChange) => {
        if (!el || typeof IntersectionObserver === 'undefined')
            return () => {}

        callbacksRef.current.set(el, onChange)
        observerRef.current?.observe(el)

        return () => {
            callbacksRef.current.delete(el)
            observerRef.current?.unobserve(el)
        }
    }, [])
}

const WorkoutFoldItem = ({ isList, observe, children }) => {
    const [inFold, setInFold] = useState(() => typeof IntersectionObserver === 'undefined')
    const itemRef = useRef(null)

    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined')
            return
        return observe(itemRef.current, setInFold)
    }, [observe, isList])

    const ItemWrapper = isList ? RowItem : TileItem
    const itemClassName = isList ? 'item workout-row' : 'item workout-tile'

    return (
        <ItemWrapper ref={itemRef} className={itemClassName}>
            {inFold ? children : <WorkoutCardSkeleton list={isList} />}
        </ItemWrapper>
    )
}

const WorkoutList = ({ list, displayType, observe, onOK, onDelete }) => {

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

        return (
            <WorkoutFoldItem key={card.id} isList={isList} observe={observe}>
                <Card
                    {...content}
                    observer={card.observer}
                    layout={isList ? 'list' : 'tiles'}
                    category={header}
                    onOK={onOK ? () => { onOK(card.id) } : undefined}
                    onDelete={onDelete ? () => { onDelete(card.id) } : undefined}
                />
            </WorkoutFoldItem>
        )
    }).filter(Boolean), [cardData, header, isList, observe, onOK, onDelete])

    if (cards.length === 0)
        return null

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
    onCreateWorkout,
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
    const [scrollContainer, setScrollContainer] = useState(null)

    const setListRef = useCallback((el) => {
        refDiv.current = el
        setScrollContainer(el)
    }, [])

    const observeFold = useViewportFold(scrollContainer)

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

    const hasRenderableWorkouts = useMemo(
        () => allLists.some(list => (list.cards ?? []).some(card => Boolean(CARD_COMPONENTS[card.cardType]))),
        [allLists]
    )

    const renderContent = () => {
        if (loading)
            return <Center><Loader /></Center>

        return (
            <>
                {allLists.map(list => (
                    <WorkoutList
                        key={list.id}
                        list={list}
                        displayType={displayType}
                        observe={observeFold}
                        onOK={onOK}
                        onDelete={onDelete}
                    />
                ))}
                {!hasRenderableWorkouts ? (
                    <StateArea className='empty-workouts'>
                        <StateTitle>No workouts yet</StateTitle>
                        <StateText align='center' text='Create a workout, import a workout file (.zwo or .json), or drop it anywhere on this page.' />
                    </StateArea>
                ) : null}
            </>
        )
    }

    return (
        <MainPage>
            <AppThemeProvider>
                <View>
                    <NavigationBar closePage={closePage} selected='workouts' />

                    <ContentArea width='100%' className='workouts-page'
                        onDragEnterCapture={onContentDragEnterCapture} onDragOverCapture={onContentDragOverCapture}
                        onDragLeaveCapture={onContentDragLeaveCapture} onDropCapture={onContentDropCapture}>
                        <HeaderLayout className='workouts-header'>
                            <HeaderSlot className='workouts-create' $area='create'>
                                <CreateWorkoutButton onClick={onCreateWorkout} />
                            </HeaderSlot>
                            <TitleCell><PageTitle>Workouts</PageTitle></TitleCell>
                            <HeaderSlot className='workouts-import' $area='import' $end>
                                <ImportWorkoutButton onClick={onImportWorkout} />
                            </HeaderSlot>
                        </HeaderLayout>

                        <Toolbar className='workouts-toolbar'>
                            <DisplayTypeSelection selected={displayType} onSelected={onDisplayTypeSelected} />
                        </Toolbar>

                        <ListContainer ref={setListRef} tabIndex={-1} className='workouts-list-scroll'>
                            {renderContent()}
                        </ListContainer>

                        {dragActive && dropEnabled ?
                            <DropOverlay className='workout-drop-overlay' width='100%' height='100%'
                                multiple filters={WORKOUT_IMPORT_FILTERS} onDrop={onOverlayDrop}
                                text={<DropOverlayTitle>{WORKOUT_DROP_OVERLAY_TITLE}</DropOverlayTitle>} />
                            : null}
                    </ContentArea>
                </View>
            </AppThemeProvider>
        </MainPage>
    )
}
