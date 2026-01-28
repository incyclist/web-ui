import React from 'react';
import {ShiftingControl} from './component';
import { Overlay } from '../../../atoms';

export default {
    component: ShiftingControl,
    
    title: 'Modules/Shifting/Control',
    argTypes: { 
        onBackward: { action: 'backward' }, 
        onForward: { action: 'forward' } ,
        onPowerUp: { action: 'powerUp' },
        onPowerDown: { action: 'powerDown' },
        onPin: {action:'pin'},
        onUnpin: {action:'unpin'}
    },
  };

const Template = args => <Overlay padding='0' margin='0' top='10vh'  left='25vw' height='fit-content' width='fit-content'> <ShiftingControl {...args} /></Overlay>
export const Default = Template.bind({});
Default.args = {}

export const Pinned = Template.bind({});
Pinned.args = {pinned:true}


export const SimMode = Template.bind({});
SimMode.args = {mode:'SIM'}

export const ErgMode = Template.bind({});
ErgMode.args = {mode:'ERG'}
