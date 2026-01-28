import React from 'react';
import {SupportAreaView} from './component'


export default {
  component: SupportAreaView,
  title: 'Modules/Settings/Support'

};


const Template = args => <SupportAreaView {...args} />;

export const Default = Template.bind({});
Default.args = {
    uuid: '1234-abcde-1234-efgh',
    appVersion:'0.9.5',
    reactVersion: '0.6.30'
}
