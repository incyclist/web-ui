import React from 'react';
import {WorkoutSettingsView} from './WorkoutSettingsView';
import { Dialog } from '../../../molecules';
import workout from '../../../../__tests__/testdata/ramp-test.json'


export default {
  component: WorkoutSettingsView,
  title: 'Modules/Settings/Workout',    
  argTypes: { 
    onOK: { action: 'ok' } ,
    onDrop: { action: 'deop' } ,
    onChangeErgMode: { action: 'change ERG Mode' } ,
    onDelete: { action: 'delete' } ,
  }
};


const Template = args => <Dialog><WorkoutSettingsView {...args} /></Dialog>;

const workouts = [
    workout,
    {...workout}
]

workouts[1].name = 'TEST 2'


export const Default = Template.bind({});
Default.args = {
    workout,
    settings: { useErgMode:true, ftp:250}
}

export const NoWorkout = Template.bind({});
NoWorkout.args = {
    noGear: true
}

export const WithFTP = Template.bind({});
WithFTP.args = {
    workout,
    settings: { useErgMode:true, ftp:250}
}
export const NoERG = Template.bind({});
NoERG.args = {
    workout,
    settings: { useErgMode:false}
}

export const MultipleWorkouts = Template.bind({});
MultipleWorkouts.args = {
    workouts
}
