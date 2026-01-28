import React, {useRef, useState } from "react"
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
import { valid } from "../../utils/coding"
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

export const WorkoutsScreen =  /*forwardRef(*/
    ({ loading, cardSize,offset=0, responsive, itemsFit, width,height, data,key, 
        onInitialized,onUpdated, onSlideChange, onSlideChanged, onOK, onUnselect,closePage, onDelete,onRetry, onPageSelected}) => {
    const swipeDisabled = useRef(false);
    //const [data,setData] = useState(dataProp)

    const refDiv = useRef(null);
    let cardBuilders


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
    
    const callback = ( fn, list, e, ) =>{
        if (!fn)
            return

        fn(list,e)
    }

    const initCardBuilders = ()=> {
        cardBuilders = {
            WorkoutImport: getImportCard,
            ActiveWorkoutImport: getImportProgressCard,
            WorkoutCreate: getCreateCard,
            Workout: getWorkoutCard,
            ScheduledWorkout: getScheduledWorkoutCard

        }
    }

    const getCard = (workoutCard) => {

        if (!cardBuilders)
            initCardBuilders()
        const hidden = !workoutCard.isVisible()
        const innerSize = {...cardSize||{}}
        innerSize.width = cardSize?.width-cardSize?.padding
        innerSize.padding=0;

        const stdProps = {hidden,...innerSize}
        const builder = cardBuilders[workoutCard.getCardType()]
        if(!builder) {
            return null
        }
        return builder(workoutCard, stdProps)       
    }

    const getImportCard =(workoutCard, stdProps) => {
        const title = workoutCard.getTitle()
        const filters = workoutCard.getFilters()
        const props = {...stdProps, title,filters,canDelete:false,visible:true}
        
        return {Card:UploadCard, props}
    }

    const getImportProgressCard =(workoutCard, stdProps) => {
        const displayProps = workoutCard.getDisplayProperties();
        const canDelete = valid(displayProps.error)
        
        const props = {...stdProps,...displayProps,canDelete}
        return {Card:ActiveImportCard, props}
    }

    const getWorkoutCard =(workoutCard, stdProps) => {
        const props = {...stdProps, ...workoutCard.getDisplayProperties() }            
        return {Card:WorkoutCard, props}
    }
    const getScheduledWorkoutCard =(workoutCard, stdProps) => {


        const props = {...stdProps, ...workoutCard.getDisplayProperties() }            
        return {Card:ScheduledWorkoutCard, props}
    }

    const getCreateCard = (workoutCard, stdProps) => { 
        const props = {...stdProps, ...workoutCard.getDisplayProperties() }            
        return {Card:WorkoutCreateCard, props}
    }



    const getCards =(list) => {
        const routeCards = list.getCards() || []
        const cards = routeCards?.map( (workoutCard,idx) => { 

            const {Card,props: cardProps} = getCard(workoutCard)??{}
            if (!Card)
                return null;
            
            const onOKClicked  = onOK ? (...args)=>{ onOK(workoutCard,...args) } : undefined
            const onDeleteClicked  = onDelete ? ()=>{ onDelete(workoutCard) } : undefined
            const onRetryClicked  = onRetry ? ()=>{ onRetry(workoutCard) } : undefined
            const onUnselectClicked  = onRetry ? ()=>{ onUnselect(workoutCard) } : undefined
            
                    
            
            return <CardView className='item' distance={ `${cardSize.padding/2}px`}>
                        <Card {...cardProps} 
                            key={idx} 
                            onOK={onOKClicked}
                            onUnselect={onUnselectClicked}
                            onDelete={onDeleteClicked}
                            onRetry={onRetryClicked}
                            />
                    </CardView>
        })
        return cards

    }


    const WorkoutList = ({ list}) => {
        const header = list.getTitle()       
        const [cards,setCards] = useState(getCards(list))

        if (list.observer) {
            list.observer.on('update', (list) => {
                setCards(getCards(list))
            })
        }

        return (
            
            <Column className={`list_${list.getId()}`} >
                { header?
                    <Row>
                        <Column width='50px'/>
                        <Column>
                            <GroupTitle>{header}</GroupTitle>    
                        </Column> 
            
                    </Row>
            
                    
                    :null}
                
                <Row width='100%'>
                    <Carousel  cards={cards} 
                            width='100%'
                            height={`${cardSize.height}px`}  renderKey={itemsFit} responsive={responsive}    
                            autoWidth={true}                         
                            onInitialized={ (e)=> {callback(onInitialized,list,e); } }
                            onSlideChange={ (e)=> {callback(onSlideChange,list,e); setScrolling(true) } }
                            onSlideChanged={(e)=> {callback(onSlideChanged,list,e); setScrolling(false)} }
                            onUpdated={ (e)=> {callback(onUpdated,list,e)} }                            
                    >
                        
                    </Carousel>

                </Row>
    
            </Column>
        )
    }
    
    return (
        <MainPage >

            <View>
    
        
                <NavigationBar closePage={closePage} selected='workouts' />

                <ContentArea width={'100%'} >
                    <PageTitle>Workouts</PageTitle>   

                    <AppThemeProvider>                    
                        <ListContainer width='100%' height='100%' ref={refDiv}>
                        {  !loading && cardSize && data    ? 
                            data.map( (list,idx) => <WorkoutList list={list} key={idx} />)              
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


