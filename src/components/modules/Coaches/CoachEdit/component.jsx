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
        setState( current => ({...current,speed}))
    }
    const onLeadChanged = (lead) => {
        setState( current => ({...current,lead:lead*1000}))
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
        try {
            if (state.lead===undefined)
                return ''
            return Number(state.lead/1000).toFixed(2)
        }
        catch(err) {
            return ''
        }
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
                    {getMode()==='Power' ? <Row><EditNumber label='Power' value={ state.power} onValueChange={onPowerChanged} align='right' min={25} max={2000} maxLength={4} {...editProps} /> <Text margin='0 0 0 0.5vw' >W</Text></Row>:null}
                    {getMode()==='Speed' ? <Row><EditNumber label='Speed' value={ state.speed} onValueChange={onSpeedChanged} align='right' min={1} max={60} maxLength={5} {...editProps} /> <Text margin='0 0 0 0.5vw' >km/h</Text></Row>:null}
                    {getMode()!==undefined ? <Row><EditNumber label='Lead' value={getLead()} onValueChange={onLeadChanged} align='right' min={-100} max={100} maxLength={5} {...editProps} /> <Text margin='0 0 0 0.5vw' >km</Text></Row>:null}

                </ContentArea>

                <ButtonBar justify='center'>
                    <Button text='OK' primary={isComplete} onClick={onOKHandler} disabled={!isComplete}> </Button>
                    <Button text='Cancel' onClick={onCancel}></Button>
                </ButtonBar>
            </Dialog>
        </ErrorBoundary>
    )
}