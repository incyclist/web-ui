import React, { useEffect, useRef, useState } from "react"
import { useRideDisplay } from "incyclist-services"
import styled from "styled-components"

import { WorkoutRideGraph } from "../../../../molecules"
import { Column, Row } from "../../../../atoms"

const View = styled(Column)`
    width:100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
`

const GraphArea = styled(Row)`
    width: 96vw;
    height: 68vh;
    top: 30vh;
    left: 2vw;
    position: absolute;
`

export const WorkoutRideView = () => {


    const [state,setState] = useState({})
    const [initialized,setInitialized] = useState(false)
    const refObserver = useRef(undefined)
    const service = useRideDisplay()

    useEffect( ()=>{
        if (initialized)
            return;

        const updateState = ()=> {
            const user = service.activity?.user??{}
            const ftp = user.ftp
            setState({activity:service.activity,ftp, ts:Date.now()})
        }

        const observer = refObserver.current = service.getObserver()

        observer.on('state-update',(state)=>{
            if ( (state==='Started' || state==='Active') && !initialized) {
                setInitialized( true)
                updateState()
            }
            
        }).on('data-update',()=>{
            updateState()
        })

        setInitialized( true)
        updateState()

    },[initialized, service])


    return (
        <View background="black" position='relative'>

            <GraphArea>
                { initialized ? <WorkoutRideGraph {...state}   /> : null}
            </GraphArea>

            
        </View>
    )
}