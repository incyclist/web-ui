import React, {useEffect, useMemo, useRef, useState } from "react"
import MainPage from "../../components/molecules/MainPage"
import { PageTitle,GroupTitle, Loader, Center } from "../../components/atoms"
import styled from "styled-components"
import { Column, Row } from "../../components/atoms/layout/View"
import { useKey } from "../../hooks/ui/useKey"
import { useMouseSwipe } from "../../hooks/ui/useMouseSwipe"
import { Carousel } from "../../components/atoms/Carousel"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { AppThemeProvider } from "../../theme"
import { ActiveImportCard } from "../../components/modules/routeSelection/ActiveImportCard"
import {UploadCard} from '../../components/modules/workout/selection/UploadCard'
import {WorkoutCard} from '../../components/modules/workout/selection/WorkoutCard'
import { WorkoutCreateCard } from "../../components/modules/workout/selection/CreateCard"
import { ScheduledWorkoutCard } from "../../components/modules/workout/selection/ScheduledWorkoutCard"

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const PAGE_UP = 'PageUp'
const PAGE_DOWN = 'PageDown'

const View = styled(Row)`
   
    width: 100%;
    height: 100%;
    overflow-y: hidden;
`

const ContentArea = styled(Column)`
   
    width: ${props => props.width ||'100%'};
    user-select:none;    
    height: 100%;
    padding-left:40px;
    padding-right: 40px;
    overflow-y: hidden;
   
`

const CardView= styled(Row)`
    justify-content:center;
    user-select:none;
    padding-left: ${props=>props.distance}
    padding-right: ${props=>props.distance}
`

export const ListContainer = styled(View)`
    overflow-x: hidden;
    overflow-y: auto;
    display: block;
    
    &::-webkit-scrollbar-button {
        display: none;
    }

    &::-webkit-scrollbar {
        width: 2vw;
        display: none;
    }
      
      /* Track */
    &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 10px;
        display: none;
        
    }
    
    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: ${props => props.theme.list.hover.background};
        border-radius: 10px;
    }


`

const CARD_COMPONENTS = {
    WorkoutImport: UploadCard,
    ActiveWorkoutImport: ActiveImportCard,
    WorkoutCreate: WorkoutCreateCard,
    Workout: WorkoutCard,
    ScheduledWorkout: ScheduledWorkoutCard
}

const callback = (fn, listId, e) => {
    if (!fn)
        return
    fn(listId, e)
}

const WorkoutList = ({ list, cardSize, itemsFit, responsive, onOK, onDelete, onRetry,
    onInitialized, onUpdated, onSlideChange, onSlideChanged, setScrolling }) => {

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

    const cards = useMemo(() => (cardData ?? []).map((card) => {
        const Card = CARD_COMPONENTS[card.cardType]
        if (!Card)
            return null

        const { observer, selected, ...content } = card.props ?? {}   // selection is no longer part of the UI
        const innerSize = { ...(cardSize ?? {}) }
        innerSize.width = cardSize?.width - cardSize?.padding
        innerSize.padding = 0

        return <CardView className='item' key={card.id} distance={`${(cardSize?.padding ?? 0) / 2}px`}>
            <Card {...innerSize} {...content}
                observer={card.observer}
                hidden={!content.visible}
                onOK={onOK ? (...args) => { onOK(card.id, ...args) } : undefined}
                onDelete={onDelete ? () => { onDelete(card.id) } : undefined}
                onRetry={onRetry ? () => { onRetry(card.id) } : undefined}
            />
        </CardView>
    }).filter(Boolean), [cardData, cardSize, onOK, onDelete, onRetry])

    const header = list.title

    return (
        <Column className={`list_${list.id}`} >
            {header ?
                <Row>
                    <Column width='50px' />
                    <Column>
                        <GroupTitle>{header}</GroupTitle>
                    </Column>
                </Row>
                : null}

            <Row width='100%'>
                <Carousel cards={cards}
                    width='100%'
                    height={`${cardSize.height}px`} renderKey={itemsFit} responsive={responsive}
                    autoWidth={true}
                    onInitialized={(e) => { callback(onInitialized, list.id, e) }}
                    onSlideChange={(e) => { callback(onSlideChange, list.id, e); setScrolling(true) }}
                    onSlideChanged={(e) => { callback(onSlideChanged, list.id, e); setScrolling(false) }}
                    onUpdated={(e) => { callback(onUpdated, list.id, e) }}
                />
            </Row>
        </Column>
    )
}

