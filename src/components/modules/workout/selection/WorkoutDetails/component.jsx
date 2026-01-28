import React, { useEffect, useState } from "react"
import { Button, ButtonBar, CheckBox, Column, Divider, EditNumber, EditText, Row, SingleSelect, Text } from "../../../../atoms"
import styled from "styled-components"
import { Dialog,WorkoutGraph } from "../../../../molecules"

const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
    width: calc(100% - 0.8vw);
    padding-left:0.4vw;
    padding-right:0.4vw;
`


export const WorkoutDetails = ({title,workout,ftp, ftpRequired, useErgMode, duration,stress,canStart,canStartWorkoutOnly, category, categories,
    onStart, onSelect,onCancel, onCategorySelected, date})=>{

    const [dialogState,setDialogState] = useState(null)
    const [initialized,setInitialized] = useState(false)

    const [state,setState] = useState( {ftp,useErgMode,categories, category, showCategoryEdit:false})
    const isScheduled = !!date

    const dateStr = date?.toLocaleDateString()

    useEffect( ()=>{
        if (initialized)
            return
        setInitialized(true)
        
    },[initialized])
    useEffect(() => {
        if (dialogState===null)
            setDialogState('open')
        
    }, [dialogState]);

    const close = async () =>{
        setInitialized(false)
        setDialogState('closed')
        await new Promise(done => process.nextTick(()=>{done()}))
    }

    
    const onStartClicked = ()=>{
        if (onStart)
            onStart({ftp:state.ftp,useErgMode:state.useErgMode})

    }

    const onStartWorkoutClicked = () => {
        if (onStart)
            onStart({ftp:state.ftp,useErgMode:state.useErgMode, noRoute:true})
    }    

    const onSelectClicked = ()=>{
        if (onSelect)
            onSelect({ftp:state.ftp??200,useErgMode:state.useErgMode})

    }
    const onCancelClicked = async () =>{
        await close()
        process.nextTick(()=>{
            if (onCancel) {
                onCancel()
            }
    
        })


    }

    const onFTPChanged = (newValue) => {
        setState( current => ({...current,ftp:newValue}))
    }
    const onERGModeChanged = (newValue) => {
        setState( current => ({...current,useErgMode:newValue}))
    }
    const onCategoryChanged = (newValue) => {


        if (newValue==='Add new Category') {
            setState( current => ({...current,showCategoryEdit:true}))
        }
        else {
            setState( current => ({...current,category:newValue}))
            if (onCategorySelected) {
                onCategorySelected(newValue,false)
            }
    
        }       
    }
    const onCancelAddCategory = (newValue) => {        
        setState( current => ({...current,showCategoryEdit:false}))
    }
    const onAddCategory = (newValue) => {        

        if (!newValue?.length) {            
            onCancelAddCategory()
            return;
        }
        
        setState( current => {
            const categories = current.categories
            categories.push(newValue)
            return {...current,categories, category:newValue,showCategoryEdit:false}
        })
        if (onCategorySelected) {
            onCategorySelected(newValue,true)
        }
    }
    
    const categoryList = [...state.categories??[]]
    categoryList.push( 'Add new Category')
    const styling = {labelWidth:'12ch',labelPosition:'before'  }

    return (
        <Dialog id='WorkoutDetails' log={{title:workout?.name}} title={title||workout.name||'Workout Details'} /*onOutsideClicked={onUserCancel}*/ width="80vw" height="80vh" zIndex={100} onESC={onCancelClicked}>
            <ContentArea>
                <Row margin='0.5vh 0 0.5vh 0'>{workout.description}</Row>
                <Divider width='95%' />
                <Text margin='0.5vh 0 0 0 ' {...styling} label='Duration' text={duration||'unknown'} />
                {stress!==undefined? <Text {...styling} label='Stress' text={stress||'unknown'} />:null}
                {ftpRequired ? <EditNumber {...styling} label='FTP' value={state.ftp??200} digits={0} min={0} max={999} onValueChange={onFTPChanged} /> : null}


                {isScheduled ? <Text {...styling} label='Date' text={dateStr} /> : 
                    state.showCategoryEdit ? 
                        <EditText {...styling} label='Category' value=''  onValueChange={onAddCategory}/>
                    :
                        <SingleSelect {...styling} label='Category'  value={state.category} options={categoryList} onValueChange={onCategoryChanged} />
                }
                    
                
                <CheckBox {...styling} label='Use ERG Mode'  value={state.useErgMode} onValueChange={onERGModeChanged} />
                
                <Row height='100%' width='100%' className="graph"> 
                    <WorkoutGraph workout={workout} ftp={state.ftp??200} />
                </Row>
            </ContentArea>
            <ButtonBar justify='center'>
                {canStart ? 
                    <Button primary={true} text='Start' onClick = { onStartClicked}/> : 
                    <Button primary={true} text='Select' onClick = { onSelectClicked}/>
                }
                {canStartWorkoutOnly ? <Button primary={true} text='Start without route' onClick = { onStartWorkoutClicked}/> : null}
                <Button text='Cancel' primary={false} onClick = { onCancelClicked}/>
            </ButtonBar>

        </Dialog>
    )

}