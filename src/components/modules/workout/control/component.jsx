import React from 'react'
import { Row } from "../../../atoms"
import { WorkoutButton } from '../../../molecules/Buttons'
import { CircleSlashIcon, MoveToEndIcon, MoveToStartIcon, PinIcon, PinSlashIcon } from '@primer/octicons-react'

export const WorkoutControl = ( {
    onBackward, onForward, onStop, onPowerUp, onPowerDown,
    showHotkeys,
    pinned, onPin, onUnpin,
    mode,onToggleMode,
    loadButtons, loadButtonMode
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

    // FIXES_BACKLOG #37: in SIM/Resistance mode with virtual shifting disabled, the load buttons
    // are meaningless (no gear concept, no power target to nudge) - hide just the four load
    // buttons, keep back/forward/stop/mode-toggle/pin visible.
    const showLoadButtons = loadButtonMode!=='hidden'

    return (
        <Row>
            <WorkoutButton {...common} id='back' hotkey='←' onClick={onBackward}><MoveToStartIcon/></WorkoutButton>
            <WorkoutButton {...common} id='forward' hotkey='→' onClick={onForward}><MoveToEndIcon/></WorkoutButton>
            {showLoadButtons && <WorkoutButton {...common} id='inc5' hotkey='Shift+↑' text={loadButtons?.inc5 ?? '+5%'} onClick={()=>onInc(5)}/>}
            {showLoadButtons && <WorkoutButton {...common} id='inc1' hotkey='↑' text={loadButtons?.inc1 ?? '+1%'} onClick={()=>onInc(1)}/>}
            {showLoadButtons && <WorkoutButton {...common} id='dec1' hotkey='↓' text={loadButtons?.dec1 ?? '-1%'}onClick={()=>onDec(1)}/>}
            {showLoadButtons && <WorkoutButton {...common} id='dec5' hotkey='Shift+↓' text={loadButtons?.dec5 ?? '-5%'} onClick={()=>onDec(5)}/>}
            <WorkoutButton {...common} id='stop' hotkey='#' onClick={onStop}><CircleSlashIcon/></WorkoutButton>
            {mode?<WorkoutButton {...common} id='mode' hotkey='C' onClick={onToggleMode} text={mode}/>:null}
            {pinned ?
                <WorkoutButton {...common} id='unpin' onClick={onUnpin}><PinSlashIcon/></WorkoutButton> :
                <WorkoutButton {...common} id='pin' onClick={onPin}><PinIcon/></WorkoutButton>
            }

        </Row>

    )
}

