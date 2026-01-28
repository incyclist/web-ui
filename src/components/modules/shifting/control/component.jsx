import React from 'react'
import { Row } from "../../../atoms"
import { WorkoutButton } from '../../../molecules/Buttons'
import { PinIcon, PinSlashIcon } from '@primer/octicons-react'

export const ShiftingControl = ( {
    onPowerUp, onPowerDown,
    showHotkeys,
    pinned, onPin, onUnpin,
    justify,
    }) => {

    const onInc = (val) => {
        if (onPowerUp)
            onPowerUp(val)
    }
    const onDec = (val) => {
        if (onPowerDown)
            onPowerDown(val)
    }

    const common = {size:40, color:'white', background:'black', opacity:0.5, showHotkey:showHotkeys}

    return (
        <Row justify={justify}>
            <WorkoutButton {...common} id='dec5' hotkey='Shift+↓' text='-5' onClick={()=>onDec(5)}/>
            <WorkoutButton {...common} id='dec1' hotkey='↓' text='-1'onClick={()=>onDec(1)}/>
            <WorkoutButton {...common} id='inc1' hotkey='↑' text='+1' onClick={()=>onInc(1)}/>
            <WorkoutButton {...common} id='inc5' hotkey='Shift+↑' text='+5' onClick={()=>onInc(5)}/>
            {pinned ? 
                <WorkoutButton {...common} id='unpin' onClick={onUnpin}><PinSlashIcon/></WorkoutButton> :
                <WorkoutButton {...common} id='pin' onClick={onPin}><PinIcon/></WorkoutButton>
            }
            
        </Row>
            
    )
}

