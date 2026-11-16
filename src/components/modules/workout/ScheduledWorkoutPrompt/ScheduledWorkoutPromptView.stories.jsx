import React from 'react'
import { ScheduledWorkoutPromptView } from './ScheduledWorkoutPromptView'

export default {
    component: ScheduledWorkoutPromptView,
    title: 'Modules/Workout/ScheduledWorkoutPromptView',
    argTypes: {
        onYes: { action: 'yes' },
        onNo: { action: 'no' },
        onCheckWorkouts: { action: 'check workouts' },
    },
}

const Template = args => <ScheduledWorkoutPromptView {...args} />

export const Default = Template.bind({})
Default.args = { title: 'Sweet Spot 3x12' }

export const LongTitle = Template.bind({})
LongTitle.args = { title: 'Over-Unders with a very long descriptive title that needs to wrap onto a second line 4x15' }
