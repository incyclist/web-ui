import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlipCard, Row } from '../../../atoms'
import { copyPropsExcluding } from '../../../../utils/props'
import styled from 'styled-components'
import { useUnmountEffect } from '../../../../hooks'

const OutsideFold = styled(Row)`
    opacity: 0.1;
    display: block;
    min-width: ${props => `${props.width}px`};
    min-height: ${props => `${props.height}px`};
    height: ${props => `${props.height}px`};
    width: ${props => `${props.width}px`};
    background: lightgray;
    color: white

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

    let {width, height,padding} = props;

    if ( height && !width && typeof height==='number') {
        width =  235 / 132 *height/2
    }
    if (width && !height && typeof height==='number') {
        height = width *132/235 *2;
    }

    const widthStr = typeof width ==='string' ? width : `${width}px`
    const heightStr = typeof height ==='string' ? height : `${height}px`
    const paddingStr = `${padding}px`

    const stateProps = state||{}
    const hidden = !stateProps.visible


    if (hidden) {
        return <OutsideFold width={widthStr} height={heightStr} >X</OutsideFold>
    }
 

    return <FlipCard  hidden={hidden} width={widthStr} height={heightStr} padding={paddingStr} background='linear-gradient(darkred,#180457)' delay='1s' >
        {Summary ? <Summary {...stateProps} width={width-padding} height={height} />:null}
        {Details ? <Details {...stateProps} width={width-padding} height={height} />:null}
    </FlipCard>
}
