import React,{useEffect, useRef, useState} from "react"
import styled from "styled-components"
import { EventLogger } from "gd-eventlog"
import { Column, Row } from "../../layout/View"
import { ErrorText } from "../../ErrorText";
import { copyPropsExcluding } from "../../../../utils/props";

export const innerMargin = (position,{labelPosition,innerMargin='0.4vw'}) => {
    
    if (position==='right' && labelPosition==='before') {        
        return innerMargin
    }
    if (position==='left' && labelPosition==='after') {
        return innerMargin
    }
}

const View = styled(Column)`
    padding-bottom: 1vh;    
`

const Input = styled.input`
    display: inline-block;
    align-items: center;
    font-size: inherit;
    text-align: ${props => props.align};
    width:${ props=>props.fontSize};
    height:${ props=>props.fontSize};
`
//     margin-left: 1vw
export const Label = styled.label`
    display: inline-block;
    align-items: center;
    width: ${props=>props.labelWidth};
    margin-right: ${ props=> innerMargin('right',props)};
    margin-left: ${ props=> innerMargin('left',props)};
`

const Container = styled(Row)`
    text-align: ${props=> props.textAlign||'left'};
    align-items: center;
    font-size: ${ props=>props.fontSize}    

`

const EditField = ( props) => {

    const {name,timeout, label,type,disabled=false, maxLength, value: valueProp, onChange,onTimeout,validate,checkInput,align='left',
            labelPosition='after',labelWidth, innerMargin='0.4vw', unit
        } =props

    const [errorText,setErrorText] = useState()
    const [value,setValue] = useState(valueProp===undefined?'':valueProp)
    const childProps = copyPropsExcluding(props,['onTimeout','onValueChange'])
    delete childProps.label
    delete childProps.onChange

    const id = name || `textedit-${label}`
    const logger = new EventLogger('Incyclist')
    const to = useRef()

    useEffect( ()=>{
        setValue(valueProp)
    },[valueProp])
    const onError = (error) =>{
        setErrorText(error)
    }

    const clearError = ()=>{
        setErrorText(null)
    }

    const onTimeoutHandler = (val)=>{
        if (onTimeout)
            onTimeout(val)
    }

    const onChangeHandler = (userInput,focusLost)=> {
        let updated = userInput

        if (timeout && onTimeout) {
            if (to.current)
                clearTimeout(to.current)

            to.current = setTimeout(()=>{
                onTimeoutHandler(userInput)
            } ,timeout)
        }
        
        if (checkInput) {
            updated = checkInput(userInput)
            if (updated===null) {
                if (value===null)
                    setValue('')
                return;
            }
        }

        if (focusLost) {
            if (to.current)
                clearTimeout(to.current)
            if (validate) {
                const error = validate(userInput)
                if (error) {
                    onError(error)        
                    return;
                }
            }

            const logValue = type === 'password' ? '***' : updated

            if ((updated??'')!==(props.value??''))
                logger.logEvent( {message: 'text entered',field:label,value: logValue, eventSource:'user' })

            if (onChange){  
                onChange(updated)        
            }
    
        }

        setValue(updated)

        if (errorText) {
            clearError()
        }

    }
    
    return (
        <View>
            <Container {...childProps}> 
            { (labelPosition ==='before') ? <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin} htmlFor={id} >{label}</Label>:null }
    
            <Input type={type} align={align} disabled={disabled} size={maxLength} value={value} 
                onBlur={ (e)=> { onChangeHandler( e.target.value, true) }} 
                onChange={(e)=> { onChangeHandler( e.target.value, false) }} />

            { (labelPosition ==='after') ? <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin}  htmlFor={id} >{label}</Label>:null }
            { unit ? <Label labelPosition='after' innerMargin={innerMargin}  htmlFor={id} >{unit}</Label>:null }

            </Container>

            {errorText ? <ErrorText text={errorText} />: null}
        </View>
    )

}


export default EditField