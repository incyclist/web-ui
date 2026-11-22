import React from 'react';
import { Segment, Workout } from 'incyclist-services';
import { ScheduledWorkoutCard } from './index';

export default {
    component: ScheduledWorkoutCard,
    title: 'Modules/WorkoutSelection/ScheduledWorkout',
    argTypes: {
        onOK: { action: 'OK' },
        onDelete: { action: 'delete' },
    },
};

const wo = new Workout({ name: 'Test Workout' });

const s = new Segment({
    repeat: 3,
    steps: [
        { duration: 20, power: { min: 80, max: 100, type: 'pct of FTP' }, steady: true, work: true },
        { duration: 20, power: { min: 100, max: 120, type: 'pct of FTP' }, steady: true, work: true },
        { duration: 20, power: { min: 120, max: 140, type: 'pct of FTP' }, steady: true, work: true }
    ]
});
wo.addSegment(s);

const Template = args => <ScheduledWorkoutCard {...args} />;

const wo1 = new Workout({
    name: 'Test Workout',
    type: 'workout',
    steps: [
        { cooldown: false, duration: 300, power: { max: 50, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: true },
        { cooldown: false, duration: 300, power: { max: 65, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: true },
        { cooldown: false, duration: 300, power: { max: 80, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: true },
        { cooldown: false, duration: 600, power: { max: 75, min: 25, type: 'pct of FTP' }, steady: false, text: '', type: 'step', work: true },
        { cooldown: true, duration: 600, power: { max: 75, min: 25, type: 'pct of FTP' }, steady: false, text: '', type: 'step', work: true },
        { cooldown: false, duration: 300, power: { max: 95, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: true },
        { cooldown: false, duration: 300, power: { max: 110, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: true },
        { cooldown: false, duration: 60, power: { max: 125, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: true },
        { cooldown: false, duration: 600, steady: true, text: '', type: 'step', work: false }
    ]
});

export const Default = Template.bind({});
Default.args = {
    title: 'VO2 Max Repeats',
    duration: '45min',
    isToday: false,
    date: new Date('2025-09-04'),
    visible: true,
    workout: wo1,
    width: 280,
    height: 320,
    ftp: 200
};

export const Today = Template.bind({});
Today.args = {
    title: 'Sweet Spot Intervals',
    date: new Date(),
    isToday: true,
    duration: '60min',
    visible: true,
    workout: wo,
    width: 280,
    height: 320,
    ftp: 200
};

export const ListToday = Template.bind({});
ListToday.args = {
    title: 'Sweet Spot Intervals',
    date: new Date(),
    isToday: true,
    duration: '60min',
    category: 'Scheduled Workouts',
    layout: 'list',
    visible: true,
    workout: wo,
    ftp: 200
};

export const NoWorkout = Template.bind({});
NoWorkout.args = {
    title: 'Test Workout',
    date: new Date('2025-09-04'),
    visible: true,
    width: 280,
    height: 320,
    ftp: 200
};

export const NoFTP = Template.bind({});
NoFTP.args = {
    title: 'Test Workout',
    date: new Date('2025-09-04'),
    duration: '20min',
    visible: true,
    workout: wo,
    width: 280,
    height: 320
};

export const BrokenTitle = Template.bind({});
BrokenTitle.args = {
    title: {},
    date: new Date('2025-09-04'),
    duration: '1:00:00',
    visible: true,
    workout: wo,
    width: 280,
    height: 320,
    ftp: 200
};
