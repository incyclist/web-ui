import React from 'react';
import { AppLoadingPage } from './loading';

export default {
    component: AppLoadingPage,
    title: 'Pages/Loading',   
  };
  
const Template = args => <AppLoadingPage {...args} />;

export const Default = Template.bind({});
Default.args = {
};
