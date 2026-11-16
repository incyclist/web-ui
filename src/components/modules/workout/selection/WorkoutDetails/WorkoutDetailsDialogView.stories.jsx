import React from 'react'
import { WorkoutDetailsDialogView } from './WorkoutDetailsDialogView'

export default {
    component: WorkoutDetailsDialogView,
    title: 'Modules/WorkoutSelection/WorkoutDetailsDialogView',
    argTypes: {
        onStart: { action: 'start' },
        onCancel: { action: 'cancel' },
        onDelete: { action: 'delete' },
        onAddRoute: { action: 'add route' },
        onClearRoute: { action: 'clear route' },
        onFtpChange: { action: 'ftp' },
        onErgModeChange: { action: 'erg' },
        onStepChangeAudioSignalChange: { action: 'audio' },
        onGroupChange: { action: 'group' },
    },
}

const Template = args => <WorkoutDetailsDialogView {...args} />

const workout = {"type":"workout","start":0,"end":3600,"duration":3600,"text":"","work":false,"steady":true,"cooldown":false,"steps":[{"type":"step","start":0,"end":600,"duration":600,"power":{"type":"pct of FTP","max":75,"min":35},"text":"","work":false,"steady":false,"cooldown":false},{"type":"step","start":600,"end":3300,"duration":2700,"text":"","work":false,"steady":true,"cooldown":false},{"type":"step","start":3300,"end":3600,"duration":300,"power":{"type":"pct of FTP","min":35,"max":65},"text":"","work":false,"steady":false,"cooldown":true}],"repeat":1,"name":"3x10' FTP 1h","id":"d141700ed84e12579566735e363006e7","description":"cycling at FTP Level"}

const base = {
    workout, title: workout.name, description: workout.description, duration: '60min',
    ftp: 200, ftpRequired: true, useErgMode: true, stepChangeAudioSignal: true,
    group: 'My Workouts', groups: ['My Workouts', 'Intervals'],
    canDelete: true, canAddRoute: true, attachedRoute: null, isScheduled: false,
}

export const NothingAttached = Template.bind({})
NothingAttached.args = { ...base }

export const RouteAttached = Template.bind({})
RouteAttached.args = { ...base, canAddRoute: false, attachedRoute: { id: 'r1', title: "Alpe d'Huez (Video)" } }

export const Scheduled = Template.bind({})
Scheduled.args = { ...base, canDelete: false, isScheduled: true, date: new Date('2026-11-18') }

export const NoFtp = Template.bind({})
NoFtp.args = { ...base, ftpRequired: false }
