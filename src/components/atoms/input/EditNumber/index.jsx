import React from "react"
import EditField from '../base/EditField'


export const EditNumber = ( props) => {

    const {validate,onValueChange,min,max,value,digits, allowEmpty} = props

    const checkDigits = (value) =>{
        if (value===undefined || value===null)
            return ''
        if (digits!==undefined && digits>=0) {
            return Number(value).toFixed(digits)
        }
        return value;
    }

    const checkInput = (value) => {
        if (value?.trim().length===0)
            return undefined;

        if ( !isNaN(Number(value)) )
            return value
        else if ( !isNaN(Number(value.replace(',','.'))) ) {
            return value.replace(',','.')
        }
            return null;

    }

    const onValidate = (value) => {
        let newValue

        if (allowEmpty) {
            if (value===undefined || value===null || (typeof value==='string' && value.trim()==='') )
                return null
        }

        if ( !isNaN(Number(value)) )
            newValue = value
        else if ( !isNaN(Number(value.replace(',','.'))) ) {
            newValue = value.replace(',','.')
        }

        const val = Number(newValue)
        if (min!==undefined && (val<min||value===undefined||value===null||value.length===0 ))
            return max===undefined ? `Value must be > ${min}` :`Value must be between ${min} and ${max}`
        if (max!==undefined && (val>max||value===undefined||value===null||value.length===0 ) )
            return min===undefined ? `Value must be < ${max}` :`Value must be between ${min} and ${max}`
        if (max===undefined && min===undefined && (value===undefined||value===null||value.length===0 ) )
            return `Please enter a number`

        if (validate) {
            return validate(val)            
        }

        return null;        
    }

    const onChangeHandler = (value) => {
        
        if (onValueChange && value!==props.value) {
            const number =  value //checkDigits(value)
            if (number==='' || number===undefined || number===null)
                onValueChange(undefined) 
            else    
                onValueChange( Number(number))
        }
    }

    const childProps = {...props}
    if ( !props.maxLength && max!==undefined) {
        childProps.maxLength = max.toString().length
    }

    return (
        <EditField type='text' {...childProps} value={checkDigits(value)} checkInput={checkInput} validate={onValidate} 
            onChange={onChangeHandler}
        
        />
    )

}


