import React,{ useEffect, useRef, useState,useCallback } from 'react'
import { TableContainer } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'
import { useMouseSwipe, useUnmountEffect } from '../../../../hooks'
import { ActivityListItem } from '../../../molecules/Activity'
import { Dynamic } from '../../../atoms/Dynamic'
import { Observer, useActivityList } from 'incyclist-services'
import {EventLoggger} from 'gd-eventlog'

export const ActivitiesTable = ({activities,onSelect,onDelete}) => {

    const refDiv=useRef(null)
    const mountedRef = useRef(false)
    const swipeDisabled = useRef(false)
    const topRef=useRef(0)
    const [initialized,setInitialized] = useState(false)
    const observerRef = useRef(null)

    const lastSwipeTS = useRef(null)
    const elementsOutsideFold  =useRef(null)
    const service = useActivityList()

    const updateFoldInfo = useCallback( (initial=false)=>{
        try {

            const elemntHeight = refDiv.current.scrollHeight/activities.length
            const topElement = Math.floor(refDiv.current.scrollTop/elemntHeight)
            service.setListTop(refDiv.current.scrollTop)
            const visible = window.innerHeight/elemntHeight

            if (initial)
                elementsOutsideFold.current  = activities.map( ()=>true)

            activities.forEach((a,i) => {
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
            const logger = new EventLoggger('Incyclist')
            logger.logEvent({message:'error',fn:'onScrollHandler',error:err.message, stack:err.stack})

        }   
    },[activities,service])

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
            refDiv.current.scrollTop = service.getListTop()
            
        }
        mountedRef.current = true


    }, [activities,initialized, onScrollHandler, service])


    // init fold after first render
    useEffect(() => {
        if (!mountedRef.current || !refDiv.current || elementsOutsideFold.current) 
            return

        updateFoldInfo(true)
        setInitialized(true)

    },[activities, initialized, updateFoldInfo]);

    useUnmountEffect( () => {
        try {
            if (refDiv.current) {
                refDiv.current.removeEventListener('scroll',onScrollHandler)
            }
        }
        catch(err) {
            const logger = new EventLoggger('Incyclist')
            logger.logEvent({message:'error',fn:'useUnmountEffect',error:err.message, stack:err.stack})
            
        }

    })

    const onItemSelected = (id) => {
        if (lastSwipeTS.current && (Date.now()-lastSwipeTS.current)<300)
            return;

        if (typeof (onSelect)==='function')
            onSelect(id)
    }

    const onItemDeleted = (id) => {
        if (typeof (onDelete)==='function')
            onDelete(id)
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

    
    let visible = activities??[]

    if (!initialized) {
        return (
        <AppThemeProvider >
            <TableContainer width='100%' height='100%' ref={refDiv} >
            {visible?.map( (ai,idx) => 
                    <Dynamic observer={observerRef.current} key={ai.summary?.id??`activity-${idx}`}  event={`outsideFold-${idx}`} prop='outsideFold'>
                        <ActivityListItem outsideFold={true}  />
                    </Dynamic>
                )}
            </TableContainer>
        </AppThemeProvider>
    )}

    const foldInfo = elementsOutsideFold.current??[]

    return (
        <AppThemeProvider >
            <TableContainer width='100%' height='100%' ref={refDiv} >
                {visible?.map( (ai,idx) => 
                    <Dynamic observer={observerRef.current} key={ai.summary?.id??`activity-${idx}`} event={`outsideFold-${idx}`} prop='outsideFold' > 
                        <ActivityListItem outsideFold={foldInfo[idx]}  activityInfo={ai}  
                            onClick={()=>{onItemSelected(ai.summary?.id)}}
                            onDelete={()=>{onItemDeleted(ai.summary?.id)}}
                            />
                    </Dynamic>
                )}
                 
            </TableContainer>
        </AppThemeProvider>
    )
}
