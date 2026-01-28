
import React from 'react';
import {CoachEdit} from './component';

export default {
  component: CoachEdit,
  title: 'Coaches/Edit',
  argTypes: { 
    onOK: { action: 'ok' },
    onCancel: { action: 'cancel' } 
  },
};
 
const Template = args => <div style={{width:'600px', height:'400px'}}><CoachEdit {...args} /></div>

export const Default = Template.bind({});

const DefaultCoaches = [ 
  { name:'Power ', power:200},  
  { name:'Speed', speed: 30},
  { name:'Power and Speed', power:150, speed:28},
  { name:'With Lead', power:220, routeDistance:500},  
]



Default.args = {}

export const EditPower = Template.bind({})
EditPower.args = {
  name: '100W Coach',
  type:'Power',
  power:100

}

export const EditPowerWithLead = Template.bind({})
EditPowerWithLead.args = {
  name: '100W Coach',
  type:'Power',
  power:100,
  lead: 500
}

export const EditSpeed = Template.bind({})
EditSpeed.args = {
  name: '30m/h Coach',
  type:'Speed',
  speed:30

}

export const EditSpeedWithLead = Template.bind({})
EditSpeedWithLead.args = {
  name: '30m/h Coach',
  type:'Speed',
  speed:30,
  lead: -1000
}
