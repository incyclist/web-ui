import React from 'react';
import {WorkoutButton} from './WorkoutButton';
import { Row, SettingsIcon } from '../../../atoms';
import { MoveToEndIcon } from '@primer/octicons-react';

export default {
    component: WorkoutButton,
    title: 'Molecules/Buttons/Workout',
    
  };
const Template = args => <Row background='grey'> <WorkoutButton {...args} /></Row>


export const Default = Template.bind({});
Default.args = {
    id: 'turn',
    image: 'images/u-turn.svg',
    hotkey: '↓',
    borderColor: 'white',
    size:60  
}

export const Red = Template.bind({});
Red.args = {...Default.args, color:'red'}

export const GreenBg = Template.bind({});
GreenBg.args = {...Default.args, background: 'green'}

const TemplateWithChild = args => <Row background='grey'> <WorkoutButton {...args} ><SettingsIcon/></WorkoutButton></Row>
export const Child = TemplateWithChild.bind({});
Child.args = {
    id: 'turn',
    hotkey: 'ESC',
    color:'yellow'
}

export const Text = Template.bind({});
Text.args = {...Default.args, image:null, text:'+5%', hotkey:'Shift+↑'}

const TemplateWithOpticon = args => <Row background='grey'> <WorkoutButton {...args} ><MoveToEndIcon/></WorkoutButton></Row>
export const Opticon = TemplateWithOpticon.bind({});
Opticon.args = {
    id: 'next',
    hotkey: '→',
    color:'yellow',
}
