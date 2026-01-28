import React, {useCallback, useEffect, useRef, useState } from "react"
import MainPage from "../../components/molecules/MainPage"
import { PageTitle,GroupTitle, Loader, Center } from "../../components/atoms"
import styled from "styled-components"
import { VideoCard } from "../../components/modules/routeSelection/VideoCard"
import { Column, Row } from "../../components/atoms/layout/View"
import { useKey } from "../../hooks/ui/useKey"
import { useMouseSwipe } from "../../hooks/ui/useMouseSwipe"
import { FreeRideCard } from "../../components/modules/routeSelection/FreeRideCard"
import { UploadCard } from "../../components/modules/routeSelection/UploadCard"
import { Carousel } from "../../components/atoms/Carousel"
import { NavigationBar } from "../../components/molecules/NavigationBar"
import { AppThemeProvider } from "../../theme"
import { ActiveImportCard } from "../../components/modules/routeSelection/ActiveImportCard"
import { valid } from "../../utils/coding"
import { useUnmountEffect } from "../../hooks"

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const PAGE_UP = 'PageUp'
const PAGE_DOWN = 'PageDown'

let uniqCnt = 0;

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
    padding-left: ${props=>props.distance};
    padding-right: ${props=>props.distance};
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

export const RoutesScreen =  /*forwardRef(*/
    ({ loading, cardSize,offset=0, top=0, responsive, itemsFit, width,height, data,key, onInitialized,onUpdated, 
        onSlideChange, onSlideChanged, onOK, closePage, onDelete,onRetry, onPageSelected, onScrollUpDown}) => {
    const swipeDisabled = useRef(false);
    //const [data,setData] = useState(dataProp)

    const refDiv = useRef(null);
    const refMounted = useRef(false)
    const refTop = useRef(null)
    const refScrollhandler = useRef(null)

    const onScrollHandler = useCallback( () => {

        if (refTop.current===null && refDiv.current) {
            refDiv.current.scrollTop = top
        }
        refTop.current = refDiv.current?.scrollTop
        if (onScrollUpDown)
            onScrollUpDown(refDiv.current?.scrollTop)

    },[onScrollUpDown, top])

    useEffect(() => {
        if (refMounted.current)
            return;

        if (refDiv.current && data?.length)  {           
            refMounted.current = true
            if (!refScrollhandler.current) {
                refScrollhandler.current = onScrollHandler
                refDiv.current.addEventListener('scroll',onScrollHandler)
            }            
        }
        

    }, [data, onScrollHandler])

    

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

    const getCard = (routeCard) => {

        const hidden = !routeCard.isVisible()
        const innerSize = {...cardSize||{}}
        innerSize.width = cardSize?.width-cardSize?.padding
        innerSize.padding=0;

        const stdProps = {hidden,...innerSize,card:routeCard}

        if (routeCard.getCardType()==='Free-Ride') {
            const position = routeCard.getPosition()||{};
            const props = {...stdProps, ...position,canDelete:false,visible:true}
            return { Card:FreeRideCard, props}
        }

        else if (routeCard.getCardType()==='Import') {
            const title = routeCard.getTitle()
            const filters = routeCard.getFilters()
            const props = {...stdProps, title,filters,canDelete:false,visible:true}
            return {Card:UploadCard, props}
        }
        else if (routeCard.getCardType()==='ActiveImport') { 
            const displayProps = routeCard.getDisplayProperties();
            const canDelete = valid(displayProps.error)
            
            const props = {...stdProps,...displayProps,canDelete,isImport:true}
            return {Card:ActiveImportCard, props}
        }
        else {
            const props = {...stdProps, ...routeCard.getDisplayProperties() }            
            return {Card:VideoCard, props}
        }
        
    }

    const getCards =(list) => {
        const routeCards = list.getCards() || []


        const cards = routeCards?.map( (routeCard,idx) => { 

            const {Card,props: cardProps} = getCard(routeCard)
            if (!Card)
                return null;
            
            const onOKClicked  = onOK ? (...args)=>{ onOK(routeCard,...args) } : undefined
            const onDeleteClicked  = onDelete ? ()=>{ onDelete(routeCard) } : undefined
            const onRetryClicked  = onRetry ? ()=>{ onRetry(routeCard) } : undefined

            const key = `${routeCard.getTitle()}-${Date.now()}-${uniqCnt++%1000}`
            
                    
            return <CardView className='item' distance={ `${cardSize.padding/2}px`}>
                        <Card {...cardProps} 
                            key={ key} 
                            onOK={onOKClicked}
                            onDelete={onDeleteClicked}
                            onRetry={onRetryClicked}
                            />
                    </CardView>
                    
        })
        return cards

    }


    
    const RouteList = ({ list}) => {
        const header = list?.getTitle()
        const [state,setState] = useState( {cards:getCards(list), updated:Date.now()})
        
        const refInitialized = useRef(false)
       
        const onListUpdate =  (list,updated,visibleStart,visibleEnd) =>{
                if ( updated===state.hash)
                    return

                list.getCards().forEach( (c,idx)=>{ 
                    if (idx<(visibleStart??0) || idx>(visibleEnd??10)) c.setVisible(false)
                    c.setInitialized(false)
                })
                setState( {cards:getCards(list), updated:Date.now(), hash:updated})
        }

        useEffect( ()=>{
            if (refInitialized.current)
                return

            refInitialized.current = true
            if (list?.observer) {
                list.observer.on( 'updated',onListUpdate )
            }
        })


        useUnmountEffect( ()=>{
            if (list?.observer) { 
                list.observer.off( 'updated',onListUpdate )
            }
            refInitialized.current = false
        })



        const {cards,updated} = state

                return (
            
            <Column className={`list_${list.getId()}_${updated}`}  >
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
    
        
                <NavigationBar closePage={closePage} selected='routes' />

                <ContentArea width={'100%'} >
                    <PageTitle>Routes</PageTitle>   

                    <AppThemeProvider>                    
                        <ListContainer className='routes' width='100%' height='100%' ref={refDiv}>
                        {  !loading && cardSize && data    ? 
                            data.map( (list,idx) => <RouteList list={list} key={idx} />)              
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


