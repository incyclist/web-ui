import React,{ useCallback } from 'react'
import { Autosize, Dynamic, View } from '../../../atoms'
import styled  from 'styled-components'
import { AppThemeProvider } from '../../../../theme'
import { useFoldWindow } from '../../../../hooks'
import { useRouteList } from 'incyclist-services'
import { FreeRideCard } from '../../routeSelection/FreeRideCard'
import { UploadCard } from '../../routeSelection/UploadCard'
import { valid } from '../../../../utils/coding'
import { ActiveImportCard } from '../../routeSelection/ActiveImportCard'
import { VideoCard } from '../../routeSelection/VideoCard'

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

const getCardKey = (card,idx) => card?.id??`route-${idx}`

export const RoutesGrid = ({cards,onSelect,onDelete}) => {

    const service = useRouteList()

    const onScrollTop = useCallback( (top)=>{
        service.setListTop('tiles',top)
    },[service])

    const {ref, observer, isOutsideFold, getFoldEvent, swipedRecently} = useFoldWindow({
        items: cards,
        getKey: getCardKey,
        initialScrollTop: service.getListTop('tiles'),
        onScrollTop
    })

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
    


    const onItemSelected = (id) => {
        if (swipedRecently())
            return;

        if (onSelect)
            onSelect(id)
    }

    const visible = (cards??[]).map( card => getCard(card) )

    const padding = 0.1
    const height = 25
    const width  = 235 / 132 *height/2+padding

    return (
        <AppThemeProvider>
            <Container width='100%' height='100%' ref={ref} >
                {visible.map( ({Card,props},idx) => {
                    const key = getCardKey(cards[idx],idx)
                    return (
                        <Dynamic observer={observer} key={key} event={getFoldEvent(key)} prop='outsideFold' >                 
                            
                            <CardItem className='card' height={`${height}vh`} width={`${width}vh`}>
                                <Card outsideFold={isOutsideFold(key)}  key={props?.id} {...props} onClick={()=>{onItemSelected(props?.id)}}/>
                            </CardItem>

                        </Dynamic>
                    )
                })}
                 
            </Container>
        </AppThemeProvider>
    )
}
