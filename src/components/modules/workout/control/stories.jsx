import React from 'react';
import {WorkoutControl} from './component';
import { Overlay } from '../../../atoms';

export default {
    component: WorkoutControl,
    
    title: 'Modules/Workout/Control',
    argTypes: { 
        onBackward: { action: 'backward' }, 
        onForward: { action: 'forward' } ,
        onPowerUp: { action: 'powerUp' },
        onPowerDown: { action: 'powerDown' },
        onStop: { action: 'stop' },
        onPin: {action:'pin'},
        onUnpin: {action:'unpin'}
    },
  };

const Template = args => <Overlay padding='0' margin='0' top='10vh'  left='25vw' height='fit-content' width='fit-content'> <WorkoutControl {...args} /></Overlay>
export const Default = Template.bind({});
Default.args = {}

export const Pinned = Template.bind({});
Pinned.args = {pinned:true}


export const SimMode = Template.bind({});
SimMode.args = {mode:'SIM'}

export const ErgMode = Template.bind({});
ErgMode.args = {mode:'ERG'}

// FIXES_BACKLOG #35: load-adjustment button labels reflect what a click will actually do -
// '%' when it scales the Workout FTP, 'W' when it nudges targetPower within the current step's
// power range (services#505). This story simulates being at the bottom edge of a power range
// step, where the down-buttons flip to FTP (%) and the up-buttons stay in-range (W).
export const LoadButtonsInWatt = Template.bind({});
LoadButtonsInWatt.args = {loadButtons:{inc5:'+5W', inc1:'+1W', dec1:'-1%', dec5:'-5%'}}
