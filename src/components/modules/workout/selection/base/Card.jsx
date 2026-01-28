import React, { useCallback, useEffect, useRef, useState } from 'react'
import { copyPropsExcluding } from '../../../../../utils/props'
import { FlipCard } from '../../../../atoms'
import { useUnmountEffect } from '../../../../../hooks'


export const Card = (props) => {
    const {observer,Summary, Details } = props

    const initialState = copyPropsExcluding(props,['observer','width','height','padding','Summary','Details'])
    const [state,setState] = useState(initialState)
    const [initialized,setInitialized] = useState(false)
    const refMounted = useRef(false)

    const handleUpdate = useCallback((updatedProps)=> {

        if (!refMounted.current)
            return
        setState( current => {
            const newState = {...current,...updatedProps}
            return newState
        })
    },[])

    useEffect( ()=>{
        if (initialized)
            return;

        setInitialized(true)
        refMounted.current = true

        if (observer) {
            observer.on('update', handleUpdate)
        }

    },[handleUpdate, initialized, observer, props])

    useUnmountEffect( ()=> {
        refMounted.current = false
        if (observer) {
            observer.off('update', handleUpdate)
        }
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

    return <FlipCard  hidden={hidden} width={widthStr} height={heightStr} padding={paddingStr} background='linear-gradient(darkred,#180457)' delay='1s' >
        {Summary ? <Summary {...stateProps} width={width-padding} height={height} />:null}
        {Details ? <Details {...stateProps} width={width-padding} height={height} />:null}
    </FlipCard>
}
