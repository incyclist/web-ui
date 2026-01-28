import React,{ useCallback, useEffect, useRef  } from 'react'
import { Autosize, Dynamic, View } from '../../../atoms'
import styled  from 'styled-components'
import { AppThemeProvider } from '../../../../theme'
import { useMouseSwipe } from '../../../../hooks'
import { Observer, useRouteList } from 'incyclist-services'
import { FreeRideCard } from '../../routeSelection/FreeRideCard'
import { UploadCard } from '../../routeSelection/UploadCard'
import { valid } from '../../../../utils/coding'
import { ActiveImportCard } from '../../routeSelection/ActiveImportCard'
import { VideoCard } from '../../routeSelection/VideoCard'
import { EventLogger } from 'gd-eventlog'

export const CardItem = styled(Autosize)`
    z-index: 0;
    position: relative;

`

export const Container = styled(View)`
    overflow-x: hidden;
    display: block;
    
    &::-webkit-scrollbar-button {
        display: none;
    }

    &::-webkit-scrollbar {
        width: 2vw;
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

export const RoutesGrid = ({cards,onSelect,onDelete}) => {

    const refDiv=useRef(null)
    const mountedRef = useRef(false)
    
    const swipeDisabled = useRef(false)
    const topRef=useRef(0)

    const observerRef = useRef(null)
    const lastSwipeTS = useRef(null)
    const elementsOutsideFold  =useRef(null)
    const service = useRouteList()


    const getCard = (routeCard) => {
        const hidden = false
        const innerSize = {}
        innerSize.width = 200
        innerSize.padding=0;

        const stdProps = {hidden,...innerSize, id:routeCard.id}

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
            
            const props = {...stdProps,...displayProps,canDelete}
            return {Card:ActiveImportCard, props}
        }
        else {
            const props = {...stdProps, ...routeCard.getDisplayProperties() }            
            return {Card:VideoCard, props}
        }
            
    }
    


    const updateFoldInfo = useCallback( (initial=false)=>{
        try {

            if (!cards?.length)
                return;

            const elemntHeight = refDiv.current.scrollHeight/cards.length
            const topElement = Math.floor(refDiv.current.scrollTop/elemntHeight)
            service.setListTop('tiles',refDiv.current.scrollTop)
            const visible = window.innerHeight/elemntHeight

            if (initial)
                elementsOutsideFold.current  = cards.map( ()=>true)

            cards.forEach((a,i) => {
                const outsideFold = i<topElement || i>topElement+visible

                if (elementsOutsideFold.current[i] && outsideFold===false) {
                    if (!initial) {
                        observerRef.current.emit(`outsideFold-${i}`,outsideFold)
                    }
                    elementsOutsideFold.current[i] = outsideFold
                }                   
            })
        }
        catch(err) {
            
            const logger = new EventLogger('Incyclist')
            logger.logEvent({message:'error',fn:'onScrollHandler',error:err.message, stack:err.stack})

        }   
    },[cards,service])

    const onScrollHandler = useCallback( ()=>{
        updateFoldInfo(false)
    },[updateFoldInfo])

    useEffect(() => {
        if (mountedRef.current)
            return;

        if (refDiv.current) {
            observerRef.current = new Observer() 
            refDiv.current.addEventListener('scroll',onScrollHandler)
        }

        if (service.getListTop()!==undefined) {
            refDiv.current.scrollTop = service.getListTop('list')
            
        }
        mountedRef.current = true


    }, [onScrollHandler, service])
    
    useEffect(() => {
        if (!mountedRef.current || !refDiv.current || elementsOutsideFold.current) 
            return

        updateFoldInfo(true)

    },[updateFoldInfo]);


    const onItemSelected = (id) => {
        if (lastSwipeTS.current && (Date.now()-lastSwipeTS.current)<300)
            return;

        if (onSelect)
            onSelect(id)
    }
    

    const onSwipeEnd = (d)=> {
        const div = refDiv.current
        div.focus()

        let top = topRef.current-d.deltaY
        if (top<0) top=0
        topRef.current = top

        lastSwipeTS.current = Date.now()
    }
    const onSwipe = ( direction, pixels,event)=> {

        if(swipeDisabled.current || !event)
            return;

        if(direction==='swipe-up'|| direction==='swipe-down') {
            const {deltaY} = event

            const div = refDiv.current
           
            
            let top = topRef.current-deltaY
            if (top<0) top=0
            
            div.focus()
            div.scrollTo({top,behavior:'instant'})
        }
            
        
    }

    useMouseSwipe(['swipe-up','swipe-down'], onSwipe, {div:refDiv.current,onSwipeEnd,debug:true })

    const visible = (cards??[]).map( card => getCard(card) )
    const foldInfo = elementsOutsideFold.current??[]


    console.log('# grid', cards?.length, visible?.length, foldInfo, visible[0])

    const padding = 0.1
    const height = 25
    const width  = 235 / 132 *height/2+padding

    return (
        <AppThemeProvider>
            <Container width='100%' height='100%' ref={refDiv} >
                {visible?.map( ({Card,props},idx) =>    
                    <Dynamic observer={observerRef.current} key={props?.id??`route-${idx}`} event={`outsideFold-${idx}`} prop='outsideFold' >                 
                        
                        <CardItem className='card' height={`${height}vh`} width={`${width}vh`}>
                            <Card outsideFold={foldInfo[idx]}  key={props?.id} {...props} onClick={()=>{onItemSelected(props?.id)}}/>
                        </CardItem>

                    </Dynamic>
                )}
                 
            </Container>
        </AppThemeProvider>
    )
}
