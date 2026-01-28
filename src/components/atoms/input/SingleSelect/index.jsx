import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Row } from "../../layout"
import { Label } from "../base/EditField"
import { EventLogger } from "gd-eventlog"
import { copyPropsExcluding } from "../../../../utils/props"

const View = styled(Row)`
    padding-bottom: 1vh;    
`

const Select = styled.select`
    width:${props => props.width || '10vw'};
`

export const SingleSelect = (props) => {
    const { name,label, options,selected,disabled=false,labelPosition='after',labelWidth, innerMargin='0.4vw',
            selectText,
            onValueChange} = props

    const [value,setValue] = useState(props.value??selected)

    useEffect( ()=> {
        setValue(props.value??selected)
    },[props.value,selected])

    const childProps = copyPropsExcluding(props,['label','onClick','onValueChange','value'])
    if (props.value)
        childProps.selected = props.value
    else
        childProps.selected = '#none#'
    const id = props.id || `check-${label}`
    const logger = new EventLogger('Incyclist')
    
    const pleaseSelect = selectText || 'Please select ..'
    const selectedValue = value??'#none#'

    const onChangeHandler = (updated) => {
        logger.logEvent( {message: 'option selected',field:label||name,value: updated, eventSource:'user' })
        if (updated!=='#none#') {
            setValue(updated)
            if (onValueChange)
                onValueChange(updated)
        }

    }

    return (
    <View {...childProps}>
        { (labelPosition ==='before') ? <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin} htmlFor={id} >{label}</Label>:null }

        <Select id={id} value={selectedValue} disabled={disabled} autoFocus={true}
            onChange={(e)=>{onChangeHandler(e.target.value)}}
            
            >
            { options && !value ? <option key={-1} value={'#none#'}>{pleaseSelect}</option>:null}
            {options ? options.map((option, index) => <option key={index} value={option}>{option}</option>):null}
        </Select>

        { (labelPosition ==='after') ? <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin}  htmlFor={id} >{label}</Label>:null }


    </View>)

}