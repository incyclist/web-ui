import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlipCard, Row } from '../../../atoms'
import { copyPropsExcluding } from '../../../../utils/props'
import styled from 'styled-components'
import { useUnmountEffect } from '../../../../hooks'
import { CardSkeleton } from './skeleton'

const OutsideFold = styled(Row)`
    display: block;
    min-width: ${props => props.width};
    min-height: ${props => props.height};
    height: ${props => props.height};
    width: ${props => props.width};

`


/*
    z-index: 0;
    display: flex;
    position: relative;
    flex-direction: column;
    height: ${props => `${props.height}px`};
    width: ${props => `${props.width}px`};
    user-select: none;
    background: red;

    padding: 0;
    margin: 0;


*/
const SingleCardWrapper = styled.div`
    position: relative;
    background-color: transparent;
    width: ${props => props.width};
    height: ${props => props.height};
    visibility: ${props => props.hidden ? 'hidden' : undefined};
    padding: ${props => props.padding || '0'};
    box-sizing: border-box;
    cursor: pointer;
    border-radius: 6px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover, &:focus-within {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(0, 0, 0, 0.42);
    }
    @media (prefers-reduced-motion: reduce) { transition: none; }
`

export const Card = (props) => {
    const {observer,Summary, Details,card } = props

    const initialState = copyPropsExcluding(props,['observer','width','height','padding','Summary','Details'])
    const [state,setState] = useState(initialState)
    const refInitialized = useRef(false)


    const onUpdate = useCallback( (updatedProps)=> {
        setState( current => {
            const newState = copyPropsExcluding(updatedProps,['observer','width','height','padding','Summary','Details'])  //{...current,...updatedProps}
            return {...current,...newState}
        })
    },[])
    const onRedraw = useCallback( (updatedProps)=> {
        setState( current => {
            const newState = copyPropsExcluding(updatedProps,['observer','width','height','padding','Summary','Details'])  //{...current,...updatedProps}
            return {...current,...newState, ts:Date.now()}
        })
    },[])

    useEffect( ()=>{
        if (refInitialized.current)
            return;
        refInitialized.current = true

        if (observer) {
            observer.on('update', onUpdate)    
        }
        if (observer) {
            observer.on('redraw', onRedraw)    
        }
        if (card?.isVisible())
            card.setInitialized(true)

    },[card, observer, onUpdate, props, props.title, props.visible, refInitialized])

    useUnmountEffect( ()=>{
   
        if (observer)
            observer.off('update',onUpdate)
        refInitialized.current = false
    })

    let {width, height,padding=0} = props;

    if ( height && !width && typeof height==='number') {
        width =  235 / 132 *height/2
    }
    if (width && !height && typeof width==='number') {
        height = width *132/235 *2;
    }

    const widthStr = typeof width ==='string' ? width : `${width}px`
    const heightStr = typeof height ==='string' ? height : `${height}px`
    const paddingStr = typeof padding === 'string' ? padding : `${padding}px`

    const stateProps = state||{}
    const hidden = !stateProps.visible

    // lists with a fold window (e.g. RoutesGrid) pass outsideFold - it is read from props, as it changes while scrolling
    if (props.outsideFold) {
        return <CardSkeleton onClick={props.onClick} />
    }

    if (hidden) {
        return <OutsideFold width={widthStr} height={heightStr}><CardSkeleton onClick={props.onClick} /></OutsideFold>
    }
 
    const summaryWidth = typeof width === 'number' && typeof padding === 'number' ? width - padding : width

    if (!Details) {
        return (
            <SingleCardWrapper
                hidden={hidden}
                width={widthStr}
                height={heightStr}
                padding={paddingStr}
                className="route-card-wrapper"
            >
                {Summary ? <Summary {...stateProps} width={summaryWidth} height={height} /> : null}
            </SingleCardWrapper>
        )
    }

    return <FlipCard  hidden={hidden} width={widthStr} height={heightStr} padding={paddingStr} background='linear-gradient(darkred,#180457)' delay='1s' >
        {Summary ? <Summary {...stateProps} width={summaryWidth} height={height} />:null}
        {Details ? <Details {...stateProps} width={summaryWidth} height={height} />:null}
    </FlipCard>
}
