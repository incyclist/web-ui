import React from 'react'
import { WorkoutsScreen } from './screen'

export default {
    component: WorkoutsScreen,
    title: 'Pages/Workouts',
    argTypes: {
        onOK: { action: 'OK' },
        onDelete: { action: 'delete' },
        onImportWorkout: { action: 'import workout' },
        onDropFiles: { action: 'drop files' },
    },
}

const cardSize = { width: 200, height: 300, padding: 0 }
const responsive = {
    0: { items: 1 },
    400: { items: 2 },
    600: { items: 3 },
    800: { items: 4 }
}
const Template = args => <WorkoutsScreen {...args} width={800} height={600} cardSize={cardSize} responsive={responsive} />

const noObserver = { on: () => {}, off: () => {} }

const workout = (id, title, extra = {}) => ({
    id, cardType: 'Workout',
    props: { title, duration: '60min', visible: true, canDelete: true, ...extra }
})

const myWorkouts = {
    id: 'myWorkouts', title: 'My Workouts', observer: noObserver,
    cards: [
        { id: 'Create', cardType: 'WorkoutCreate', props: { title: 'Create Workout', visible: true } },
        workout('w1', 'Sweet Spot'),
    ]
}

const scheduled = {
    id: 'scheduled', title: 'Scheduled', observer: noObserver,
    cards: [
        { id: 's1', cardType: 'ScheduledWorkout', props: { title: 'Sweet Spot', duration: '60min', date: new Date(), isToday: true, visible: true } },
        { id: 's2', cardType: 'ScheduledWorkout', props: { title: 'VO2 Repeats', duration: '35min', date: new Date(Date.now() + 86400000 * 3), isToday: false, visible: true } },
    ]
}

export const Default = Template.bind({})
Default.args = { lists: [myWorkouts] }

export const WithScheduled = Template.bind({})
WithScheduled.args = { upcoming: scheduled, lists: [myWorkouts] }

export const Empty = Template.bind({})
Empty.args = { lists: [] }