export const WorkoutsScreen =
    // displayType: only the tile view exists for now; a list view and a toggle will follow in a separate UI change
    ({ loading, cardSize, offset = 0, responsive, itemsFit, width, height, lists, upcoming = null,
        // eslint-disable-next-line no-unused-vars
        displayType = 'tiles',
        onInitialized, onUpdated, onSlideChange, onSlideChanged, onOK, closePage, onDelete, onRetry }) => {
    const swipeDisabled = useRef(false);

    // upcoming (scheduled) workouts come first; keyed by list id so the section mounts/unmounts
    // cleanly (and releases its observer subscription) when it appears or disappears
    const allLists = useMemo(() => [...(upcoming ? [upcoming] : []), ...(lists ?? [])], [upcoming, lists])
    const refDiv = useRef(null);


    const onScrollUp = (pixels)=> {
        if (swipeDisabled.current===true)
            return;

        const div = refDiv?.current
        if (!div) {
            return;
        }

        const prev = div.offsetTop;
        const delta = pixels!==undefined ? pixels : cardSize?.height||50
        const newY = prev-delta //Math.min( prev-delta, 0)// Math.min( prev+cardSize.height, height-cardSize.height)
        const behavior = pixels!==undefined ? 'instant' : 'smooth'
        div.focus()
        div.scrollTo({left:0,top:newY,behavior})
        
        return newY

    }

    const onScrollDown = (pixels,y)=> {
        if (swipeDisabled.current===true)
            return;

        const div = refDiv?.current
        if (!div) {
            return;
        }

        const prev = div.offsetTop;
        const delta = pixels!==undefined ? pixels : cardSize?.height||50
        const newY = prev+delta;
        const behavior = pixels!==undefined ? 'instant' : 'smooth'

        //window.scrollTo({top:deltaY,behavior:'smooth'})
        div.focus()
        div.scrollTo({left:0,top:newY,behavior})
        
        return newY
            
        
        
    }

    const onKey = ( info)=> {
            switch (info.code) {
                case UP: 
                case PAGE_UP:
                    onScrollUp()
                    break;
                case DOWN: 
                case PAGE_DOWN:
                    onScrollDown()
                    break;
                    
                default:
                    return;
            }
    }

    const onSwipe = ( direction, pixels)=> {

        if(swipeDisabled.current)
            return;

        if(direction==='swipe-up')
            onScrollDown(pixels)
        if(direction==='swipe-down')
            onScrollUp(pixels)

    }

    useKey([UP,DOWN,PAGE_UP,PAGE_DOWN], onKey)
    useMouseSwipe(['swipe-up','swipe-down'], onSwipe, {div:refDiv.current})
    
    
    const setScrolling = (isScrolling)=>{
        swipeDisabled.current = isScrolling
         

    }
    

    return (
        <MainPage >

            <View>

                <NavigationBar closePage={closePage} selected='workouts' />

                <ContentArea width={'100%'} >
                    <PageTitle>Workouts</PageTitle>

                    <AppThemeProvider>
                        <ListContainer width='100%' height='100%' ref={refDiv}>
                        {  !loading && cardSize && lists ?
                            allLists.map( list => <WorkoutList key={list.id} list={list} cardSize={cardSize} itemsFit={itemsFit} responsive={responsive}
                                onOK={onOK} onDelete={onDelete} onRetry={onRetry}
                                onInitialized={onInitialized} onUpdated={onUpdated} onSlideChange={onSlideChange} onSlideChanged={onSlideChanged}
                                setScrolling={setScrolling} />)
                            :
                            null
                        }
                        </ListContainer>
                    </AppThemeProvider>
                    { (loading || !cardSize ) ?  <Center><Loader /></Center> :null }

                </ContentArea>

            </View>

        </MainPage>
    )
}
