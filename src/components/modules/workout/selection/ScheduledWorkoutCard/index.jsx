import React from 'react'
import { ScheduledWorkoutSummary } from './summary'
import { Card } from '../base/Card'

export const ScheduledWorkoutCard = (props) => {
    return <Card {...props} Summary={ScheduledWorkoutSummary}/>
}
