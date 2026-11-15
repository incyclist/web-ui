import React from 'react'
import { CheckBox, Column, Row } from "../../../atoms"

// same wording as in the mobile app
const textMapping = {
    ActivityUpload: 'Activity Upload',
    WorkoutUpload: 'Workout Upload',
    WorkoutDownload: 'Workout Download',
    RouteDownload: 'Route Download',
    ActivityDownload: 'Activity Download'
}

export const OperationsSelector = ({operations, onChanged})=> {

    const onValueChange = ( operation, checked)=> {
        if (onChanged) {
            onChanged(operation,checked)
        }
    }

    const options = operations??[]

    if (!options.length)
        return null

    return <Column>
        {options.map( op=>
            <Row key={op?.operation}>
                <CheckBox label={textMapping[op?.operation] ?? op?.operation} checked={op.enabled}
                    onValueChange={ (checked)=>{onValueChange(op.operation,checked)}}
                    />
            </Row>
        )}
    </Column>
}
