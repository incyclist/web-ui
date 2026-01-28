import React from 'react'
import { CheckBox, Column, Row, Text, View } from "../../../atoms"

export const OperationsSelector = ({operations, onChanged})=> {
    const textMapping = {
        ActivityUpload: 'Upload Activities',
        WorkoutUpload: 'Upload Workouts',
        WorkoutDownload: 'Download Workouts',
        ActivityDownload: 'Download Activities as Routes',
        RouteDownload: 'Download Planned Routes'
    }

    const onValueChange = ( operation, checked)=> {
        if (onChanged) {
            onChanged(operation,checked)
        }
    }

    const options = operations??[]

    if (!options.length)
        return null

    return <View padding='1vh 1vw '>
        <Row >
            <Text>Used to:</Text>
        </Row>
        <Row>
            <Column>
            {options.map( op=>
                <Row>
                    <CheckBox key={op?.operation} label={textMapping[op?.operation]} checked={op.enabled} 
                            onValueChange={ (checked)=>{onValueChange(op.operation,checked)}} 
                            />
                </Row>
            )}
            </Column>
        </Row>

    </View>
}