import React from 'react'
import { MemoryRouter } from 'react-router'
import { Workout } from 'incyclist-services'
import { WorkoutsScreen } from './screen'

export default {
    component: WorkoutsScreen,
    title: 'Pages/Workouts',
    decorators: [Story => <MemoryRouter><Story /></MemoryRouter>],
    argTypes: {
        onOK: { action: 'OK' },
        onCreateWorkout: { action: 'create workout' },
        onDelete: { action: 'delete' },
        onDisplayTypeSelected: { action: 'displayTypeSelected' },
        onImportWorkout: { action: 'import workout' },
        onDropFiles: { action: 'drop files' },
    },
}

const makeWorkout = (id, name, steps) => new Workout({ id, name, type: 'workout', steps })

const sweetSpot = makeWorkout('w1', 'Sweet Spot Base', [
    { type: 'step', duration: 300, power: { min: 45, max: 65, type: 'pct of FTP' }, steady: false, work: true, cooldown: false },
    { type: 'step', duration: 900, power: { max: 88, type: 'pct of FTP' }, steady: true, work: true, cooldown: false },
    { type: 'step', duration: 300, power: { max: 55, type: 'pct of FTP' }, steady: true, work: false, cooldown: false },
    { type: 'step', duration: 900, power: { max: 90, type: 'pct of FTP' }, steady: true, work: true, cooldown: false },
    { type: 'step', duration: 300, power: { min: 40, max: 65, type: 'pct of FTP' }, steady: false, work: true, cooldown: true },
])

const vo2Repeats = makeWorkout('w2', 'VO2 Max 5x3min', [
    { type: 'step', duration: 300, power: { max: 55, type: 'pct of FTP' }, steady: true, work: true, cooldown: false },
    {
        type: 'segment',
        repeat: 5,
        steps: [
            { type: 'step', duration: 180, power: { max: 118, type: 'pct of FTP' }, steady: true, work: true, cooldown: false },
            { type: 'step', duration: 180, power: { max: 50, type: 'pct of FTP' }, steady: true, work: false, cooldown: false },
        ]
    },
    { type: 'step', duration: 300, power: { min: 40, max: 60, type: 'pct of FTP' }, steady: false, work: true, cooldown: true },
])

const recoverySpin = makeWorkout('w3', 'Active Recovery Spin', [
    { type: 'step', duration: 1800, power: { max: 52, type: 'pct of FTP' }, steady: true, work: false, cooldown: false },
])

const overUnders = makeWorkout('w4', 'Threshold Over-Unders with a Longer Title for Wrapping', [
    { type: 'step', duration: 360, power: { min: 50, max: 75, type: 'pct of FTP' }, steady: false, work: true, cooldown: false },
    {
        type: 'segment',
        repeat: 4,
        steps: [
            { type: 'step', duration: 120, power: { max: 95, type: 'pct of FTP' }, steady: true, work: true, cooldown: false },
            { type: 'step', duration: 60, power: { max: 108, type: 'pct of FTP' }, steady: true, work: true, cooldown: false },
        ]
    },
])

const Template = args => <WorkoutsScreen {...args} />

const noObserver = { on: () => {}, off: () => {} }

const workout = (id, title, duration, wo, extra = {}) => ({
    id,
    cardType: 'Workout',
    props: { title, duration, workout: wo, ftp: 220, visible: true, canDelete: true, ...extra }
})

const myWorkouts = {
    id: 'myWorkouts',
    title: 'My Workouts',
    observer: noObserver,
    cards: [
        { id: 'Create', cardType: 'WorkoutCreate', props: { title: 'Create Workout', visible: true } },
        workout('w1', 'Sweet Spot Base', '45min', sweetSpot),
        workout('w2', 'VO2 Max 5x3min', '40min', vo2Repeats),
        workout('w3', 'Active Recovery Spin', '30min', recoverySpin, { canDelete: false }),
    ]
}

const ftpBuilder = {
    id: '1:FTP Builder',
    title: 'FTP Builder',
    observer: noObserver,
    cards: [
        workout('w4', 'Threshold Over-Unders with a Longer Title for Wrapping', '48min', overUnders),
        workout('w5', 'Tempo Cruise', '60min', sweetSpot),
    ]
}

const scheduled = {
    id: 'scheduled',
    title: 'Scheduled Workouts',
    observer: noObserver,
    cards: [
        {
            id: 's1',
            cardType: 'ScheduledWorkout',
            props: { title: 'Sweet Spot Base', duration: '45min', workout: sweetSpot, ftp: 220, date: new Date(), isToday: true, visible: true }
        },
        {
            id: 's2',
            cardType: 'ScheduledWorkout',
            props: { title: 'VO2 Max 5x3min', duration: '40min', workout: vo2Repeats, ftp: 220, date: new Date(Date.now() + 86400000 * 3), isToday: false, visible: true }
        },
    ]
}

export const Default = Template.bind({})
Default.args = { loading: false, displayType: 'tiles', lists: [myWorkouts] }

export const WithScheduled = Template.bind({})
WithScheduled.args = { loading: false, displayType: 'tiles', upcoming: scheduled, lists: [myWorkouts, ftpBuilder] }

export const ListView = Template.bind({})
ListView.args = { loading: false, displayType: 'list', upcoming: scheduled, lists: [myWorkouts, ftpBuilder] }

export const Loading = Template.bind({})
Loading.args = { loading: true, displayType: 'tiles', lists: [] }

export const Empty = Template.bind({})
Empty.args = { loading: false, displayType: 'tiles', lists: [] }
