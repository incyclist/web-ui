import React from 'react'
import { VideoSummary } from './summary'
import { Card } from '../base/Card'

export const VideoCard = (props) => {
    const width = props.width ?? 280
    const height = Math.max(510, typeof props.height === 'number' ? props.height : 0)
    return <Card {...props} width={width} height={height} Summary={VideoSummary} />
}
