import React, {useCallback, useEffect, useRef, useState } from "react"
import MainPage from "../../components/molecules/MainPage"
import { Loader, Center } from "../../components/atoms"
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
import { useRouteFavorites } from '../../components/modules/routeSelection/VideoCard/usePersonalRoutes'

const UP = 'ArrowUp'
const DOWN = 'ArrowDown'
const PAGE_UP = 'PageUp'
const PAGE_DOWN = 'PageDown'

let uniqCnt = 0;

const RoutePageTitle = styled.h1`
    color: white; font-size: 30px; line-height: 1.2; margin: 20px 6px 12px; font-weight: 650;
`
const RouteGroupTitle = styled.h2`
    color: white; font-size: 22px; line-height: 1.25; margin: 16px 0 6px; font-weight: 600;
`
const Toolbar = styled.div`
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    button { color: #f1cf98; background: #28212f; border: 1px solid #806441; border-radius: 7px;
        padding: 10px 12px; cursor: pointer; font: inherit; font-size: 13px; }
    button[aria-pressed='true'] { background: #55412c; }
    button:focus-visible { outline: 2px solid #efc580; outline-offset: 2px; }
`
const FavoritesGrid = styled.div`
    display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr));
    gap: 16px; padding: 10px 6px 20px;
    > div { max-width: 332px; }
    p { color: #dad1e4; font-size: 15px; }
`

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
    min-width: 0;
    box-sizing: border-box;
    background: rgba(13, 10, 22, .58);
    @media (max-width: 700px) { padding-left: 16px; padding-right: 16px; }
   
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
    const { favorites } = useRouteFavorites()
    const [favoritesOnly, setFavoritesOnly] = useState(false)
    const favoriteCards = [...new Map((data || []).flatMap(list => list.getCards())
        .filter(card => card.getCardType() === 'Route' && favorites.includes(String(card.getId())))
        .map(card => [card.getId(), card])).values()]
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

    const getCard = (routeCard, compact) => {

        const hidden = !routeCard.isVisible()
        const innerSize = {...cardSize||{}}
        innerSize.width = cardSize?.width-cardSize?.padding
        innerSize.padding=0;
        if (compact) innerSize.height = 210

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
        const compact = !routeCards.some(card => card.getCardType() === 'Route')


        const cards = routeCards?.map( (routeCard,idx) => { 

            const {Card,props: cardProps} = getCard(routeCard, compact)
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
        const compact = !list.getCards().some(card => card.getCardType() === 'Route')
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
                        <Column width='6px'/>
                        <Column>
                            <RouteGroupTitle>{header}</RouteGroupTitle>
                        </Column> 
            
                    </Row>
            
                    
                    :null}
                
                <Row width='100%'>
                    <Carousel  cards={cards} 
                            width='100%'
                            height={`${compact ? 210 : cardSize.height}px`}  renderKey={itemsFit} responsive={responsive}
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
                    <Toolbar><RoutePageTitle>Routes</RoutePageTitle>
                        <button type='button' aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(value => !value)}>★ Favorites ({favoriteCards.length})</button>
                    </Toolbar>

                    <AppThemeProvider>                    
                        <ListContainer className='routes' width='100%' height='100%' ref={refDiv}>
                        {favoritesOnly ? <FavoritesGrid>
                            {favoriteCards.length ? favoriteCards.map(card => <VideoCard key={card.getId()}
                                {...card.getDisplayProperties()} observer={undefined} visible={true} width='100%' height={530}
                                onOK={() => onOK?.(card)} onDelete={() => onDelete?.(card)} />) :
                                <p>Star a route to find it here for your next ride.</p>}
                        </FavoritesGrid> : !loading && cardSize && data ?
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
