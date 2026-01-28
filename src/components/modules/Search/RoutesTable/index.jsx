import React,{ useCallback, useEffect, useRef, useState } from 'react'
import { Dynamic, TableContainer } from '../../../atoms'
import { AppThemeProvider } from '../../../../theme'
import { RouteItem } from '../RouteItem'
import { useMouseSwipe, useUnmountEffect } from '../../../../hooks'
import { Observer, useRouteList } from 'incyclist-services'
import {EventLoggger} from 'gd-eventlog'

export const RoutesTable = ({routes,onSelect,onDelete}) => {

    const refDiv=useRef(null)
    const mountedRef = useRef(false)
    
    const swipeDisabled = useRef(false)
    const topRef=useRef(0)

    const [initialized,setInitialized] = useState(false)

    const observerRef = useRef(null)
    const lastSwipeTS = useRef(null)
    const elementsOutsideFold  =useRef(null)
    const service = useRouteList()



    const updateFoldInfo = useCallback( (initial=false)=>{
        try {

            const elemntHeight = refDiv.current.scrollHeight/routes.length
            const topElement = Math.floor(refDiv.current.scrollTop/elemntHeight)
            service.setListTop('list',refDiv.current.scrollTop)
            const visible = window.innerHeight/elemntHeight

            if (initial)
                elementsOutsideFold.current  = routes.map( ()=>true)

            routes.forEach((a,i) => {
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
    },[routes,service])

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
        setInitialized(true)

    },[updateFoldInfo]);


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

        elementsOutsideFold.current = null
        mountedRef.current = null
        refDiv.current = null

    })    

    const onItemSelected = (id) => {
        if (lastSwipeTS.current && (Date.now()-lastSwipeTS.current)<300)
            return;

        if (onSelect)
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

    const visible = routes??[]
    const foldInfo = elementsOutsideFold.current??visible.map( r=>true)

    if (!initialized) {
        return <AppThemeProvider>
            <TableContainer className='routes' width='100%' height='100%' ref={refDiv} >
                {visible?.map( (route,idx) => 
                    <Dynamic observer={observerRef.current} key={route?.id??`route-${idx}`} event={`outsideFold-${idx}`} prop='outsideFold' >                 
                        <RouteItem outsideFold={true} />
                    </Dynamic>
                )}
                 
            </TableContainer>
        </AppThemeProvider>

    }

    return (
        <AppThemeProvider>
            <TableContainer className='routes' width='100%' height='100%' ref={refDiv} >
                {visible?.map( (route,idx) => 
                    <Dynamic observer={observerRef.current} key={route?.id??`route-${idx}`} event={`outsideFold-${idx}`} prop='outsideFold' >                 
                        <RouteItem outsideFold={foldInfo[idx]}  {...route} 
                            onClick={()=>{onItemSelected(route.id)}}
                            onDelete={()=>{onItemDeleted(route.id)}}
                            />

                    </Dynamic>
                )}
                 
            </TableContainer>
        </AppThemeProvider>
    )
}
