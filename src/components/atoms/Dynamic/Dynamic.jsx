import React,{ useEffect, useRef, useState } from "react"
import { copyPropsExcluding } from "../../../utils/props"
import styled from "styled-components"
import { clone } from "../../../utils/coding"
import { useUnmountEffect } from "../../../hooks"
import {EventLogger}  from "gd-eventlog"



export const Dynamic = (props) => { 
    
    const {observer, mapping, event,prop, onEvent, events, transform, children,hidden=false,debugId,id=Date.now()} = props   
    const [childProps,setChildProps] = useState( copyPropsExcluding(props,['mapping', 'observer','children','hidden','event','events','transform','prop','onEvent', 'onEvent','debugId']) )

    const initialized = useRef(false)
    const debug = debugId!==undefined
      // to identify unmount

    const refHandlers = useRef([])

    useEffect(() => { 
        try {

            if (debug)
                console.log('~~~ Dynamic: init', debugId, {mapping,event,events,transform,prop}, initialized.current, observer,props)
            if (initialized.current) 
                return;

            if (!observer) 
                return

            
            const eventMapping = mapping??events?.split(',').map( event=> ({event,prop}))

            if (eventMapping) {
                eventMapping.forEach( m=> {
                
                    const handler = (value) => {

                        if (debug)
                            console.log('~~~ got event',debugId, m.event,value)

                        setChildProps( prev => {
                            prev[m.prop] = typeof transform === 'function' ? transform(value) : value
                            return clone(prev)
                        })
                    }
                    
                    observer.on(m.event, handler)
                    refHandlers.current.push( {event:m.event, handler})
                    
                })                
            }
            else  if (event && prop) {
                
                const handler = (value) => {
                    if (debug)
                        console.log('~~~ got event',debugId, event,value)

                    setChildProps( prev => {
                        prev[prop] = typeof transform === 'function' ? transform(value) : value
                        return clone(prev)
                    })
                }
                observer.on(event, handler)
                refHandlers.current.push( {event, handler})
            }
            else if (event && onEvent) {            
                observer.on(event, onEvent)        
                refHandlers.current.push( {event, onEvent})                  
            }


            initialized.current = true
        }
        catch(err) {
            const logger = new EventLogger('Incyclist')
            logger.logEvent({message:'error',error:err.message, stack:err.stack})
        }
        
      
    }, [debug, debugId, event, events, mapping, observer, onEvent, prop, props, transform])

    useUnmountEffect( ()=>{
        if (debug)
            console.log('~~~ Dynamic: unmount', debugId, initialized.current, observer)

        refHandlers.current.forEach( h=>{
            const {event,handler} = h
            observer.off( event, handler)
            observer.emit(`${id}:completed`)
            if(debug) {
                console.log('~~~ Dynamic: emit',`${id}:completed`)
            }

        })
        refHandlers.current = []
        
    },[observer])

    if (!children)
        return <></>

    if ( Array.isArray(children)) {
        return children.map ( (child,idx) => {
            const ChildElement = child.type;
            const Child = hidden ? styled(ChildElement)`opacity:0;` : ChildElement

            
            return <Child key={idx} {...child.props}  {...childProps}/>;
        })    
    }
    else {

        if (debug)
            console.log(' ~~~ render Dynamic', debugId, {...children.props , ...childProps})
    
        const ChildElement = children.type;
        const Child = hidden ? styled(ChildElement)`opacity:0;` : ChildElement
        
        return <Child {...children.props} {...childProps}/>;
    }
}


