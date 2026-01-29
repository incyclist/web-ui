import React, { useState } from 'react'
import { Button, ButtonBar, Column, EditNumber, EditText, ErrorBoundary, Row, SingleSelect, Text } from '../../../atoms'
import styled from 'styled-components'
import { Dialog } from '../../../molecules'

const ContentArea = styled(Column)`
height: calc(100% - 7.7vh);
`
export const CoachEdit = ({name,type,power,speed,lead,onOK, onCancel}) => {

    const [state,setState] = useState({name,type,power,speed,lead})

    const editProps = {
        labelPosition:'before', 
        labelWidth:'10ch',
        margin:'0 0 0.5vh 0.5vw',
        
    }
    const modes = ['Power', 'Speed']

    const onOKHandler = ()=> {
        if (onOK)
            onOK(state)
    }

    const onModeChanged = (selected) => {
        setState( current => ({...current,type:selected }))
    }

    const onNameChanged = (name) => {
        setState( current => ({...current,name }))
    }

    const onPowerChanged = (power) => {
        setState( current => ({...current,power }))
    }
    const onSpeedChanged = (speed) => {
        if (state.speed?.unit) {
            const  updated = {...state.speed, value:speed}
            setState( current => ({...current,speed:updated}))
        }
        else {
            setState( current => ({...current,speed}))
        }
        
    }
    const onLeadChanged = (lead) => {
        if (state.lead?.unit) {
            const  updated = {...state.lead, value:lead}
            setState( current => ({...current,lead:updated}))
        }
        else {
            setState( current => ({...current,lead: lead===undefined?undefined:lead*1000}))
        }
        
    }

    const getMode = ()=> {
        try {
            if (!state?.type)
                return;

            if ( state.type.toLowerCase()==='power') return 'Power'
            if ( state.type.toLowerCase()==='speed') return 'Speed'
        }
        catch(err) {
            return;
        }
    }

    const getLead = () => {
        const {lead} = state
        try {
            if (lead===undefined)
                return ''
            if (typeof lead ==='number')
                return Number(state.lead/1000).toFixed(2)
            if (lead.value!==undefined && lead.unit)
                return lead.value.toFixed(2)

        }
        catch { /*ignore */ }
        return ''
    }
    const getSpeed = () => {
        const {speed} = state
        try {
            if (speed.unit)
                return speed.value===undefined ? '' : speed.value.toFixed(1)
            
            return speed
        }
        catch { /*ignore */ }
        return ''
    }

    const getLeadUnit =() =>{

        return state.lead?.unit ??'km'
    }
    const getSpeedUnit =() =>{
        return state.speed?.unit??'km/h'
    }

    const isComplete = state.type!==undefined  && 
        ( (getMode()==='Power' && state.power!==undefined) || 
          (getMode()==='Speed' && state.speed!==undefined) )
    
    return (
        <ErrorBoundary>
            <Dialog title='Coach Setting' level={6} onESC={onCancel}>

                <ContentArea>
                    <EditText label='Name' value={name||''} onChange={onNameChanged} {...editProps} />
                    <SingleSelect label='Mode' options={modes} selected={getMode()} {...editProps}
                        onValueChange={onModeChanged}
                        />
                    {getMode()==='Power' ? <Row><EditNumber label='Power' value={ state.power} unit='W' allowEmpty onValueChange={onPowerChanged} align='right' min={25} max={2000} maxLength={4} {...editProps} /> </Row>:null}
                    {getMode()==='Speed' ? <Row><EditNumber label='Speed' value={getSpeed()} unit={getSpeedUnit()} allowEmpty onValueChange={onSpeedChanged} align='right' min={1} max={60} maxLength={5} {...editProps} /></Row>:null}
                    {getMode()!==undefined ? <Row><EditNumber label='Lead' value={getLead()} unit={getLeadUnit() } allowEmpty onValueChange={onLeadChanged} align='right' min={-100} max={100} maxLength={5} {...editProps} /></Row>:null}

                </ContentArea>

                <ButtonBar justify='center'>
                    <Button text='OK' primary={isComplete} onClick={onOKHandler} disabled={!isComplete}> </Button>
                    <Button text='Cancel' onClick={onCancel}></Button>
                </ButtonBar>
            </Dialog>
        </ErrorBoundary>
    )
}