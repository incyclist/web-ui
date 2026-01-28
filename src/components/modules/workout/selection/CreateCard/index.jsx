import React from 'react'
import { CreateSummary } from './summary'
import { Card } from '../base/Card'

export const WorkoutCreateCard = (props) => {
    return <Card {...props}   Summary={CreateSummary} />
}
