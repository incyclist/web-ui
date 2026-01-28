import React from 'react';
import {LoginDialog} from './index';

export default {
  component: LoginDialog,
  title: 'Molecules/Dialogs/Login',
};
 
const Template = args => <div style={{width:'600px', height:'400px'}}><LoginDialog {...args} /></div>

export const Default = Template.bind({});
Default.args = {}

export const WithImage = Template.bind({});
WithImage.args = {logo:'images/velo-white.png'}

export const WithError = Template.bind({});
WithError.args = {error:'Login Failed'}

export const WithUsernameAndPassword = Template.bind({});
WithUsernameAndPassword.args = {user:{username:'test', password:'secret'}}

export const WithSpinner = Template.bind({});
WithSpinner.args = {loading:true}