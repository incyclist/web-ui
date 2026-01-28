import React from "react"
import EditField from '../base/EditField'
import { copyPropsExcluding } from "../../../../utils/props"


export const EditText = ( props) => {

    const childProps = copyPropsExcluding(props,['onValueChange'])
    if (props.onValueChange)
        childProps.onChange = props.onValueChange
    return (
        <EditField type='text' {...childProps}/>
    )

}


