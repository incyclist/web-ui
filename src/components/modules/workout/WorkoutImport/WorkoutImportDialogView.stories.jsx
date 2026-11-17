import React from 'react'
import { WorkoutImportDialogView } from './WorkoutImportDialogView'

export default {
    component: WorkoutImportDialogView,
    title: 'Modules/Workout/WorkoutImportDialogView',
    argTypes: {
        onClose: { action: 'close' },
        onFiles: { action: 'files' },
        onPickAnother: { action: 'pick another' },
        onSetGroup: { action: 'set group' },
    },
}

const Template = args => <WorkoutImportDialogView {...args} />

export const Landing = Template.bind({})
Landing.args = { displayProps: { phase: 'landing', knownGroups: [] } }

export const Importing = Template.bind({})
Importing.args = { displayProps: { phase: 'importing', knownGroups: [], importing: { fileName: 'sweet-spot.zwo' } } }

export const Result = Template.bind({})
Result.args = {
    displayProps: {
        phase: 'result',
        knownGroups: ['My Workouts', 'Intervals', 'Endurance'],
        result: { id: 'w1', workoutName: 'Sweet Spot 3x12', group: 'My Workouts' },
    },
}

export const ErrorParse = Template.bind({})
ErrorParse.args = { displayProps: { phase: 'error', knownGroups: [], error: 'invalid file format xml' } }

export const ErrorMultipleFiles = Template.bind({})
ErrorMultipleFiles.args = { displayProps: { phase: 'error', knownGroups: [], error: 'Only one workout file at a time' } }
