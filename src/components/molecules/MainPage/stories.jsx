import React from 'react';

import MainPage from './index';
import { NavigationBar } from '../NavigationBar';

import Theme, { newUITheme } from '../../../theme';
import { MemoryRouter } from 'react-router';
Theme.add('newUITheme',newUITheme)
Theme.select('newUITheme')

export default {
  component: MainPage,
  title: 'molecules/MainPage',
  argTypes: { onDrop: { action: 'dropped' } },
};


const Template = args => <MemoryRouter><MainPage {...args}><NavigationBar/></MainPage>;</MemoryRouter>

export const Default = Template.bind({});
Default.args = {};
