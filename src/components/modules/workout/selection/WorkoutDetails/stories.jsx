import React from 'react';

import {WorkoutDetails} from './component';


//const routeData = route.decoded
//import sydney from '../../../../__tests__/testdata/sydney.json'

export default {
  component: WorkoutDetails,
  title: 'Modules/WorkoutSelection/WorkoutDetails',
  argTypes: { 
    onStart: { action: 'start' } , 
    onSelect: { action: 'select' } , 
    onCancel: { action: 'cancel' },
    onCategorySelected: { action: 'category changed' },
    },
};

const Template = args => <WorkoutDetails {...args} />;

const workout = {"type":"workout","start":0,"end":3600,"duration":3600,"text":"","work":false,"steady":true,"cooldown":false,"steps":[{"type":"step","start":0,"end":600,"duration":600,"power":{"type":"pct of FTP","max":75,"min":35},"text":"","work":false,"steady":false,"cooldown":false},{"type":"step","start":600,"end":3300,"duration":2700,"text":"","work":false,"steady":true,"cooldown":false},{"type":"step","start":3300,"end":3600,"duration":300,"power":{"type":"pct of FTP","min":35,"max":65},"text":"","work":false,"steady":false,"cooldown":true}],"repeat":1,"name":"3x10' FTP 1h","id":"d141700ed84e12579566735e363006e7","description":"cycling at FTP Level"}


export const Default = Template.bind({});
Default.args = {
    workout,
    canStart:false,
    categories:['My Workouts'],
    category: 'My Workouts'

};


export const CanStart = Template.bind({});
CanStart.args = {   
    workout,
    canStart:true
};


export const FTP = Template.bind({});
FTP.args = {
    workout,
    canStart:true,
    ftp:200,
    ftpRequired:true

};

export const FTPUndefined = Template.bind({});
FTPUndefined.args = {
    workout,
    canStart:true,
    ftp:undefined,
    ftpRequired:true

};

export const ErgModeEnabled = Template.bind({});
ErgModeEnabled.args = {
    workout,
    canStart:true,
    ftp:200,
    ftpRequired:true,
    useErgMode: true

};


export const Scheduled = Template.bind({});
Scheduled.args = {
    workout,
    date: new Date('2025-09-04'),
    canStart:true,
    ftp:200,
    ftpRequired:true

};

