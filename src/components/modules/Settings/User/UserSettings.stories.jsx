import React from 'react';
import {UserSettingsView} from './UserSettings';



export default {
  component: UserSettingsView,
  title: 'Modules/Settings/UserSettings',    
  argTypes: { 
    onChangeWeight: { action: 'weight changed' },
    onChangeFtp: { action: 'ftp changed' },
    onChangeName: { action: 'name changed'},
    onChangeUnits: { action: 'units changed'}

  },
};


const Template = args => <UserSettingsView {...args} />;

export const Default = Template.bind({});
Default.args = {
}


export const Metric = Template.bind({});
Metric.args = {
  username: 'Test',
  ftp: 200,
  weight: { value: 75, unit:'kg'},
  units:'Metric',
  unitsOptions: ['Metric','Imperial']

}
