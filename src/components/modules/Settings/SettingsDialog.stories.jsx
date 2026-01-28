import React from 'react';
import {SettingsDialogView} from './SettingsDialog';



export default {
  component: SettingsDialogView,
  title: 'Modules/Settings/SettingsDialog',    
  argTypes: { 
    onOK: { action: 'ok' } },
};


const Template = args => <SettingsDialogView {...args} />;

export const Default = Template.bind({});
Default.args = {
}

export const NoGear = Template.bind({});
NoGear.args = {
    noGear: true
}
