import React from 'react'
import { WorkoutCategorySelect } from './WorkoutCategorySelect'

export default {
    component: WorkoutCategorySelect,
    title: 'Modules/Workout/WorkoutCategorySelect',
    argTypes: { onChange: { action: 'change' } },
}

const Template = args => <WorkoutCategorySelect {...args} />

export const Default = Template.bind({})
Default.args = { value: 'My Workouts', groups: ['My Workouts', 'Intervals', 'Endurance'] }

export const UnknownValue = Template.bind({})
UnknownValue.args = { value: 'Imported', groups: ['My Workouts'] }
