import React from 'react'
import { FreeRideSummary } from './summary'
import { Card } from '../base/Card'

export const FreeRideCard = (props) => {
    return <Card {...props} Summary={FreeRideSummary} />
}
