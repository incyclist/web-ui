import React from 'react';
import { Segment, Workout } from 'incyclist-services';
import { WorkoutCard } from './index';

export default {
    component: WorkoutCard,
    title: 'Modules/WorkoutSelection/Workout',
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

const Template = args => <WorkoutCard {...args} />;

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
        { cooldown: false, duration: 600, steady: true, text: '', type: 'step', work: false },
        {
            type: 'segment',
            repeat: 3,
            text: 'Test Segment',
            steps: [
                { cooldown: false, duration: 60, power: { max: 75, type: 'pct of FTP' }, steady: true, text: 'Gib gas!', type: 'step', work: true },
                { cooldown: false, duration: 300, power: { max: 50, type: 'pct of FTP' }, steady: true, text: '', type: 'step', work: false }
            ]
        }
    ]
});

export const Default = Template.bind({});
Default.args = {
    title: 'Sweet Spot Base',
    duration: '60min',
    visible: true,
    workout: wo1,
    width: 280,
    height: 320,
    ftp: 200
};

export const ListView = Template.bind({});
ListView.args = {
    title: 'Sweet Spot Base',
    duration: '60min',
    category: 'My Workouts',
    layout: 'list',
    visible: true,
    workout: wo1,
    ftp: 200
};

export const NoWorkout = Template.bind({});
NoWorkout.args = {
    title: 'Loading Workout',
    visible: true,
    width: 280,
    height: 320,
    ftp: 200
};

export const NoFTP = Template.bind({});
NoFTP.args = {
    title: 'Test Workout',
    duration: '20min',
    visible: true,
    workout: wo,
    width: 280,
    height: 320
};

export const NotVisible = Template.bind({});
NotVisible.args = {
    title: 'Always Rendered In Grid',
    duration: '1:00:00',
    visible: false,
    workout: wo,
    width: 280,
    height: 320,
    ftp: 200
};

export const BrokenTitle = Template.bind({});
BrokenTitle.args = {
    title: {},
    duration: '1:00:00',
    visible: true,
    workout: wo,
    width: 280,
    height: 320,
    ftp: 200
};
