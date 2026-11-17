import React from 'react'
import { Workout } from 'incyclist-services'
import { WorkoutImportDialogView } from './WorkoutImportDialogView'

const workout = new Workout({
    id: 'sweet-spot-3x12',
    name: 'Sweet Spot 3x12',
    type: 'workout',
    steps: [
        { type: 'step', duration: 600, power: { max: 55, type: 'pct of FTP' }, steady: true, work: false, cooldown: false, text: '' },
        { type: 'step', duration: 720, power: { max: 90, type: 'pct of FTP' }, steady: true, work: true, cooldown: false, text: '' },
        { type: 'step', duration: 300, power: { max: 55, type: 'pct of FTP' }, steady: true, work: false, cooldown: false, text: '' },
        { type: 'step', duration: 720, power: { max: 90, type: 'pct of FTP' }, steady: true, work: true, cooldown: false, text: '' },
        { type: 'step', duration: 300, power: { max: 55, type: 'pct of FTP' }, steady: true, work: false, cooldown: false, text: '' },
        { type: 'step', duration: 720, power: { max: 90, type: 'pct of FTP' }, steady: true, work: true, cooldown: false, text: '' },
        { type: 'step', duration: 600, power: { max: 50, type: 'pct of FTP' }, steady: true, work: false, cooldown: true, text: '' },
    ],
})

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

// success header, category and the workout graph
export const Result = Template.bind({})
Result.args = {
    displayProps: {
        phase: 'result',
        knownGroups: ['My Workouts', 'Intervals', 'Endurance'],
        result: { id: 'w1', workoutName: 'Sweet Spot 3x12', group: 'My Workouts', workout, ftp: 250 },
    },
}

// no workout in the props (older services): centred status panel
export const ResultWithoutGraph = Template.bind({})
ResultWithoutGraph.args = {
    displayProps: {
        phase: 'result',
        knownGroups: ['My Workouts', 'Intervals', 'Endurance'],
        result: { id: 'w1', workoutName: 'Sweet Spot 3x12', group: 'My Workouts' },
    },
}

export const ResultCategoryPreselected = Template.bind({})
ResultCategoryPreselected.args = {
    displayProps: {
        phase: 'result',
        knownGroups: ['My Workouts', 'Intervals', 'Endurance'],
        result: { id: 'w1', workoutName: 'Sweet Spot 3x12', group: 'Intervals', workout, ftp: 250 },
    },
}

export const ErrorParse = Template.bind({})
ErrorParse.args = { displayProps: { phase: 'error', knownGroups: [], error: 'invalid file format xml' } }

export const ErrorMultipleFiles = Template.bind({})
ErrorMultipleFiles.args = { displayProps: { phase: 'error', knownGroups: [], error: 'Only one workout file at a time' } }
