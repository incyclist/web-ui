import React from 'react'
import { WorkoutSummary } from './summary'
import { Card } from '../base/Card'

export const WorkoutCard = (props) => {
    return <Card {...props} Summary={WorkoutSummary}/>
}
