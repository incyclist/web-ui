import React from 'react'
import { UploadSummary } from './summary'
import { Card } from '../base/Card'

export const UploadCard = (props) => {
    return <Card {...props}   Summary={UploadSummary} />
}
