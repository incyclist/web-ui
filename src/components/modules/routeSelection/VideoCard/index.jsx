import React from 'react'
import { VideoSummary } from './summary'
import { VideoDetails } from './details'
import { Card } from '../base/Card'

export const VideoCard = (props) => {
    return <Card {...props} Summary={VideoSummary} Details={VideoDetails}/>
}
