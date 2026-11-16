import React from 'react'
import { useScheduledWorkoutPrompt } from '../../../../hooks/workouts'
import { ScheduledWorkoutPromptView } from './ScheduledWorkoutPromptView'

/** Smart component: shows the "workout scheduled today" prompt when the service says so */
export const ScheduledWorkoutPrompt = ({ enabled = true }) => {
    const { prompt, onYes, onNo, onCheckWorkouts } = useScheduledWorkoutPrompt(enabled)

    if (!prompt) return null

    return <ScheduledWorkoutPromptView title={prompt.title} onYes={onYes} onNo={onNo} onCheckWorkouts={onCheckWorkouts} />
}
