import React from 'react';
import { EventLogger,ConsoleAdapter } from 'gd-eventlog';
import InterfaceSettings from '.';

export default {
  component: InterfaceSettings,
  title: 'Modules/Pairing/Interface Settings',
  argTypes: { 
      onClose: { action: 'close' } ,
    },
};


const Template = args => <InterfaceSettings {...args} />;

EventLogger.registerAdapter(new ConsoleAdapter({depth:1}))

export const Serial = Template.bind({});
Serial.args = { 
    name:'serial', 
    protocols: [ 'Daum Classic', 'Daum Premium', 'Kettler Racer'],
    protocol: 'Daum Classic',
    settings: {
        enabled:true
    }
}

export const Ant = Template.bind({});
Ant.args = { 
    name:'ant',     
    settings: {
        enabled:true
    }
}


export const Ble = Template.bind({});
Ble.args = { 
    name:'ble', 
    settings: {
        enabled:true
    }
}

export const Tcpip = Template.bind({});
Tcpip.args = { 
    name:'tcpip', 
    protocols: [ 'Daum Premium'],
    settings: {
        enabled:true
    }
}

